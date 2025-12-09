// Mock API for development
const MockAPI = {
    // Mock user data
    users: [
        {
            id: 1,
            email: 'shop@example.com',
            password: 'password123',
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            shopName: 'Shop Thời Trang A',
            role: 'shop_owner',
            avatar: 'NV',
            balance: 12500000,
            pendingBalance: 2500000,
            status: 'active'
        }
    ],

    // Mock login
    login: function(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    resolve({
                        success: true,
                        token: 'mock_jwt_token_' + Date.now(),
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            shopName: user.shopName,
                            role: user.role,
                            avatar: user.avatar
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Email hoặc mật khẩu không đúng'
                    });
                }
            }, 1000);
        });
    },

    // Mock register
    register: function(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
                    data: {
                        id: Math.floor(Math.random() * 1000),
                        ...userData,
                        status: 'pending_verification'
                    }
                });
            }, 1500);
        });
    }
};

window.MockAPI = MockAPI;