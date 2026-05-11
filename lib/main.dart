import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/ingredient_provider.dart';  
import 'providers/recipe_provider.dart';
import 'screens/main_screen.dart';

void main() {
  runApp(const SmartCookApp());
}

class SmartCookApp extends StatelessWidget {
  const SmartCookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => IngredientProvider()),  
            ChangeNotifierProvider(create: (_) => RecipeProvider()),

      ],
      child: const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: MainScreen(),
      ),
    );
  }
}