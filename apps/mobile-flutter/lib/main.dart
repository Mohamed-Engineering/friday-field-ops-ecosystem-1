import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  runApp(const ProviderScope(child: FridayFieldOpsApp()));
}

class FridayFieldOpsApp extends ConsumerWidget {
  const FridayFieldOpsApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'Friday Field Operations',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          surface: Color(0xFF0A0F1C),
          primary: Color(0xFF00F0FF),
          secondary: Color(0xFF20C997),
        ),
        fontFamily: 'Cairo',
      ),
      home: const FieldOperationsHome(),
    );
  }
}

class FieldOperationsHome extends StatelessWidget {
  const FieldOperationsHome({super.key});

  @override
  Widget build(BuildContext context) {
    final metrics = [
      ('Active Routes', '12'),
      ('Verified Visits', '148'),
      ('Exceptions', '6'),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Friday Field Operations'),
        actions: [
          IconButton(
            tooltip: 'Switch language',
            onPressed: () {},
            icon: const Icon(Icons.language),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            height: 220,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF00F0FF).withValues(alpha: 0.25)),
              gradient: const LinearGradient(
                colors: [Color(0xFF101B2E), Color(0xFF0A0F1C)],
              ),
            ),
            child: const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.radar, size: 48, color: Color(0xFF00F0FF)),
                  SizedBox(height: 12),
                  Text('LIVE GPS TELEMETRY'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.15,
            children: [
              for (final metric in metrics)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(metric.$2, style: Theme.of(context).textTheme.headlineSmall),
                        const SizedBox(height: 6),
                        Text(metric.$1, textAlign: TextAlign.center),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
