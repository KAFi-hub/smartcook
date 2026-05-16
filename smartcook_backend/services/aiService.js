const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateRecipesFromData = async (profile, ingredients) => {
    // Utilisation de Gemini 1.5 Flash (rapide et efficace pour le JSON)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" } // Force la sortie en JSON
    });

    // Construction du contexte santé/profil
    const healthContext = `
    PROFIL NUTRITIONNEL DE L'UTILISATEUR :
    - Objectif : ${profile?.objectifNutritionnel || "Équilibré"}
    - Allergies : ${profile?.allergies || "Aucune"}
    - Préférences alimentaires : ${profile?.preferencesAlimentaires || "Aucune"}
    - Pathologies/Santé : ${profile?.conditionsSante || "Aucune"}
    `;

    // Liste des ingrédients réels provenant de la BDD
    const ingredientsList = ingredients.map(i => `${i.quantite} ${i.unite} de ${i.nom}`).join(", ");

    const prompt = `
    Tu es un expert en nutrition, chef cuisinier et food stylist.
    CONSIGNE : Génère 3 recettes réalistes, mangeables et visuellement cohérentes basées EXCLUSIVEMENT sur ces ingrédients.
    N'invente pas d'ingrédients principaux absents. Tu peux seulement supposer eau, sel, poivre et épices simples.
    Ne donne pas de recette "non recommandée", "incompatible" ou impossible : trouve la meilleure utilisation culinaire possible.
    
    ${healthContext}
    
    INGRÉDIENTS DISPONIBLES : ${ingredientsList}

    FORMAT DE RÉPONSE (JSON LISTE) :
    [
      {
        "nom": "Nom court",
        "imagePrompt": "Detailed English food photography prompt describing exactly the final plated dish, visible main ingredients, colors, texture, and serving style. No text, no logo, no packaging. Example: 'grilled chicken rice bowl with tomato slices, herbs, white plate, natural light'",
        "typeRepas": "déjeuner/dîner",
        "tempsPreparation": minutes,
        "difficulte": "facile/moyen",
        "nbPersonnes": 2,
        "etapes": "1. ...",
        "calories": kcal,
        "proteines": g,
        "glucides": g,
        "lipides": g,
        "benefices": "...",
        "conseilsSante": "...",
        "scoreCompatibilite": 95
      }
    ]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Erreur Gemini API:", error);
        return null;
    }
};
