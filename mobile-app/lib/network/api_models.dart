import '../features/orders/models.dart';

class LoginResponse {
  final String token;
  const LoginResponse({required this.token});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    // đổi key token theo backend (token/accessToken)
    return LoginResponse(token: (json['token'] ?? json['accessToken']) as String);
  }
}

extension OrderJson on Order {
  static Order fromJson(Map<String, dynamic> json) {
    // bạn map lại field theo backend
    final statusStr = (json['status'] ?? 'pending').toString().toLowerCase();

    OrderStatus status;
    switch (statusStr) {
      case 'collected':
        status = OrderStatus.collected;
        break;
      case 'remitted':
        status = OrderStatus.remitted;
        break;
      case 'cancelled':
        status = OrderStatus.cancelled;
        break;
      default:
        status = OrderStatus.pending;
    }

    return Order(
      id: json['id'].toString(),
      code: (json['code'] ?? json['orderCode'] ?? '').toString(),
      codAmount: (json['codAmount'] ?? json['cod'] ?? 0) as int,
      status: status,
    );
  }
}
