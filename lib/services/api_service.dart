import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = "http://localhost:3000/api/aliments";

  Future<Map<String, dynamic>> analyzeIngredient(String name) async {
    final response = await http.get(Uri.parse('$baseUrl/analyze?name=$name'));
    if (response.statusCode == 200){
      return json.decode(response.body);
    }else{
      print("Erreur API: ${response.statusCode} - ${response.body}");
      return {"calories": 0, "proteines": 0, "glucides": 0, "lipides": 0};
    }
  }

  Future<bool> saveIngredient(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/add'),
      headers: {"Content-Type": "application/json"},
      body: json.encode(data),
    );
    return response.statusCode == 201;
  }
}