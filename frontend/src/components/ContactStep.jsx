import { useState } from 'react';

export default function ContactStep({ fields, value, onSubmit, onCancel }) {
  const [form, setForm] = useState(value || {});
  const [errors, setErrors] = useState({});

  function update(id, v) {
    setForm((prev) => ({ ...prev, [id]: v }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: null }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    for (const f of fields) {
      const v = (form[f.id] || '').trim();
      if (f.required && !v) next[f.id] = 'Required';
      else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) next[f.id] = 'Invalid email';
    }
    setErrors(next);
    if (Object.keys(next).length === 0) onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Tell us about you</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        We'll send your personalized readiness report to the email below. Takes about 4 minutes to complete.
      </p>

      <div className="form-row">
        {fields.slice(0, 2).map((f) => (
          <Field key={f.id} field={f} value={form[f.id] || ''} error={errors[f.id]} onChange={(v) => update(f.id, v)} />
        ))}
      </div>
      {fields.slice(2).map((f) => (
        <Field key={f.id} field={f} value={form[f.id] || ''} error={errors[f.id]} onChange={(v) => update(f.id, v)} />
      ))}

      <div className="actions">
        {onCancel ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Back</button>
        ) : <span />}
        <button type="submit" className="btn btn-primary">Start assessment →</button>
      </div>
    </form>
  );
}

function Field({ field, value, error, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor={field.id}>
        {field.label}
        {field.required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      <input
        id={field.id}
        type={field.type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoCompleteFor(field.id, field.type)}
      />
      {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function autoCompleteFor(id, type) {
  if (type === 'email') return 'email';
  if (type === 'tel') return 'tel';
  if (id === 'firstName') return 'given-name';
  if (id === 'lastName') return 'family-name';
  if (id === 'company') return 'organization';
  if (id === 'role') return 'organization-title';
  return 'on';
}
