const express = require('express');
const router = express.Router();
const alimentCtrl = require('../controllers/alimentController');

router.get('/analyze', alimentCtrl.getNutritionInfo);
router.post('/add', alimentCtrl.saveAliment);

module.exports = router;