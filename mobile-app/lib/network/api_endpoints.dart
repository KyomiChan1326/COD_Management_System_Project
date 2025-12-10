class ApiEndpoints {
  static const login = '/auth/login';
  static const logout = '/auth/logout'; // optional

  static const ordersPending = '/orders/pending';
  static const collectCod = '/orders/collect'; // ex: POST /orders/collect
  static const cashOnHand = '/cash/on-hand';
  static const history = '/orders/history';

  static String collectCodById(String id) => '/orders/$id/collect';
}
