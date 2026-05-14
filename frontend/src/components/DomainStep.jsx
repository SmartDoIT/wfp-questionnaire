import QuestionInput from './QuestionInput.jsx';

export default function DomainStep({ domain, scales, answers, onChange, onNext, onBack, isLast }) {
  const allAnswered = domain.questions.every((q) => {
    const v = answers[q.id];
    return v !== undefined && v !== null && v !== '';
  });

  return (
    <div>
      <h3>{domain.name}</h3>
      <h1>{domain.description}</h1>

      <div style={{ marginTop: 24 }}>
        {domain.questions.map((q) => (
          <QuestionInput
            key={q.id}
            question={q}
            scales={scales}
            value={answers[q.id]}
            onChange={(v) => onChange(q.id, v)}
          />
        ))}
      </div>

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNext}
          disabled={!allAnswered}
        >
          {isLast ? 'Submit & see results' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
