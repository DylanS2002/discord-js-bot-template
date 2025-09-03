const path = require('path');

const PATH_BASELINE = path.join(__dirname, 'data', 'baseline.json');
const PATH_PR_BASELINE = path.join(__dirname, 'data', 'pr-baseline.json');
const PATH_RESULTS = path.join(__dirname, 'data', 'results.json');
const PATH_STRESS = path.join(__dirname, 'data', 'stress-results.json');

module.exports = {
    PATH_BASELINE,
    PATH_PR_BASELINE,
    PATH_RESULTS,
    PATH_STRESS
}