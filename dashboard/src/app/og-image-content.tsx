export function ogImageContent() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#12161d",
      }}
    >
      <div
        style={{
          fontSize: 28,
          color: "#45d6c4",
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        Route Merge Optimizer
      </div>
      <div
        style={{
          fontSize: 54,
          fontWeight: 700,
          color: "#e7eaee",
          marginTop: 24,
          lineHeight: 1.15,
          maxWidth: 980,
        }}
      >
        Does merging delivery and return trips cut last-mile waste?
      </div>
      <div
        style={{
          fontSize: 26,
          color: "#8892a0",
          marginTop: 28,
          maxWidth: 880,
        }}
      >
        A data-driven case study — real order geodata, one clearly-labeled
        assumption, results shown as a range.
      </div>
    </div>
  );
}
