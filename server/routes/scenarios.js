const express = require('express');
const { getAllScenarios, getScenario, createScenario, getScenarioMatches } = require('../controllers/scenarioController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllScenarios);
router.get('/:id', getScenario);
router.post('/', createScenario);
router.get('/:scenarioId/matches', protect, getScenarioMatches);

module.exports = router;
