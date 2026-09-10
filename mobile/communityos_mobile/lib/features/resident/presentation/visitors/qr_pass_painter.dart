import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Clean CustomPainter for rendering a realistic prototype QR code grid visual
class QrPassPainter extends CustomPainter {
  final String seedData;

  const QrPassPainter({required this.seedData});

  @override
  void paint(Canvas canvas, Size size) {
    final paintSquare = Paint()
      ..color = AppColors.primaryDarkNavy
      ..style = PaintingStyle.fill;

    final paintBg = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    // Draw background
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(0, 0, size.width, size.height), const Radius.circular(12)),
      paintBg,
    );

    const int gridSize = 17;
    final double cellSize = size.width / gridSize;

    // Fixed positioning patterns (top-left, top-right, bottom-left)
    _drawFinderPattern(canvas, 0, 0, cellSize, paintSquare);
    _drawFinderPattern(canvas, (gridSize - 7) * cellSize, 0, cellSize, paintSquare);
    _drawFinderPattern(canvas, 0, (gridSize - 7) * cellSize, cellSize, paintSquare);

    // Deterministic pseudo-random pattern based on seedData hash
    int hash = seedData.hashCode.abs();
    for (int r = 0; r < gridSize; r++) {
      for (int c = 0; c < gridSize; c++) {
        // Skip finder areas
        if ((r < 7 && c < 7) || (r < 7 && c >= gridSize - 7) || (r >= gridSize - 7 && c < 7)) {
          continue;
        }

        hash = (hash * 31 + r * 13 + c * 7) & 0x7FFFFFFF;
        if (hash % 3 == 0 || (r % 2 == 0 && c % 3 == 1)) {
          canvas.drawRect(
            Rect.fromLTWH(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5),
            paintSquare,
          );
        }
      }
    }
  }

  void _drawFinderPattern(Canvas canvas, double x, double y, double cellSize, Paint paint) {
    final outerRect = Rect.fromLTWH(x, y, cellSize * 7, cellSize * 7);
    final innerWhiteRect = Rect.fromLTWH(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
    final centerBlackRect = Rect.fromLTWH(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);

    final whitePaint = Paint()..color = Colors.white;

    canvas.drawRect(outerRect, paint);
    canvas.drawRect(innerWhiteRect, whitePaint);
    canvas.drawRect(centerBlackRect, paint);
  }

  @override
  bool shouldRepaint(covariant QrPassPainter oldDelegate) => oldDelegate.seedData != seedData;
}
