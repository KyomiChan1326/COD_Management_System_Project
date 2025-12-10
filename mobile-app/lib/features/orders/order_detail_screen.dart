import 'package:flutter/material.dart';
import 'models.dart';
import 'confirm_collect_screen.dart';

class OrderDetailScreen extends StatelessWidget {
  final Order order;
  const OrderDetailScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Order ${order.code}')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _InfoRow(label: 'ID', value: order.id),
            const SizedBox(height: 10),
            _InfoRow(label: 'Code', value: order.code),
            const SizedBox(height: 10),
            _InfoRow(label: 'COD', value: '${order.codAmount}đ'),
            const SizedBox(height: 10),
            _InfoRow(label: 'Status', value: order.status.name),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => ConfirmCollectScreen(order: order)),
                  );
                },
                icon: const Icon(Icons.verified_outlined),
                label: const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Text('Confirm Collect'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withOpacity(0.6),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          SizedBox(width: 90, child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
