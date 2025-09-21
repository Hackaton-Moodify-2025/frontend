export default function App() {
  const colors = {
    brand: "#004B87",
    positive: "#27AE60",
    neutral: "#95A5A6",
    negative: "#C0392B",
    warning: "#F39C12",
    background: "#F5F7FA",
    surface: "#FFFFFF",
  };

  return (
    <div style={{
      fontFamily: "sans-serif",
      background: colors.background,
      minHeight: "100vh",
      padding: "2rem"
    }}>
      <h1 style={{ color: colors.brand, marginBottom: "1rem" }}>
        Газпромбанк.Тех — Цветовая палитра
      </h1>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        {Object.entries(colors).map(([name, hex]) => (
          <div key={name} style={{
            background: hex,
            borderRadius: "8px",
            padding: "1rem",
            color: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
          }}>
            <strong>{name}</strong>
            <div>{hex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
