const express = require('express');
const router = express.Router();
const { cspConfig } = require('../config/csp');

router.get('/csp-policy', (req, res) => {
 
  const directives = cspConfig.directives;
  
  const policyString = Object.entries(directives)
    .map(([key, values]) => {
      const directiveName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      const directiveValue = Array.isArray(values) ? values. join(' ') : values;
      return `${directiveName} ${directiveValue}`;
    })
    .join('; ');

  res.json({
    success: true,
    cspPolicy: policyString,
    directives:  directives,
    testUrl: 'https://csp-evaluator.withgoogle.com/'
  });
});

module.exports = router;