export default function Modal({ title, open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 40,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          width: "min(520px, 90%)",
          padding: "20px",
          boxShadow: "0 10px 40px rgba(15, 23, 42, 0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>{title}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div style={{ marginTop: "16px" }}>{children}</div>
      </div>
    </div>
  );
}
