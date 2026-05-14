export default function ResultStep({ result, brandName, contactEmail }) {
  const overall = result.overallScore.toFixed(1);

  return (
    <div>
      <div className="result-hero">
        <div className="badge">{result.maturity.name}</div>
        <div className="score">
          {overall} <span className="small">/ 5</span>
        </div>
        <h2>{result.maturity.headline}</h2>
        <p>{result.maturity.description}</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Domain breakdown</h2>
        <div style={{ marginTop: 16 }}>
          {result.domains.map((d) => {
            const pct = ((d.score - 1) / 4) * 100;
            return (
              <div key={d.id} className="domain-row">
                <div className="domain-row-top">
                  <span className="domain-name">{d.name}</span>
                  <span className="domain-score">{d.score.toFixed(1)} / 5</span>
                </div>
                <div className="domain-bar">
                  <div className="domain-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="domain-maturity">{d.maturity}</div>
              </div>
            );
          })}
        </div>

        <div className="insights">
          <div className="insight-box warn">
            <h3>Focus areas</h3>
            <ul>
              {result.insights.weakest.map((d) => (
                <li key={d.id}>{d.name} — {d.score.toFixed(1)} / 5</li>
              ))}
            </ul>
          </div>
          <div className="insight-box good">
            <h3>Strengths</h3>
            <ul>
              {result.insights.strongest.map((d) => (
                <li key={d.id}>{d.name} — {d.score.toFixed(1)} / 5</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Recommended next step</h2>
        <p style={{ marginTop: 6 }}>{result.maturity.recommendation}</p>
        <p className="muted" style={{ marginTop: 18, marginBottom: 0 }}>
          A copy of these results has been emailed to <strong>{contactEmail}</strong>. A specialist from {brandName} will follow up shortly to walk you through your readiness and tailored next steps.
        </p>
      </div>
    </div>
  );
}
