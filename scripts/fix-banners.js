const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://web_db_user:EoK0ZBimp3zGV9ZY@rncluster.jbtr81i.mongodb.net/rn-valves?retryWrites=true&w=majority&appName=RNcluster';

async function fixSubBanners() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const subCollection = db.collection('subcategories');
  const catCollection = db.collection('categories');

  // 1. Fix Subcategories
  const brokenSubs = await subCollection.find({
    banner: { $regex: 'uploads|www\\.rnvalves\\.com' }
  }).toArray();

  console.log(`Found ${brokenSubs.length} broken subcategory banners.`);

  for (const s of brokenSubs) {
    const validImage = (s.image && !s.image.includes('www.rnvalves.com') && !s.image.includes('uploads')) ? s.image : '';
    console.log(`✓ Fixing subcategory "${s.name}": banner replaced with -> ${validImage}`);
    await subCollection.updateOne(
      { _id: s._id },
      { $set: { banner: validImage, updatedAt: new Date() } }
    );
  }

  // 2. Fix Categories
  const brokenCats = await catCollection.find({
    banner: { $regex: 'uploads|www\\.rnvalves\\.com' }
  }).toArray();

  console.log(`Found ${brokenCats.length} broken category banners.`);
  for (const c of brokenCats) {
    const validImage = (c.image && !c.image.includes('www.rnvalves.com') && !c.image.includes('uploads')) ? c.image : '';
    console.log(`✓ Fixing category "${c.name}": banner replaced with -> ${validImage}`);
    await catCollection.updateOne(
      { _id: c._id },
      { $set: { banner: validImage, updatedAt: new Date() } }
    );
  }

  console.log('All broken banners fixed in MongoDB successfully!');
  await mongoose.disconnect();
}

fixSubBanners().catch(console.error);
