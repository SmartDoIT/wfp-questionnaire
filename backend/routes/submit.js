const express = require('express');
const path = require('path');
const fs = require('fs');

const { scoreAssessment } = require('../utils/scoring');
const { sendResultEmails } = require('../utils/email');

const router = express.Router();

const brandsPath = path.join(__dirname, '..', 'brands', 'brands.json');
const questionnairePath = path.join(__dirname, '..', 'brands', 'questionnaire.json');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(contact, fields) {
  if (!contact || typeof contact !== 'object') return 'contact_required';
  for (const field of fields) {
    const value = contact[field.id];
    if (field.required && (!value || String(value).trim() === '')) {
      return `missing_${field.id}`;
    }
    if (field.type === 'email' && value && !EMAIL_REGEX.test(value)) {
      return `invalid_${field.id}`;
    }
  }
  return null;
}

router.post('/:brandId', async (req, res) => {
  const brands = loadJson(brandsPath);
  const brand = brands[req.params.brandId];
  if (!brand) return res.status(404).json({ error: 'brand_not_found' });

  const questionnaire = loadJson(questionnairePath);
  const { contact, answers } = req.body || {};

  const contactError = validateContact(contact, questionnaire.contactFields);
  if (contactError) return res.status(400).json({ error: contactError });

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'answers_required' });
  }

  const result = scoreAssessment(questionnaire, answers);

  try {
    await sendResultEmails({ brand, contact, result });
  } catch (err) {
    console.error('[submit] email send failed:', err);
  }

  res.json({
    success: true,
    brand: { id: brand.id, name: brand.name },
    result: {
      overallScore: result.overallScore,
      maturity: result.maturity,
      domains: result.domains,
      insights: result.insights
    }
  });
});

module.exports = router;
