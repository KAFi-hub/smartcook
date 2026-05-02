import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    const green = Color(0xFF0B5D3B);

    return SizedBox(
      width: double.infinity,
      height: 64,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: green,
          disabledBackgroundColor: green.withOpacity(0.6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 6,
        ),
        child: isLoading
            ? const CircularProgressIndicator(color: Colors.white)
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    text,
                    style: const TextStyle(fontSize: 20, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  const Icon(Icons.arrow_forward, color: Colors.white),
                ],
              ),
      ),
    );
  }
}