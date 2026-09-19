"use client";

import { useEffect, useState, FormEvent } from "react";

const BANNER_IMG = "/api/media/website/catalogue/products/default/image.webp";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SupportModal({ open, onClose }: SupportModalProps) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    onClose();
  };

  return (
    <div
      className="support-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      onClick={onClose}
    >
      <style>{`
        .support-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: supportFadeIn 0.28s ease;
        }
        @keyframes supportFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes supportSlideIn {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Full modal — bg image covers entire popup */
        .support-modal {
          position: relative;
          width: 820px;
          height: 540px;
          max-width: 96vw;
          max-height: 92vh;
          display: flex;
          border-radius: 0;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
          animation: supportSlideIn 0.32s ease;
          font-family: 'Manrope', system-ui, sans-serif;
          background: #ffffff;
        }
        .support-modal-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .support-modal-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* Left third — clear image only (no overlay) */
        .support-modal-left-spacer {
          position: relative;
          z-index: 1;
          width: 33%;
          flex-shrink: 0;
          height: 100%;
        }

        /* Right form — frosted blur white over the same bg image */
        .support-modal-right {
          position: relative;
          z-index: 1;
          width: 67%;
          height: 100%;
          padding: 34px 32px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-left: 1px solid rgba(255, 255, 255, 0.45);
        }

        .support-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 34px;
          height: 34px;
          border: none;
          background: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: color 0.2s ease, box-shadow 0.2s ease;
          z-index: 2;
          padding: 0;
        }
        .support-modal-close:hover {
          color: #111;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.14);
        }
        .support-modal-title {
          margin: 0 0 8px;
          font-size: 24px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.02em;
          line-height: 1.25;
          padding-right: 40px;
        }
        .support-modal-subtitle {
          margin: 0 0 24px;
          font-size: 14px;
          font-weight: 400;
          color: #555;
          line-height: 1.4;
        }
        .support-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .support-field {
          display: flex;
          flex-direction: column;
        }
        .support-field.full {
          grid-column: 1 / -1;
        }
        .support-input,
        .support-select,
        .support-textarea {
          width: 100%;
          box-sizing: border-box;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #111;
          background: #fff;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          padding: 0 16px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .support-input,
        .support-select {
          height: 48px;
        }
        .support-input::placeholder,
        .support-textarea::placeholder {
          color: #8a8a8a;
        }
        .support-input:focus,
        .support-select:focus,
        .support-textarea:focus {
          border-color: #b0b0b0;
        }
        .support-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-color: #fff;
          padding-right: 36px;
          cursor: pointer;
          color: #8a8a8a;
        }
        .support-select.has-value {
          color: #111;
        }
        .support-phone {
          display: flex;
          align-items: stretch;
          height: 48px;
          background: #fff;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        .support-phone:focus-within {
          border-color: #b0b0b0;
        }
        .support-phone-code {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 10px 0 14px;
          border-right: 1px solid #e5e5e5;
          font-size: 15px;
          color: #333;
          white-space: nowrap;
          flex-shrink: 0;
          background: #fafafa;
        }
        .support-phone input {
          border: none;
          border-radius: 0;
          flex: 1;
          min-width: 0;
          height: 100%;
        }
        .support-phone input:focus {
          border: none;
        }
        .support-textarea {
          height: 110px;
          padding: 14px 16px;
          resize: none;
          line-height: 1.45;
        }
        .support-consent {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 16px;
        }
        .support-consent input {
          margin-top: 2px;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          accent-color: #111;
          cursor: pointer;
        }
        .support-consent label {
          font-size: 12px;
          line-height: 1.45;
          color: #444;
          cursor: pointer;
        }
        .support-consent a {
          color: #111;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .support-submit {
          margin-top: 22px;
          align-self: flex-start;
          background: transparent;
          border: none;
          border-bottom: 2px solid #111;
          padding: 0 0 4px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #111;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: opacity 0.2s ease;
        }
        .support-submit:hover {
          opacity: 0.7;
        }
        .support-submit:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        @media (max-width: 860px) {
          .support-modal {
            flex-direction: column;
            width: min(440px, 96vw);
            height: auto;
            max-height: 92vh;
          }
          .support-modal-left-spacer {
            width: 100%;
            height: 160px;
          }
          .support-modal-right {
            width: 100%;
            padding: 28px 22px 24px;
            background: rgba(255, 255, 255, 0.88);
          }
          .support-modal-title {
            font-size: 20px;
          }
          .support-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="support-modal" onClick={(e) => e.stopPropagation()}>
        {/* Full-bleed bg image across entire modal */}
        <div className="support-modal-bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BANNER_IMG} alt="" />
        </div>

        {/* Left — clear bathroom image (no overlay) */}
        <div className="support-modal-left-spacer" />

        {/* Right — form on frosted blur white */}
        <div className="support-modal-right">
          <button
            type="button"
            className="support-modal-close"
            aria-label="Close support form"
            onClick={onClose}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h2 id="support-modal-title" className="support-modal-title">
            Need support with anything?
          </h2>
          <p className="support-modal-subtitle">
            Fill out the form and we&apos;ll be in touch soon.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="support-form-grid">
              <div className="support-field">
                <input
                  className="support-input"
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="support-field">
                <div className="support-phone">
                  <span className="support-phone-code">
                    +91
                    <svg width="10" height="7" viewBox="0 0 12 8" aria-hidden="true">
                      <path
                        d="M1 1.5L6 6.5L11 1.5"
                        stroke="#888"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    className="support-input"
                    type="tel"
                    placeholder="Mobile No*"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="support-field">
                <input
                  className="support-input"
                  type="email"
                  placeholder="Email Id*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="support-field">
                <input
                  className="support-input"
                  type="text"
                  placeholder="Pincode*"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>

              <div className="support-field">
                <select
                  className={`support-select${city ? " has-value" : ""}`}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    City*
                  </option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Pune">Pune</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="support-field">
                <select
                  className={`support-select${state ? " has-value" : ""}`}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    State*
                  </option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="support-field full">
                <textarea
                  className="support-textarea"
                  placeholder="Message / Project Query*"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="support-consent">
              <input
                id="support-consent"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="support-consent">
                I agree to the{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>{" "}
                &amp; consent to receive promotional communication via SMS,
                email, and WhatsApp.
              </label>
            </div>

            <button type="submit" className="support-submit" disabled={!agreed}>
              Submit Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
