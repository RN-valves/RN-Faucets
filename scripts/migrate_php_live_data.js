/**
 * Migration Script: Migrate PHP Laravel Live Data into MongoDB
 * 
 * Source: D:\new production code rn\RN-website-php\22september.sql
 * Targets: Local MongoDB and/or MongoDB Atlas Cloud
 * 
 * Migrates:
 *  - users (965 users, profiles, auth credentials, embedded addresses)
 *  - addresses (704 user addresses)
 *  - orders (769 orders + 2,557 order items + 462 transport tracking details)
 *  - enquiries (507 leads / enquiries)
 *  - payments (566 payment gateway records)
 * 
 * STRICT SAFEGUARD:
 *  - Categories, Subcategories, Products, Product Images, and Catalogues
 *    are NEVER modified, overwritten, or deleted.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const projRoot = path.resolve(__dirname, '..');
const mongoose = require(path.join(projRoot, 'node_modules/mongoose'));

const SQL_FILE = 'D:/new production code rn/RN-website-php/22september.sql';

// Helper: parse values tuples from mysqldump multi-row insert statements
function parseTuples(sqlValuesStr) {
  const rows = [];
  let inString = false;
  let escape = false;
  let currentVal = '';
  let currentRow = [];
  let inTuple = false;

  for (let i = 0; i < sqlValuesStr.length; i++) {
    const ch = sqlValuesStr[i];

    if (escape) {
      currentVal += ch;
      escape = false;
      continue;
    }

    if (ch === '\\') {
      escape = true;
      continue;
    }

    if (ch === "'") {
      inString = !inString;
      continue;
    }

    if (inString) {
      currentVal += ch;
      continue;
    }

    if (ch === '(' && !inTuple) {
      inTuple = true;
      currentRow = [];
      currentVal = '';
      continue;
    }

    if (ch === ')' && inTuple) {
      inTuple = false;
      currentRow.push(currentVal.trim() === 'NULL' ? null : currentVal.trim());
      rows.push(currentRow);
      currentVal = '';
      continue;
    }

    if (ch === ',' && inTuple) {
      currentRow.push(currentVal.trim() === 'NULL' ? null : currentVal.trim());
      currentVal = '';
      continue;
    }

    if (inTuple) {
      currentVal += ch;
    }
  }

  return rows;
}

// Stream and parse target tables from SQL file
async function extractSqlTables(tableNames) {
  console.log(`[SQL Stream] Reading ${SQL_FILE}...`);
  const rl = readline.createInterface({
    input: fs.createReadStream(SQL_FILE),
    crlfDelay: Infinity
  });

  const result = {};
  let currentTable = null;
  let currentCols = [];
  let currentValuesText = '';

  for await (const line of rl) {
    if (!currentTable) {
      for (const tbl of tableNames) {
        if (line.startsWith(`INSERT INTO \`${tbl}\``)) {
          currentTable = tbl;
          const openParen = line.indexOf('(');
          const closeParen = line.indexOf(') VALUES');
          const colStr = line.slice(openParen + 1, closeParen);
          currentCols = colStr.split(',').map(c => c.trim().replace(/`/g, ''));
          currentValuesText = line.slice(closeParen + 8);
          break;
        }
      }
    } else {
      currentValuesText += '\n' + line;
    }

    if (currentTable && currentValuesText.trim().endsWith(';')) {
      const rows = parseTuples(currentValuesText);
      result[currentTable] = rows.map(r => {
        const obj = {};
        currentCols.forEach((col, idx) => { obj[col] = r[idx]; });
        return obj;
      });
      console.log(`  ✓ Extracted ${tblNamePad(currentTable)}: ${result[currentTable].length} records`);
      currentTable = null;
      currentCols = [];
      currentValuesText = '';
    }
  }

  return result;
}

function tblNamePad(name) {
  return name.padEnd(16, ' ');
}

// Migrate data into a specific MongoDB database
async function migrateToDatabase(targetName, uri, sqlData, dryRun = false) {
  console.log(`\n======================================================`);
  console.log(`[Database Target: ${targetName}]`);
  console.log(`URI: ${uri.replace(/:([^@]+)@/, ':****@')}`);
  console.log(`Dry Run: ${dryRun ? 'YES (No writes)' : 'NO (Live Upsert)'}`);
  console.log(`======================================================`);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;

  // Strict Catalogue Pre-Check
  const catCountBefore = await db.collection('categories').countDocuments();
  const subCatCountBefore = await db.collection('subcategories').countDocuments();
  const prodCountBefore = await db.collection('products').countDocuments();
  console.log(`[Catalogue Guard] Categories: ${catCountBefore}, Subcategories: ${subCatCountBefore}, Products: ${prodCountBefore}`);

  // Build lookups from SQL
  const stateMap = {};
  (sqlData.states || []).forEach(s => { stateMap[s.id] = s.name; });

  const cityMap = {};
  (sqlData.cities || []).forEach(c => { cityMap[c.id] = c.name; });

  // Load product code -> details map for order item enrichment (Read-only!)
  console.log(`[Read-Only Lookup] Indexing products in MongoDB for order item enrichment...`);
  const mongoProducts = await db.collection('products').find({}, { projection: { code: 1, name: 1, image: 1, gallery: 1 } }).toArray();
  const productLookup = new Map();
  for (const p of mongoProducts) {
    if (p.code) {
      productLookup.set(p.code.trim().toUpperCase(), {
        name: p.name,
        image: p.image || (Array.isArray(p.gallery) && p.gallery[0]) || '/api/media/website/catalogue/products/default/image.webp'
      });
    }
  }
  console.log(`  ✓ Indexed ${productLookup.size} product codes`);

  // 1. Process Addresses
  console.log(`\n[1/5] Processing Addresses...`);
  const addressesByUserId = new Map();
  const addressDocs = (sqlData.user_addresses || []).map(a => {
    const cityName = cityMap[a.city_id] || a.city || '';
    const stateName = stateMap[a.state_id] || a.state || '';
    const legacyId = parseInt(a.id);
    const userId = parseInt(a.user_id);

    const doc = {
      id: `addr-${legacyId}`,
      legacyId: legacyId,
      userId: userId,
      label: a.type || 'Home',
      type: a.type || 'Home',
      name: a.name || '',
      phone: a.mobile || '',
      mobile: a.mobile || '',
      addressLine: a.address || '',
      address: a.address || '',
      city: cityName,
      state: stateName,
      pinCode: a.zipcode || '',
      zipcode: a.zipcode || '',
      country: 'India',
      isDefault: true,
      createdAt: a.created_at ? new Date(a.created_at) : new Date(),
      updatedAt: a.updated_at ? new Date(a.updated_at) : new Date(),
    };

    if (!addressesByUserId.has(userId)) {
      addressesByUserId.set(userId, []);
    }
    addressesByUserId.get(userId).push(doc);

    return doc;
  });

  if (!dryRun && addressDocs.length > 0) {
    const ops = addressDocs.map(doc => ({
      updateOne: {
        filter: { $or: [{ id: doc.id }, { legacyId: doc.legacyId }] },
        update: { $set: doc },
        upsert: true
      }
    }));
    const res = await db.collection('addresses').bulkWrite(ops);
    console.log(`  ✓ Addresses: ${res.upsertedCount} inserted, ${res.modifiedCount} updated (total: ${addressDocs.length})`);
  } else {
    console.log(`  [Dry Run] Prepared ${addressDocs.length} address documents`);
  }

  // 2. Process Users
  console.log(`\n[2/5] Processing Users...`);
  const userDocs = (sqlData.users || []).map(u => {
    const legacyId = parseInt(u.id);
    const userAddresses = addressesByUserId.get(legacyId) || [];
    const cityName = cityMap[u.city_id] || '';
    const stateName = stateMap[u.state_id] || '';

    // Determine normalized user type & role
    let userType = 'Customer';
    if (u.user_type === 'Admin' || u.user_type === 'Super Admin') userType = 'Admin';
    else if (u.user_type === 'Business' || u.profession === 'Dealer' || u.profession === 'Retailer') userType = 'Business';
    else if (u.user_type === 'Employee') userType = 'Employee';

    let role = u.user_type || 'Customer';
    if (userType === 'Admin') role = 'Super Admin';

    return {
      mobile: (u.mobile || '').trim(),
      name: (u.name || '').trim(),
      email: (u.email || '').trim().toLowerCase(),
      userCode: u.user_code || `RN-${(u.uuid || '').slice(0, 8)}-${legacyId}`,
      userType: userType,
      role: role,
      profession: u.profession || 'Consumer',
      gstNumber: u.gst_number || '',
      status: u.status === 'InActive' ? 'InActive' : 'Active',
      approvalStatus: 'Approved',
      emailVerified: true,
      createdBy: u.created_by || 'Admin',
      address: u.address || '',
      city: cityName,
      state: stateName,
      zipcode: u.zipcode || '',
      password: u.local_password || u.mobile || '123456',
      passwordHash: u.password || '',
      localPassword: u.local_password || '',
      local_password: u.local_password || '',
      permissions: userType === 'Admin' ? ['all'] : [],
      remarks: `Imported from legacy PHP system (${u.user_type || 'Customer'})`,
      addresses: userAddresses,
      legacyId: legacyId,
      uuid: u.uuid || '',
      createdAt: u.created_at ? new Date(u.created_at) : new Date(),
      updatedAt: u.updated_at ? new Date(u.updated_at) : new Date(),
    };
  });

  if (!dryRun && userDocs.length > 0) {
    const ops = userDocs.map(doc => ({
      updateOne: {
        filter: {
          $or: [
            { mobile: doc.mobile },
            { legacyId: doc.legacyId },
            ...(doc.userCode ? [{ userCode: doc.userCode }] : [])
          ]
        },
        update: { $set: doc },
        upsert: true
      }
    }));
    const res = await db.collection('users').bulkWrite(ops);
    console.log(`  ✓ Users: ${res.upsertedCount} inserted, ${res.modifiedCount} updated (total: ${userDocs.length})`);
  } else {
    console.log(`  [Dry Run] Prepared ${userDocs.length} user documents`);
  }

  // 3. Process Order Items & Transports Grouping
  console.log(`\n[3/5] Processing Orders & Order Items...`);
  const itemsByOrderId = new Map();
  (sqlData.order_items || []).forEach(item => {
    const orderId = parseInt(item.order_id);
    const code = (item.product_code || '').trim();
    const enriched = productLookup.get(code.toUpperCase());

    const doc = {
      legacyId: parseInt(item.id),
      productId: parseInt(item.product_id) || 0,
      productCode: code,
      code: code,
      name: enriched?.name || code,
      color: item.product_color || 'Standard',
      size: item.product_size || '-',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.total_qty) || 1,
      totalAmount: parseFloat(item.total_amount) || 0,
      image: enriched?.image || '/api/media/website/catalogue/products/default/image.webp',
      createdAt: item.created_at ? new Date(item.created_at) : new Date(),
    };

    if (!itemsByOrderId.has(orderId)) {
      itemsByOrderId.set(orderId, []);
    }
    itemsByOrderId.get(orderId).push(doc);
  });

  const transportsByOrderId = new Map();
  (sqlData.order_transports || []).forEach(tr => {
    const orderId = parseInt(tr.order_id);
    transportsByOrderId.set(orderId, {
      transportName: tr.transport_name || '',
      transportContact: tr.transport_contact || '',
      trackingUrl: tr.transport_url || '',
      trackingNumber: tr.order_tracking_id || '',
      attachment: tr.attachment || '',
      createdAt: tr.created_at ? new Date(tr.created_at) : new Date(),
    });
  });

  const orderDocs = (sqlData.orders || []).map(o => {
    const legacyId = parseInt(o.id);
    const items = itemsByOrderId.get(legacyId) || [];
    const transport = transportsByOrderId.get(legacyId) || {
      transportName: '',
      transportContact: '',
      trackingUrl: '',
      trackingNumber: '',
      attachment: '',
      createdAt: o.created_at ? new Date(o.created_at) : new Date()
    };

    let status = o.status || 'Pending';
    if (status.toLowerCase() === 'pending') status = 'Pending';
    else if (status.toLowerCase() === 'cancelled') status = 'Cancelled';
    else if (status.toLowerCase() === 'delivered') status = 'Delivered';
    else if (status.toLowerCase() === 'shipped') status = 'Shipped';
    else if (status.toLowerCase() === 'processing') status = 'Processing';

    const isPrepaid = (o.payment_term || '').toLowerCase().includes('prepaid') || o.is_payment === '1';
    const paymentMethod = isPrepaid ? 'Online Payment' : 'Cash on Delivery';
    const paymentStatus = o.is_payment === '1' || status === 'Delivered' ? 'Paid' : (status === 'Cancelled' ? 'Pending' : 'Pending');

    return {
      id: `RNOD${legacyId}`,
      legacyId: legacyId,
      uuid: o.uuid || '',
      userId: parseInt(o.user_id) || 0,
      customerName: o.name || '',
      customerPhone: o.mobile || '',
      customerEmail: o.email || '',
      companyName: o.company_name || '',
      shippingAddress: {
        firstName: o.name || '',
        phone: o.mobile || '',
        email: o.email || '',
        address: o.booking_address || '',
        city: o.city || '',
        state: o.state || '',
        pinCode: o.zipcode || '',
        country: o.country || 'India',
      },
      items: items,
      totalAmount: parseFloat(o.total_amount) || 0,
      discountCode: o.discount_code || null,
      discountAmount: parseFloat(o.discount_amount) || 0,
      shippingAmount: parseFloat(o.shipping_amount) || 0,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      status: status,
      fulfillmentType: o.fulfillment_type || 'Delivery',
      courierPartner: transport.transportName || '',
      trackingNumber: transport.trackingNumber || '',
      trackingUrl: transport.trackingUrl || '',
      transportDetails: transport,
      timeline: [
        {
          userName: 'Admin',
          changeType: 'status',
          changeValue: status,
          timestamp: o.updated_at ? new Date(o.updated_at) : (o.created_at ? new Date(o.created_at) : new Date())
        }
      ],
      invoice: o.invoice || null,
      note: o.note || '',
      orderDate: o.created_at ? o.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      createdAt: o.created_at ? new Date(o.created_at) : new Date(),
      updatedAt: o.updated_at ? new Date(o.updated_at) : new Date(),
    };
  });

  if (!dryRun && orderDocs.length > 0) {
    const ops = orderDocs.map(doc => ({
      updateOne: {
        filter: { $or: [{ id: doc.id }, { legacyId: doc.legacyId }] },
        update: { $set: doc },
        upsert: true
      }
    }));
    const res = await db.collection('orders').bulkWrite(ops);
    console.log(`  ✓ Orders: ${res.upsertedCount} inserted, ${res.modifiedCount} updated (total: ${orderDocs.length})`);
  } else {
    console.log(`  [Dry Run] Prepared ${orderDocs.length} order documents`);
  }

  // 4. Process Enquiries (Leads)
  console.log(`\n[4/5] Processing Leads & Enquiries...`);
  const enquiryDocs = (sqlData.enquiries || []).map(e => {
    const legacyId = parseInt(e.id);
    return {
      id: String(legacyId),
      legacyId: legacyId,
      uuid: e.uuid || '',
      customerName: e.name || '',
      name: e.name || '',
      phone: e.mobile || '',
      mobile: e.mobile || '',
      email: e.email || '',
      companyName: e.company_name || '',
      enquiryType: e.enquiry_type || 'Customer',
      sourceType: e.scource_type || 'Website',
      address: e.address || '',
      zipcode: e.zipcode || '',
      purpose: e.purpose || '',
      subject: e.purpose || 'Website Enquiry',
      message: e.purpose || '',
      date: e.published_at || (e.created_at ? e.created_at.slice(0, 10) : ''),
      pageUrl: e.page_url || '',
      status: e.status || 'New',
      createdAt: e.created_at ? new Date(e.created_at) : new Date(),
      updatedAt: e.updated_at ? new Date(e.updated_at) : new Date(),
    };
  });

  if (!dryRun && enquiryDocs.length > 0) {
    const ops = enquiryDocs.map(doc => ({
      updateOne: {
        filter: { $or: [{ id: doc.id }, { legacyId: doc.legacyId }] },
        update: { $set: doc },
        upsert: true
      }
    }));
    const res = await db.collection('enquiries').bulkWrite(ops);
    console.log(`  ✓ Enquiries: ${res.upsertedCount} inserted, ${res.modifiedCount} updated (total: ${enquiryDocs.length})`);
  } else {
    console.log(`  [Dry Run] Prepared ${enquiryDocs.length} enquiry documents`);
  }

  // 5. Process Payments
  console.log(`\n[5/5] Processing Payments...`);
  const paymentDocs = (sqlData.payments || []).map(p => {
    const idNum = parseInt(p.id);
    return {
      id: idNum,
      paymentId: `PAY-${idNum}`,
      orderId: p.order_id ? parseInt(p.order_id) : null,
      customerName: p.name || '',
      payLinkId: p.pay_link_id || '',
      shortUrl: p.short_url || '',
      mobile: p.mobile || '',
      email: p.email || '',
      state: p.state || '',
      city: p.city || '',
      zipcode: p.zipcode || '',
      paymentGateway: p.payment_gateway || 'Razorpay',
      paymentKey: p.payment_key || '',
      gatewayPaymentId: p.payment_id || '',
      status: p.status || '',
      paymentData: p.payment_data || '',
      amount: parseFloat(p.amount) || 0,
      createdAt: p.created_at ? new Date(p.created_at) : new Date(),
      updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
    };
  });

  if (!dryRun && paymentDocs.length > 0) {
    const ops = paymentDocs.map(doc => ({
      updateOne: {
        filter: { id: doc.id },
        update: { $set: doc },
        upsert: true
      }
    }));
    const res = await db.collection('payments').bulkWrite(ops);
    console.log(`  ✓ Payments: ${res.upsertedCount} inserted, ${res.modifiedCount} updated (total: ${paymentDocs.length})`);
  } else {
    console.log(`  [Dry Run] Prepared ${paymentDocs.length} payment documents`);
  }

  // Strict Catalogue Post-Check Verification
  console.log(`\n[Catalogue Guard Verification]`);
  const catCountAfter = await db.collection('categories').countDocuments();
  const subCatCountAfter = await db.collection('subcategories').countDocuments();
  const prodCountAfter = await db.collection('products').countDocuments();

  if (catCountBefore !== catCountAfter || subCatCountBefore !== subCatCountAfter || prodCountBefore !== prodCountAfter) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: Catalogue counts changed! (Categories: ${catCountBefore} -> ${catCountAfter}, Subcats: ${subCatCountBefore} -> ${subCatCountAfter}, Products: ${prodCountBefore} -> ${prodCountAfter})`);
  }
  console.log(`  ✓ VERIFIED UNTOUCHED: Categories: ${catCountAfter}, Subcategories: ${subCatCountAfter}, Products: ${prodCountAfter}`);

  // Summary counts
  const finalUsers = await db.collection('users').countDocuments();
  const finalOrders = await db.collection('orders').countDocuments();
  const finalAddresses = await db.collection('addresses').countDocuments();
  const finalEnquiries = await db.collection('enquiries').countDocuments();
  const finalPayments = await db.collection('payments').countDocuments();

  console.log(`\n[${targetName} Database Summary]`);
  console.log(`  - Users: ${finalUsers}`);
  console.log(`  - Addresses: ${finalAddresses}`);
  console.log(`  - Orders: ${finalOrders}`);
  console.log(`  - Leads/Enquiries: ${finalEnquiries}`);
  console.log(`  - Payments: ${finalPayments}`);

  await mongoose.disconnect();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetArg = args.find(a => a.startsWith('--target='));
  const target = targetArg ? targetArg.split('=')[1] : 'both'; // 'local', 'atlas', or 'both'

  console.log('========================================================');
  console.log('   RN-Faucets Live PHP Laravel Data Migration Tool');
  console.log('========================================================');
  console.log(`Target: ${target}`);
  console.log(`Mode: ${dryRun ? 'DRY-RUN ONLY' : 'LIVE MIGRATION'}`);

  // 1. Extract data from SQL
  const tablesToExtract = ['states', 'cities', 'user_addresses', 'users', 'order_items', 'order_transports', 'orders', 'enquiries', 'payments'];
  const sqlData = await extractSqlTables(tablesToExtract);

  const localUri = 'mongodb://127.0.0.1:27017/rn-valves';
  const atlasUri = 'mongodb+srv://web_db_user:EoK0ZBimp3zGV9ZY@rncluster.jbtr81i.mongodb.net/rn-valves?retryWrites=true&w=majority&appName=RNcluster';

  if (target === 'local' || target === 'both') {
    await migrateToDatabase('Local MongoDB', localUri, sqlData, dryRun);
  }

  if (target === 'atlas' || target === 'both') {
    await migrateToDatabase('MongoDB Atlas Cloud', atlasUri, sqlData, dryRun);
  }

  console.log('\n========================================================');
  console.log('   MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

main().catch(err => {
  console.error('\n❌ Fatal Migration Error:', err);
  process.exit(1);
});
