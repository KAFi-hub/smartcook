import 'dart:convert';
import 'package:http/http.dart' as http;

// ── Service de recherche d'ingrédients ─────────────────────────────
// Gère les appels API liés aux ingrédients et produits alimentaires
class IngredientService {
  // ── Recherche d'un produit par code-barres ──────────────────────
  // Utilise l'API gratuite OpenFoodFacts
  // Retourne : name (nom), quantity (quantité), brand (marque)
  // Lance une Exception si le produit n'est pas trouvé
  static Future<Map<String, dynamic>> lookupBarcode(String barcode) async {
    // Construction de l'URL avec le code-barres scanné
    final url = Uri.parse(
      'https://world.openfoodfacts.org/api/v0/product/$barcode.json',
    );

    // Appel HTTP GET vers OpenFoodFacts
    final response = await http.get(url);

    if (response.statusCode == 200) {
      // Décodage de la réponse JSON
      final data = jsonDecode(response.body);

      // status == 1 signifie que le produit existe dans la base
      if (data['status'] == 1) {
        final product = data['product'];
        return {
          // Nom du produit (ex: "Nutella")
          'name': product['product_name'] ?? 'Produit inconnu',
          // Quantité/poids (ex: "400g")
          'quantity': product['quantity'] ?? '',
          // Marque (ex: "Ferrero")
          'brand': product['brands'] ?? '',
        };
      }
    }

    // Produit non trouvé ou erreur réseau
    throw Exception('Produit non trouvé');
  }
}
