import 'package:flutter/material.dart';
import '../models/ingredient_model.dart';
import '../services/ingredient_service.dart';
import '../services/image_service.dart';

class IngredientProvider extends ChangeNotifier {
  final IngredientService _service = IngredientService();
  
  List<Ingredient> _ingredients = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Ingredient> get ingredients => _ingredients;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
Future<void> fetchIngredients() async {
  _isLoading = true;
  _errorMessage = null;
  notifyListeners();

  try {
    _ingredients = await _service.getAllIngredients();

    for (var ingredient in _ingredients) {
      if (ingredient.imageUrl == null || ingredient.imageUrl!.isEmpty) {
        ingredient.imageUrl = ImageService.getMealDbImage(ingredient.nom);
      }
    }
  } catch (e) {
    _errorMessage = e.toString();
  } finally {
    _isLoading = false;
    notifyListeners();
  }
}

Future<bool> addIngredient(Ingredient ingredient) async {
  _isLoading = true;
  _errorMessage = null;
  notifyListeners();

  try {
    if (ingredient.imageUrl == null || ingredient.imageUrl!.isEmpty) {
      ingredient.imageUrl = ImageService.getMealDbImage(ingredient.nom);
    }

    await _service.addIngredient(ingredient);
    await fetchIngredients();
    return true;
  } catch (e) {
    _errorMessage = e.toString();
    return false;
  } finally {
    _isLoading = false;
    notifyListeners();
  }
}
  // Mettre à jour un ingrédient
  Future<bool> updateIngredient(int id, Ingredient ingredient) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _service.updateIngredient(id, ingredient);
      await fetchIngredients();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Supprimer un ingrédient
  Future<bool> deleteIngredient(int id) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _service.deleteIngredient(id);
      await fetchIngredients();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Récupérer les ingrédients par catégorie
  Map<String, List<Ingredient>> getIngredientsByCategory() {
    Map<String, List<Ingredient>> grouped = {};
    for (var ingredient in _ingredients) {
      final category = ingredient.type;
      if (!grouped.containsKey(category)) {
        grouped[category] = [];
      }
      grouped[category]!.add(ingredient);
    }
    return grouped;
  }
}