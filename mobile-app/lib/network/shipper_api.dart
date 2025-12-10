import 'package:dio/dio.dart';
import '../features/orders/models.dart';

class ShipperApi {
  final Dio dio;
  ShipperApi(this.dio);

  Map<String, dynamic> _asMap(dynamic v) => Map<String, dynamic>.from(v as Map);
  List<dynamic> _asList(dynamic v) => (v as List).cast<dynamic>();

  T _unwrapData<T>(Response res) {
    final m = _asMap(res.data);
    final ok = m['ok'] == true;
    if (!ok) {
      throw Exception(m['msg']?.toString() ?? 'API error');
    }
    return m['data'] as T;
  }

  Future<String> login({required String username, required String password}) async {
    final res = await dio.post('/api/auth/login', data: {
      'username': username,
      'password': password,
    });

    final m = _asMap(res.data);
    final ok = m['ok'] == true;
    if (!ok) throw Exception(m['msg']?.toString() ?? 'Login failed');

    return m['token'] as String; // token = "shipper:A"
  }

  Future<List<Order>> fetchPendingOrders() async {
    final res = await dio.get('/api/orders/pending');
    final data = _unwrapData<dynamic>(res);
    final list = _asList(data);
    return list.map((e) => Order.fromJson(_asMap(e))).toList();
  }

  Future<List<Order>> fetchHistory() async {
    final res = await dio.get('/api/orders/history');
    final data = _unwrapData<dynamic>(res);
    final list = _asList(data);
    return list.map((e) => Order.fromJson(_asMap(e))).toList();
  }

  Future<Order> collectCod({required String orderId}) async {
    final res = await dio.post('/api/orders/$orderId/collect');
    final data = _unwrapData<dynamic>(res);
    return Order.fromJson(_asMap(data));
  }

  Future<int> fetchCashOnHand() async {
    final res = await dio.get('/api/cash-on-hand');
    final data = _unwrapData<dynamic>(res); // { cashOnHand: ... }
    final m = _asMap(data);
    return (m['cashOnHand'] as num).toInt();
  }
}
