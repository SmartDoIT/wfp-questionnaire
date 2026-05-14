const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const brandsPath = path.join(__dirname, '..', 'brands', 'brands.json');
const questionnairePath = path.join(__dirname, '..', 'brands', 'questionnaire.json');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

router.get('/:brandId', (req, res) => {
  const brands = loadJson(brandsPath);
  const brand = brands[req.params.brandId];
  if (!brand) return res.status(404).json({ error: 'brand_not_found' });

  const questionnaire = loadJson(questionnairePath);
  res.json({ brand, questionnaire });
});

module.exports = router;
