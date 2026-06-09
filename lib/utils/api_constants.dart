class ApiConstants {
  static String get baseUrl =>
      'https://smartcook-production-50ad.up.railway.app/api';

  // Auth
  static String get register => '$baseUrl/auth/register';
  static String get login => '$baseUrl/auth/login';
  static String get completeProfile => '$baseUrl/user/complete-profile';

  // Inventory & Aliments
  static String get inventory => '$baseUrl/inventory';
  static String get aliments => '$baseUrl/aliments';

  // Recipes
  static String get recipes => '$baseUrl/recipes';

  // Shopping
  static String get shopping => '$baseUrl/shopping';

  // Chat
  static String get chat => '$baseUrl/chat';
}
