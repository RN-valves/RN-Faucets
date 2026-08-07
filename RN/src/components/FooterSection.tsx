"use client";

export default function FooterSection() {
  return (
    <footer
      style={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#022B52",
        display: "block",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://jalbath.com/wp-content/uploads/2026/01/footer-bg-svg.svg"
        alt="Footer"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "cover",
          minHeight: "120px",
        }}
      />
    </footer>
  );
}
