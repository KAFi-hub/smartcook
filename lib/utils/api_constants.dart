import 'package:flutter/foundation.dart';

class ApiConstants {
  static const String baseUrl = kIsWeb
      ? 'http://localhost:3000/api'
      : 'http://10.0.2.2:3000/api';

  // Auth
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  static const String completeProfile = '$baseUrl/user/complete-profile';

  // Inventory & Aliments
  static const String inventory = '$baseUrl/inventory';
  static const String aliments = '$baseUrl/aliments';

  // Recipes
  static const String recipes = '$baseUrl/recipes';

  // Shopping
  static const String shopping = '$baseUrl/shopping';

  // Chat
  static const String chat = '$baseUrl/chat';
}
