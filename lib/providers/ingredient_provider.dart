import 'package:flutter/material.dart';
import '../services/api_service.dart';

class IngredientProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  double calories = 0, proteins = 0, carbs = 0, fats = 0;
  String category = "", allergens = "", brand = "", imageUrl = "";
  bool isLoading = false;

  void resetNutrition() {
    calories = 0; proteins = 0; carbs = 0; fats = 0;
    notifyListeners();
  }

  Future<void> fetchNutrition(String name) async {
    isLoading = true;
    notifyListeners();

    try {
      final data = await _apiService.analyzeIngredient(name);
      calories = (data['calories'] as num).toDouble();
      proteins = (data['proteines'] as num).toDouble();
      carbs = (data['glucides'] as num).toDouble();
      fats = (data['lipides'] as num).toDouble();

      // Récupération des infos IA
      category = data['categorie'] ?? "Inconnu";
      allergens = data['allergenes'] ?? "Aucun";
      brand = data['marque'] ?? "Générique";
      imageUrl = data['imageUrl'] ?? "";
      
    } catch (e) {
      print("Erreur Provider: $e");
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}