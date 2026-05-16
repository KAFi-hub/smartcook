const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

const imagesDir = path.join(__dirname, '..', 'public', 'recipe-images');
// Image par défaut si TOUT échoue
const absoluteFallback = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop";

const slugify = (text) => {
    return String(text || "recipe")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
};

// Utilisation de LoremFlickr (Plus stable qu'Unsplash pour les requêtes sans clé API)
const getFallbackImageUrl = (keyword) => {
    const cleanKeyword = encodeURIComponent(keyword.split(' ').slice(0, 2).join(','));
    return `https://loremflickr.com/800/600/food,${cleanKeyword}/all`;
};

const generateWithPollinations = async (prompt) => {
    // Suppression du modèle 'flux' qui cause des erreurs 402 (payant)
    // On utilise le modèle par défaut de Pollinations (gratuit)
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=800&height=600&nologo=true`;
    
    console.log("Tentative Pollinations...");
    const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 25000 // 25 secondes
    });

    return Buffer.from(response.data);
};

exports.generateRecipeImage = async (recipe, req) => {
    const visualKeyword = recipe.nom || "cooking";
    const fileName = `${slugify(visualKeyword)}-${Date.now()}.jpg`;
    const filePath = path.join(imagesDir, fileName);
    const publicUrl = `${req.protocol}://${req.get('host')}/recipe-images/${fileName}`;

    try {
        await fs.mkdir(imagesDir, { recursive: true });

        // 1. Tenter Pollinations (IA)
        try {
            const imageBuffer = await generateWithPollinations(recipe.imagePrompt || recipe.nom);
            if (imageBuffer) {
                await fs.writeFile(filePath, imageBuffer);
                console.log(`✅ Image IA générée pour: ${recipe.nom}`);
                return publicUrl;
            }
        } catch (error) {
            console.error(`❌ Échec IA pour ${recipe.nom}: ${error.message}`);
        }

        // 2. Tenter LoremFlickr (Image réelle de nourriture)
        // C'est beaucoup plus fiable que l'IA
        try {
            console.log(`🔄 Utilisation du fallback pour: ${recipe.nom}`);
            const fallbackUrl = getFallbackImageUrl(recipe.nom);
            const response = await axios.get(fallbackUrl, { responseType: 'arraybuffer', timeout: 10000 });
            
            await fs.writeFile(filePath, Buffer.from(response.data));
            return publicUrl;
        } catch (error) {
            console.error(`❌ Échec Fallback pour ${recipe.nom}`);
            return absoluteFallback;
        }

    } catch (error) {
        console.error("Erreur critique image:", error.message);
        return absoluteFallback;
    }
};