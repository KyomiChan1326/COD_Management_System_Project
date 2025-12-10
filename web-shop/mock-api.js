// File: js/mock-api.js (PHIÊN BẢN HOÀN CHỈNH)

const MockAPI = {
    // Mock user data 
    users: [
        {
            id: 1,
            email: 'shop@example.com',
            password: 'password123',
            name: 'Sumo',
            phone: '0987654321',
            shopName: 'Shop Thời Trang A',
            role: 'Chủ shop', // Đổi 'shop_owner' thành 'Chủ shop' để dễ hiển thị
            avatar: 'SM',
            balance: 12500000,
            pendingBalance: 2500000,
            status: 'active'
        }
    ],

    // Phương thức Mock Login 
    login: function(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.users.find(u => u.email === email && u.password === password);
                if (user) {
                    // Trả về dữ liệu người dùng đã làm sạch
                    resolve({ success: true, token: 'mock_jwt_token_' + Date.now(), user: user });
                } else {
                    resolve({ success: false, message: 'Email hoặc mật khẩu không đúng' });
                }
            }, 1000);
        });
    },

    // Phương thức DASHBOARD DATA
    getDashboardData: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    stats: {
                        totalBalance: 25840000,
                        todayOrders: 48,
                        revenue: 18450000,
                        newCustomers: 12,
                        balanceChange: 0.125, // 12.5%
                        ordersChange: 8 // 8 đơn so với hôm qua
                    },
                    charts: {
                        revenueLabels: ['1/5', '5/5', '10/5', '15/5', '20/5', '25/5', '30/5'],
                        revenueData: [8.2, 12.5, 18.2, 22.8, 24.5, 25.1, 26.9], // Triệu VNĐ
                        orderTypeData: [65, 20, 10, 5] // Thành công, Đang giao, Chờ xử lý, Đã hủy
                    },
                    
                    // Dữ liệu cho Giao Dịch Gần Đây
                    transactions: [
                        { type: 'in', description: 'Nạp tiền từ VNPay', amount: 2000000, time: '14:30', status: 'Hoàn tất', icon: 'fas fa-arrow-down', iconClass: 'success' },
                        { type: 'out', description: 'Thanh toán đơn #DH20240515', amount: 850000, time: '13:45', status: 'Thành công', icon: 'fas fa-shopping-cart', iconClass: 'danger' },
                        { type: 'in', description: 'Thu hộ đơn #DH20240514', amount: 1500000, time: '11:20', status: 'Đã đối soát', icon: 'fas fa-money-bill-wave', iconClass: 'success' },
                        { type: 'out', description: 'Chuyển khoản cho shop ABC', amount: 750000, time: '10:15', status: 'Hoàn tất', icon: 'fas fa-exchange-alt', iconClass: 'primary' },
                        { type: 'out', description: 'Rút tiền về Vietcombank', amount: 3000000, time: '09:30', status: 'Đang xử lý', icon: 'fas fa-clock', iconClass: 'warning' },
                    ],
                    // Dữ liệu cho Đơn Hàng Đang Giao
                    pendingOrders: [
                        { orderId: '#DH20240515001', customer: 'Trần Văn B', cod: 850000, status: 'Đang giao', time: 'Dự kiến 16:00', icon: 'fas fa-box', iconClass: 'primary' },
                        { orderId: '#DH20240515002', customer: 'Lê Thị C', cod: 1200000, status: 'Đang đóng gói', time: 'Giao sáng mai', icon: 'fas fa-box', iconClass: 'primary' },
                        { orderId: '#DH20240514003', customer: 'Nguyễn Văn D', cod: 450000, status: 'Chờ xác nhận', time: 'Chưa có shipper', icon: 'fas fa-exclamation-triangle', iconClass: 'warning' },
                        { orderId: '#DH20240513004', customer: 'Phạm Thị E', cod: 680000, status: 'Đã giao', time: '14/05/2024 15:30', icon: 'fas fa-check-circle', iconClass: 'success' },
                        { orderId: '#DH20240512005', customer: 'Hoàng Văn F', cod: 950000, status: 'Đã hủy', time: 'Khách không nhận hàng', icon: 'fas fa-times-circle', iconClass: 'danger' },
                    ]
                });
            }, 800);
        });
    }
};

window.MockAPI = MockAPI;