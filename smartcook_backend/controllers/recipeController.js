const Recipe = require('../models/Recipe');
const Aliment = require('../models/Aliment');
const Profile = require('../models/Profile');
const aiService = require('../services/aiService');
const recipeImageAiService = require('../services/recipeImageAiService');

exports.refreshRecipes = async (req, res) => {
    try {
        const userId = req.userId; // Récupéré par ton middleware auth

        // 1. Lire le Profil en BDD
        const profile = await Profile.getByUserId(userId);

        // 2. Lire les Aliments DISPONIBLES en BDD
        const allAliments = await Aliment.findAllByUser(userId);
        const availableIngredients = allAliments.filter(a => a.statut === 'disponible');

        if (availableIngredients.length < 2) {
            return res.status(400).json({ message: "Ajoutez au moins 2 ingrédients pour générer des recettes." });
        }

        // 3. Gemini analyse le profil et génère les recettes
        const generatedRecipes = await aiService.generateRecipesFromData(profile, availableIngredients);

        if (!generatedRecipes || generatedRecipes.length === 0) {
            return res.status(500).json({ message: "L'IA n'a pas pu générer de recettes." });
        }

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 4. Générer une image IA stable correspondant à chaque recette Gemini
        const recipesWithImages = [];
        for (const r of generatedRecipes) {
            const imageUrl = await recipeImageAiService.generateRecipeImage(r, req);
            try {
                console.log(`Génération image pour: ${r.nom}`);
                const imageUrl = await recipeImageAiService.generateRecipeImage(r, req);
                recipesWithImages.push({ 
                    ...r,
                    imageUrl: imageUrl 
                });

                // Petite pause de 1 seconde pour ne pas saturer le serveur d'images
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                recipesWithImages.push({ ...r, imageUrl: "https://via.placeholder.com/800x600.png?text=Image+Non+Disponible" });
            }
        }
        // 5. Nettoyer les anciennes recettes et sauvegarder les nouvelles
        await Recipe.deleteAllByUserId(userId);
        
        const recipesToSave = recipesWithImages.map(r => [
            userId, r.nom, r.imageUrl, r.typeRepas, r.tempsPreparation, r.difficulte, 
            r.nbPersonnes, r.etapes, r.calories, r.proteines, r.glucides, 
            r.lipides, r.benefices, r.conseilsSante, r.scoreCompatibilite
        ]);

        await Recipe.bulkCreate(recipesToSave);

        res.json({ message: "Nouvelles recettes générées !", recipes: recipesWithImages });

    } catch (error) {
        console.error("Refresh Error:", error);
        res.status(500).json({ error: error.message });
    }
};
