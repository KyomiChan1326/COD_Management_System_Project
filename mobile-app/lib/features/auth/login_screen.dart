import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../state/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final userCtrl = TextEditingController(text: "shipperA");
  final passCtrl = TextEditingController(text: "123456");
  bool loading = false;

  Future<void> doLogin() async {
    setState(() => loading = true);
    try {
      final api = ref.read(apiProvider);
      final token = await api.login(
        username: userCtrl.text.trim(),
        password: passCtrl.text.trim(),
      );

      ref.read(tokenProvider.notifier).state = token;

      await ref.read(ordersProvider.notifier).loadAll();
      await ref.read(cashProvider.notifier).refresh();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed: $e')),
      );
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Shipper Login', style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 14),
                  TextField(
                    controller: userCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Username (shipperA/shipperB)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: passCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Password (123456)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: loading ? null : doLogin,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: loading
                          ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Login'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
