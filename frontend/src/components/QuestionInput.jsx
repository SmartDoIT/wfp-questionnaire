export default function QuestionInput({ question, scales, value, onChange }) {
  const scaleKey = question.type === 'yes-no-partial' ? 'yes-no-partial' : 'likert';
  const scale = scales[scaleKey];

  if (!scale) return null;

  const isLikertLike = scaleKey === 'likert';

  return (
    <div className="question">
      <div className="question-text">
        {question.text}
        {question.type === 'weighted-likert' && <span className="question-badge">Key question</span>}
      </div>
      <div className={`options ${isLikertLike ? 'likert' : ''}`}>
        {scale.options.map((opt) => {
          const selected = String(value) === String(opt.value);
          return (
            <button
              type="button"
              key={String(opt.value)}
              className={`option ${selected ? 'selected' : ''}`}
              onClick={() => onChange(opt.value)}
              aria-pressed={selected}
            >
              {isLikertLike && <span className="option-value">{opt.value}</span>}
              <span className="option-label">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
