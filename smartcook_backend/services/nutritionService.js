const axios = require('axios');
const imageService = require('./imageService');
const usdaService = require('./usdaService');

const naturalTypes = [
  'Fruits',
  'Vegetables',
  'Meat',
  'Seafood',
  'Spices',
  'Grains'
];

exports.analyzeIngredient = async (name, type) => {
  try {
    const image = await imageService.getFoodImage(name, type);
    const isNaturalType = naturalTypes.includes(type);

    let usdaNutrition = null;

    if (isNaturalType) {
      usdaNutrition = await usdaService.getNutrition(name);
    }

    const response = await axios.get(
      'https://world.openfoodfacts.org/cgi/search.pl',
      {
        params: {
          search_terms: name,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 10,
          fields:
            'product_name,nutriments,categories,brands,image_front_url,allergens,allergens_tags'
        },
        timeout: 15000,
        headers: {
          'User-Agent':
            'SmartCookApp - Version 1.0 - (Contact: ton-email@gmail.com)'
        }
      }
    );

    const products = response.data?.products || [];

    if (products.length === 0) {
      return emptyResponse(type, image, usdaNutrition);
    }

    const product =
      products.find(p =>
        (p.product_name || '')
          .toLowerCase()
          .includes(name.toLowerCase())
      ) || products[0];

    const nutriments = product.nutriments || {};

    let allergenes = 'Non renseigné';

if (!isNaturalType) {
  allergenes =
    product.allergens ||
    product.allergens_tags?.join(', ') ||
    'Non renseigné';
}

 if (allergenes === 'Non renseigné' && type === 'Seafood') {
  allergenes = 'en:fish';
}

if (allergenes === 'Non renseigné' && type === 'Dairy & Eggs') {
  allergenes = 'en:milk/en:eggs';
}

    const brandText = (product.brands || '').toLowerCase();
    const inputText = name.toLowerCase().trim();

    const isBrandProduct =
      brandText && inputText.includes(brandText.split(',')[0].trim());

    return {
      allergenes,

      calories: isNaturalType && usdaNutrition
        ? usdaNutrition.calories
        : Math.round(nutriments['energy-kcal_100g'] || 0),

      proteines: isNaturalType && usdaNutrition
        ? usdaNutrition.proteines
        : Number((nutriments.proteins_100g || 0).toFixed(1)),

      glucides: isNaturalType && usdaNutrition
        ? usdaNutrition.glucides
        : Number((nutriments.carbohydrates_100g || 0).toFixed(1)),

      lipides: isNaturalType && usdaNutrition
        ? usdaNutrition.lipides
        : Number((nutriments.fat_100g || 0).toFixed(1)),

      categorie: isNaturalType
        ? type
        : product.categories
          ? product.categories.split(',')[0]
          : 'Inconnu',

      marque: isNaturalType
        ? 'Inconnu'
        : product.brands
          ? product.brands.split(',')[0]
          : 'Inconnu',

      imageUrl: isNaturalType
        ? image || ''
        : isBrandProduct
          ? product.image_front_url || image || ''
          : image || ''
    };

  } catch (error) {
    console.error('Erreur OpenFoodFacts:', error.message);

    const image = await imageService.getFoodImage(name, type);

    let usdaNutrition = null;

    if (naturalTypes.includes(type)) {
      usdaNutrition = await usdaService.getNutrition(name);
    }

    return emptyResponse(type, image, usdaNutrition);
  }
};

function emptyResponse(type, image, usdaNutrition = null) {
  return {
    calories: usdaNutrition ? usdaNutrition.calories : 0,
    proteines: usdaNutrition ? usdaNutrition.proteines : 0,
    glucides: usdaNutrition ? usdaNutrition.glucides : 0,
    lipides: usdaNutrition ? usdaNutrition.lipides : 0,
    allergenes: 'Non renseigné',
    categorie: type || 'Inconnu',
    marque: 'Inconnu',
    imageUrl: image || ''
  };
}