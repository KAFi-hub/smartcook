const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const recipeModels = [
    process.env.GEMINI_TEXT_MODEL,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
].filter(Boolean);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isTemporaryGeminiError = (error) => {
    return [429, 500, 502, 503, 504].includes(error?.status);
};

const parseJsonResponse = (text) => {
    const cleaned = String(text || "")
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
};

exports.generateRecipesFromData = async (profile, ingredients) => {
    const healthContext = `
    PROFIL NUTRITIONNEL DE L'UTILISATEUR :
    - Objectif : ${profile?.objectifNutritionnel || "Equilibre"}
    - Allergies : ${profile?.allergies || "Aucune"}
    - Preferences alimentaires : ${profile?.preferencesAlimentaires || "Aucune"}
    - Pathologies/Sante : ${profile?.conditionsSante || "Aucune"}
    `;

    const ingredientsList = ingredients.map(i => `${i.quantite} ${i.unite} de ${i.nom}`).join(", ");

    const prompt = `
    Tu es un expert en nutrition et chef cuisinier.
    CONSIGNE : Genere exactement 5 recettes differentes basees EXCLUSIVEMENT sur ces ingredients.
    Les recettes doivent etre variees, realistes, mangeables et adaptees au profil nutritionnel.
    N'invente pas d'ingredients principaux absents. Tu peux seulement supposer eau, sel, poivre et epices simples.
    Le champ typeRepas doit etre exactement l'une de ces valeurs : "Breakfast", "Lunch", "Dinner".
    Utilise "Breakfast" pour dejeuner/petit-dejeuner, "Lunch" pour repas de midi, et "Dinner" pour diner.
    Genere une liste variee avec au moins une recette Breakfast et une recette Dinner si les ingredients peuvent convenir.
    Pour chaque recette, estime calories/proteines/glucides/lipides selon les quantites reellement utilisees.
    Les valeurs nutritionnelles doivent varier d'une recette a l'autre si les portions ou techniques changent.

    ${healthContext}

    INGREDIENTS DISPONIBLES : ${ingredientsList}

    FORMAT DE REPONSE : JSON pur uniquement, sans markdown.
    [
      {
        "nom": "Nom court",
        "imagePrompt": "A professional realistic food photography of the recipe in English, single finished dish on a plate, natural light, no text",
        "typeRepas": "Breakfast/Lunch/Dinner",
        "tempsPreparation": 30,
        "difficulte": "facile/moyen",
        "nbPersonnes": 2,
        "etapes": "1. ...",
        "calories": 500,
        "proteines": 30,
        "glucides": 45,
        "lipides": 15,
        "benefices": "...",
        "conseilsSante": "...",
        "scoreCompatibilite": 95
      }
    ]
    `;

    let lastError;

    for (const modelName of recipeModels) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`Generation recettes Gemini (${modelName}) tentative ${attempt}`);

                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: { responseMimeType: "application/json" }
                });

                const result = await model.generateContent(prompt);
                return parseJsonResponse(result.response.text());
            } catch (error) {
                lastError = error;
                console.error(`Erreur Gemini recettes (${modelName}) tentative ${attempt}:`, error.message);

                if (!isTemporaryGeminiError(error)) {
                    break;
                }

                await sleep(1200 * attempt);
            }
        }
    }

    console.error("Erreur Gemini API:", lastError);
    return null;
};
