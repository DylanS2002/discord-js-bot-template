const path = require('path');

const PATH_BASELINE = path.join(__dirname, 'data', 'baseline.json');
const PATH_PR_BASELINE = path.join(__dirname, 'data', 'pr-baseline.json');
const PATH_RESULTS = path.join(__dirname, 'data', 'results.json');
const PATH_PR_RESULTS = path.join(__dirname, 'data', 'pr-results.json');
const PATH_STRESS = path.join(__dirname, 'data', 'stress-results.json');

const isCI = process.env.CI === 'true';
const PATH_OUTPUT = isCI ? PATH_PR_RESULTS : PATH_RESULTS;

module.exports = {
    PATH_BASELINE,
    PATH_PR_BASELINE,
    PATH_RESULTS,
    PATH_PR_RESULTS,
    PATH_OUTPUT,
    PATH_STRESS
}