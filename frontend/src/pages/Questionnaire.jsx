import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { fetchBrand, submitAssessment } from '../api.js';
import ContactStep from '../components/ContactStep.jsx';
import DomainStep from '../components/DomainStep.jsx';
import ResultStep from '../components/ResultStep.jsx';
import Progress from '../components/Progress.jsx';

export default function Questionnaire() {
  const { brandId } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [brand, setBrand] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);

  const [stepIndex, setStepIndex] = useState(-1);
  const [contact, setContact] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBrand(brandId)
      .then((data) => {
        if (cancelled) return;
        setBrand(data.brand);
        setQuestionnaire(data.questionnaire);
        applyBrandColors(data.brand);
        document.title = `${data.brand.name} — Workforce Planning Readiness`;
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [brandId]);

  const totalSteps = useMemo(() => {
    if (!questionnaire) return 0;
    return 1 + questionnaire.domains.length;
  }, [questionnaire]);

  function handleContactSubmit(c) {
    setContact(c);
    setStepIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleNext() {
    if (!questionnaire) return;
    if (stepIndex < questionnaire.domains.length - 1) {
      setStepIndex(stepIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitAssessment(brandId, { contact, answers });
      setResult(res.result);
      setStepIndex(questionnaire.domains.length);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (stepIndex === 0) {
      setStepIndex(-1);
    } else if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) return <div className="loading">Loading…</div>;
  if (loadError === 'brand_not_found') {
    return (
      <div className="container">
        <div className="card center">
          <h1>Brand not found</h1>
          <p className="muted">We couldn't find a brand at <code>/{brandId}</code>.</p>
        </div>
      </div>
    );
  }
  if (loadError) return <div className="loading">Couldn't load the assessment. Please try again later.</div>;

  const isResult = stepIndex === questionnaire.domains.length;
  const isContact = stepIndex === -1;
  const currentDomain = !isContact && !isResult ? questionnaire.domains[stepIndex] : null;

  return (
    <div className="container">
      <header className="brand-header">
        {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="brand-logo" /> : null}
        <span className="brand-name">{brand.name}</span>
      </header>

      {!isContact && !isResult && (
        <Progress
          current={stepIndex + 1}
          total={totalSteps - 1}
          label={`Step ${stepIndex + 2} of ${totalSteps}`}
        />
      )}

      {submitError && (
        <div className="error">
          We couldn't submit your responses ({submitError}). Please check your connection and try again.
        </div>
      )}

      <div className="card">
        {isContact && (
          <ContactStep
            fields={questionnaire.contactFields}
            value={contact}
            onSubmit={handleContactSubmit}
          />
        )}

        {currentDomain && (
          <DomainStep
            domain={currentDomain}
            scales={questionnaire.scales}
            answers={answers}
            onChange={handleAnswer}
            onNext={handleNext}
            onBack={handleBack}
            isLast={stepIndex === questionnaire.domains.length - 1}
          />
        )}

        {submitting && <div className="loading">Calculating your readiness…</div>}

        {isResult && result && (
          <ResultStep result={result} brandName={brand.name} contactEmail={contact.email} />
        )}
      </div>
    </div>
  );
}

function applyBrandColors(brand) {
  const root = document.documentElement;
  if (brand.primaryColor) root.style.setProperty('--primary', brand.primaryColor);
  if (brand.accentColor) root.style.setProperty('--accent', brand.accentColor);
  if (brand.backgroundColor) root.style.setProperty('--bg', brand.backgroundColor);
}
