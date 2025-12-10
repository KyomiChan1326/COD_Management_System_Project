enum OrderStatus { pending, collected, remitted, cancelled }

OrderStatus _parseStatus(String s) {
  switch (s.toLowerCase()) {
    case 'pending':
      return OrderStatus.pending;
    case 'collected':
      return OrderStatus.collected;
    case 'remitted':
      return OrderStatus.remitted;
    case 'cancelled':
      return OrderStatus.cancelled;
    default:
      return OrderStatus.pending;
  }
}

class Order {
  final String id;
  final String shipperId;
  final String code;
  final int codAmount;
  final OrderStatus status;

  const Order({
    required this.id,
    required this.shipperId,
    required this.code,
    required this.codAmount,
    required this.status,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'].toString(),
        shipperId: json['shipperId'].toString(),
        code: json['code'].toString(),
        codAmount: (json['codAmount'] as num).toInt(),
        status: _parseStatus(json['status'].toString()),
      );

  Order copyWith({OrderStatus? status}) => Order(
        id: id,
        shipperId: shipperId,
        code: code,
        codAmount: codAmount,
        status: status ?? this.status,
      );
}
