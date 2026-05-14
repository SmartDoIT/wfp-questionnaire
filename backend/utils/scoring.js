const YES_NO_PARTIAL = { yes: 1, partial: 0.5, no: 0 };

function normalizeAnswer(question, answer) {
  if (answer === undefined || answer === null || answer === '') return null;

  switch (question.type) {
    case 'likert':
    case 'weighted-likert': {
      const n = Number(answer);
      if (!Number.isFinite(n) || n < 1 || n > 5) return null;
      return (n - 1) / 4;
    }
    case 'yes-no-partial': {
      const key = String(answer).toLowerCase();
      return key in YES_NO_PARTIAL ? YES_NO_PARTIAL[key] : null;
    }
    default:
      return null;
  }
}

function scoreDomain(domain, answers) {
  let weightedSum = 0;
  let totalWeight = 0;
  const questionResults = [];

  for (const question of domain.questions) {
    const raw = answers[question.id];
    const normalized = normalizeAnswer(question, raw);
    const weight = question.type === 'weighted-likert' ? (question.weight ?? 1) : 1;

    if (normalized !== null) {
      weightedSum += normalized * weight;
      totalWeight += weight;
    }

    questionResults.push({
      id: question.id,
      text: question.text,
      type: question.type,
      answer: raw ?? null,
      normalized,
      weight
    });
  }

  const score01 = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const score5 = 1 + score01 * 4;
  const answeredCount = questionResults.filter((q) => q.normalized !== null).length;

  return {
    id: domain.id,
    name: domain.name,
    description: domain.description,
    weight: domain.weight ?? 1,
    score01,
    score: Number(score5.toFixed(2)),
    answeredCount,
    totalQuestions: domain.questions.length,
    questions: questionResults
  };
}

function pickMaturityLevel(score5, maturityLevels) {
  for (const level of maturityLevels) {
    if (score5 >= level.min && score5 < level.max) return level;
  }
  return maturityLevels[maturityLevels.length - 1];
}

function scoreAssessment(questionnaire, answers) {
  const domainResults = questionnaire.domains.map((d) => scoreDomain(d, answers));

  let weightedSum = 0;
  let totalWeight = 0;
  for (const d of domainResults) {
    const w = d.weight;
    weightedSum += d.score01 * w;
    totalWeight += w;
  }
  const overall01 = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const overall5 = 1 + overall01 * 4;

  const maturity = pickMaturityLevel(overall5, questionnaire.maturityLevels);

  const sortedDomains = [...domainResults].sort((a, b) => a.score - b.score);
  const weakest = sortedDomains.slice(0, 2).map((d) => ({ id: d.id, name: d.name, score: d.score }));
  const strongest = sortedDomains.slice(-2).reverse().map((d) => ({ id: d.id, name: d.name, score: d.score }));

  return {
    overallScore: Number(overall5.toFixed(2)),
    overall01: Number(overall01.toFixed(4)),
    maturity,
    domains: domainResults.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      score: d.score,
      answeredCount: d.answeredCount,
      totalQuestions: d.totalQuestions,
      maturity: pickMaturityLevel(d.score, questionnaire.maturityLevels).name
    })),
    insights: { weakest, strongest }
  };
}

module.exports = { scoreAssessment, scoreDomain, normalizeAnswer, pickMaturityLevel };
