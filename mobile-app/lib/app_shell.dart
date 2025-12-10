import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'features/orders/orders_list_screen.dart';
import 'features/cash/cash_on_hand_screen.dart';
import 'features/orders/orders_history_screen.dart';
import 'state/providers.dart';

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  int index = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      await ref.read(ordersProvider.notifier).loadAll();
      await ref.read(cashProvider.notifier).refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = const [
      OrdersListScreen(),
      CashOnHandScreen(),
      OrdersHistoryScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shipper App'),
        actions: [
          IconButton(
            tooltip: 'Logout',
            onPressed: () => ref.read(tokenProvider.notifier).state = null,
            icon: const Icon(Icons.logout),
          )
        ],
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        child: screens[index],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (v) => setState(() => index = v),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.local_shipping_outlined), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.payments_outlined), label: 'Cash'),
          NavigationDestination(icon: Icon(Icons.history), label: 'History'),
        ],
      ),
    );
  }
}
