import 'package:dio/dio.dart';

Dio buildDio(String baseUrl, {String? token}) {
  final dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
    },
  ));

  // attach bearer token if any
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) {
      if (token != null && token!.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      } else {
        options.headers.remove('Authorization');
      }
      handler.next(options);
    },
  ));

  // log
  dio.interceptors.add(LogInterceptor(
    request: true,
    requestBody: true,
    responseBody: true,
    error: true,
  ));

  return dio;
}
