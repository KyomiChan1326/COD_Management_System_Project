import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../state/providers.dart';
import '../../utils/money.dart';
import 'order_detail_screen.dart';

class OrdersListScreen extends ConsumerWidget {
  const OrdersListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(ordersProvider);

    return RefreshIndicator(
      onRefresh: () => ref.read(ordersProvider.notifier).loadAll(),
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          Row(
            children: [
              Text('Pending Orders', style: Theme.of(context).textTheme.titleLarge),
              const Spacer(),
              OutlinedButton.icon(
                onPressed: () => ref.read(ordersProvider.notifier).loadAll(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reload'),
              ),
            ],
          ),
          const SizedBox(height: 10),

          if (s.loading) ...[
            const SizedBox(height: 40),
            const Center(child: CircularProgressIndicator()),
          ] else if (s.error != null) ...[
            const SizedBox(height: 30),
            _ErrorBox(
              message: s.error!,
              onRetry: () => ref.read(ordersProvider.notifier).loadAll(),
            ),
          ] else if (s.pending.isEmpty) ...[
            const SizedBox(height: 40),
            const Center(child: Text('Không có đơn pending')),
          ] else ...[
            ...s.pending.map((o) {
              return Card(
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.inventory_2_outlined)),
                  title: Text(o.code),
                  subtitle: Text('COD: ${formatVnd(o.codAmount)}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => OrderDetailScreen(order: o)),
                    );
                  },
                ),
              );
            }),
          ],

          const SizedBox(height: 40),
          Text(
            'Kéo xuống để refresh',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _ErrorBox extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorBox({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Có lỗi xảy ra', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            Text(message),
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Thử lại'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
