const Aliment = require('../models/Aliment');
const nutritionService = require('../services/nutritionService');

exports.getNutritionInfo = async (req, res) => {
  try {
    const { name } = req.query;
    const nutrition = await nutritionService.analyzeIngredient(name);
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ error: "Erreur d'analyse IA" });
  }
};

exports.saveAliment = (req, res) => {
  // Note: idInventaire devrait normalement être récupéré via le token du user
  const data = req.body;
  Aliment.create(data, (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: "Ingrédient sauvegardé !", id: result.insertId });
  });
};