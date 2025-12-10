import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/orders/models.dart';
import '../network/dio_client.dart';
import '../network/shipper_api.dart';

const String kBaseUrl = 'http://localhost:8080';

// ================== AUTH ==================
final tokenProvider = StateProvider<String?>((ref) => null);

final dioProvider = Provider<Dio>((ref) {
  final token = ref.watch(tokenProvider);
  return buildDio(kBaseUrl, token: token);
});

final apiProvider = Provider<ShipperApi>((ref) {
  final dio = ref.watch(dioProvider);
  return ShipperApi(dio);
});

// ================== ORDERS ==================
class OrdersState {
  final bool loading;
  final List<Order> pending;
  final List<Order> history;
  final String? error;

  const OrdersState({
    required this.loading,
    required this.pending,
    required this.history,
    this.error,
  });

  OrdersState copyWith({
    bool? loading,
    List<Order>? pending,
    List<Order>? history,
    String? error,
  }) =>
      OrdersState(
        loading: loading ?? this.loading,
        pending: pending ?? this.pending,
        history: history ?? this.history,
        error: error,
      );

  static const empty = OrdersState(loading: false, pending: [], history: []);
}

class OrdersNotifier extends StateNotifier<OrdersState> {
  OrdersNotifier(this.ref) : super(OrdersState.empty);
  final Ref ref;

  Future<void> loadAll() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final api = ref.read(apiProvider);
      final pending = await api.fetchPendingOrders();
      final history = await api.fetchHistory();
      state = state.copyWith(loading: false, pending: pending, history: history);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> collect(String orderId) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final api = ref.read(apiProvider);
      await api.collectCod(orderId: orderId);

      // refresh
      final pending = await api.fetchPendingOrders();
      final history = await api.fetchHistory();
      await ref.read(cashProvider.notifier).refresh();

      state = state.copyWith(loading: false, pending: pending, history: history);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}

final ordersProvider =
    StateNotifierProvider<OrdersNotifier, OrdersState>((ref) => OrdersNotifier(ref));

// ================== CASH ==================
class CashNotifier extends StateNotifier<AsyncValue<int>> {
  CashNotifier(this.ref) : super(const AsyncValue.data(0));
  final Ref ref;

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    try {
      final api = ref.read(apiProvider);
      final cash = await api.fetchCashOnHand();
      state = AsyncValue.data(cash);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final cashProvider =
    StateNotifierProvider<CashNotifier, AsyncValue<int>>((ref) => CashNotifier(ref));
