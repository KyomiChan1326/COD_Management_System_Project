import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../state/providers.dart';
import '../../utils/money.dart';
import 'models.dart';

class ConfirmCollectScreen extends ConsumerStatefulWidget {
  final Order order;
  const ConfirmCollectScreen({super.key, required this.order});

  @override
  ConsumerState<ConfirmCollectScreen> createState() => _ConfirmCollectScreenState();
}

class _ConfirmCollectScreenState extends ConsumerState<ConfirmCollectScreen> {
  bool submitting = false;

  Future<void> submit() async {
    if (submitting) return;
    setState(() => submitting = true);

    try {
      await ref.read(ordersProvider.notifier).collect(widget.order.id);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Đã thu COD: ${widget.order.code} (${formatVnd(widget.order.codAmount)})')),
      );

      // pop confirm + detail
      Navigator.pop(context);
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Collect thất bại: $e')),
      );
    } finally {
      if (mounted) setState(() => submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final o = widget.order;

    return Scaffold(
      appBar: AppBar(title: const Text('Confirm Collect')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Xác nhận đã thu COD cho đơn', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                title: Text(o.code),
                subtitle: Text('COD: ${formatVnd(o.codAmount)}'),
                trailing: Chip(label: Text(o.status.name)),
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: submitting ? null : submit,
                icon: submitting
                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.verified_outlined),
                label: const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Text('Confirm'),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: submitting ? null : () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
