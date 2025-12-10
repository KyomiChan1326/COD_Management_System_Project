import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../state/providers.dart';

class OrdersHistoryScreen extends ConsumerWidget {
  const OrdersHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(ordersProvider);

    if (s.loading) return const Center(child: CircularProgressIndicator());
    if (s.error != null) return Center(child: Padding(
      padding: const EdgeInsets.all(16),
      child: Text('Error: ${s.error}'),
    ));

    if (s.history.isEmpty) {
      return const Center(child: Text('Chưa có lịch sử'));
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(ordersProvider.notifier).loadAll(),
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: s.history.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (_, i) {
          final o = s.history[i];
          return Card(
            child: ListTile(
              leading: const CircleAvatar(child: Icon(Icons.check_circle_outline)),
              title: Text(o.code),
              subtitle: Text('COD: ${o.codAmount}đ • ${o.status.name}'),
            ),
          );
        },
      ),
    );
  }
}
