import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_shell.dart';
import 'features/auth/login_screen.dart';
import 'state/providers.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final token = ref.watch(tokenProvider);

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Shipper App',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo),
      home: token == null ? const LoginScreen() : const AppShell(),
    );
  }
}
