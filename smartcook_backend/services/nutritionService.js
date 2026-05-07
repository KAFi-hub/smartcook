const axios = require('axios');

exports.analyzeIngredient = async (name) => {
  try {
    // 1. On appelle l'API de recherche d'OpenFoodFacts
    // On limite à 1 résultat (page_size=1) pour avoir le plus pertinent
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&search_simple=1&action=process&json=1&page_size=1`;

    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'SmartCook - Android/Web - Version 1.0' } // Recommandé par l'API
    });

    const products = response.data.products;

    if (products && products.length > 0) {
      const product = products[0];
      const nutriments = product.nutriments || {};

      // 2. Extraction et formatage des données
      return {
        // Nutriments (souvent pour 100g)
        calories: Math.round(nutriments['energy-kcal_100g'] || 0),
        proteines: nutriments.proteins_100g || 0,
        glucides: nutriments.carbohydrates_100g || 0,
        lipides: nutriments.fat_100g || 0,
        
        // Informations générales
        categorie: product.categories ? product.categories.split(',')[0] : "Inconnu",
        allergenes: product.allergens_from_ingredients || product.allergens || "Aucun",
        marque: product.brands ? product.brands.split(',')[0] : "Générique",
        
        // Image (on prend l'image frontale en petite taille pour Flutter)
        imageUrl: product.image_front_url || product.image_url || ""
      };
    }

    // 3. Si aucun produit n'est trouvé, on renvoie des valeurs par défaut
    return {
      calories: 0, proteines: 0, glucides: 0, lipides: 0,
      categorie: "Inconnu", allergenes: "Inconnu", marque: "Inconnu",
      imageUrl: ""
    };

  } catch (error) {
    console.error("Erreur OpenFoodFacts:", error.message);
    throw error;
  }
};