// js/auth.js - Authentication Utilities
const Auth = {
    // Check if user is logged in
    isLoggedIn: function() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (!token || !user) {
            return false;
        }
        
        // Additional validation
        try {
            const userData = JSON.parse(user);
            
            // Check if user data has required fields
            if (!userData.id || !userData.email || !userData.role) {
                this.clearAuth();
                return false;
            }
            
            // Check token format (simple validation)
            if (!token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token.')) {
                this.clearAuth();
                return false;
            }
            
            return true;
        } catch (error) {
            this.clearAuth();
            return false;
        }
    },

    // Get current user data
    getCurrentUser: function() {
        if (!this.isLoggedIn()) {
            return null;
        }
        
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        try {
            return JSON.parse(userData);
        } catch (error) {
            this.clearAuth();
            return null;
        }
    },

    // Get token
    getToken: function() {
        if (!this.isLoggedIn()) {
            return null;
        }
        
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    },

    // Clear all auth data
    clearAuth: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('login_time');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('login_time');
    },

    // Login function
    login: function(email, password, rememberMe = false) {
        return new Promise((resolve) => {
            // SIMPLE VALIDATION - CHỈ CHO PHÉP MỘT SỐ TÀI KHOẢN
            const allowedEmails = ['shop@example.com', 'admin@shopcod.com', 'test@shop.com'];
            const allowedPhones = ['0987654321', '0123456789'];
            const validPassword = 'password123'; // Default password for testing
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            let isValid = false;
            
            // Check if email is in allowed list
            if (emailRegex.test(email)) {
                isValid = allowedEmails.includes(email);
            } else {
                // Check phone
                const phoneNumber = email.replace(/\D/g, '');
                isValid = allowedPhones.includes(phoneNumber);
            }
            
            if (!isValid || password !== validPassword) {
                resolve({
                    success: false,
                    message: 'Email/số điện thoại hoặc mật khẩu không đúng!'
                });
                return;
            }
            
            // Mock user data
            const userData = {
                id: 1,
                name: 'Nguyễn Văn A',
                email: emailRegex.test(email) ? email : 'shop@example.com',
                phone: emailRegex.test(email) ? '0987654321' : email.replace(/\D/g, ''),
                role: 'shop_owner',
                shopName: 'Shop Thời Trang A',
                avatar: 'NV',
                balance: 12500000,
                pendingBalance: 2500000,
                lastLogin: new Date().toISOString()
            };
            
            // Generate mock token
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token.' + Date.now();
            
            // Store auth data
            if (rememberMe) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('login_time', Date.now().toString());
            } else {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(userData));
                sessionStorage.setItem('login_time', Date.now().toString());
            }
            
            resolve({
                success: true,
                token: token,
                user: userData
            });
        });
    },

    // Logout function - FIXED
    logout: function() {
        this.clearAuth();
        window.location.href = 'login.html?logout=true';
    },

    // Check session timeout (8 hours)
    checkSessionTimeout: function() {
        const loginTime = localStorage.getItem('login_time') || sessionStorage.getItem('login_time');
        
        if (!loginTime) {
            this.clearAuth();
            return false;
        }
        
        const eightHours = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        const currentTime = Date.now();
        
        if (currentTime - parseInt(loginTime) > eightHours) {
            this.clearAuth();
            return false;
        }
        
        return true;
    }
};

// Auto-check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    const loginPage = currentPage === 'login.html' || currentPage === 'register.html' || currentPage === 'forgot-password.html';
    
    if (!loginPage) {
        // Check if user is logged in
        if (!Auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
        
        // Check session timeout
        if (!Auth.checkSessionTimeout()) {
            window.location.href = 'login.html?session_expired=true';
            return;
        }
        
        // Load user data to UI
        const user = Auth.getCurrentUser();
        if (user) {
            // Update user info in UI
            updateUserUI(user);
        }
    } else if (Auth.isLoggedIn() && Auth.checkSessionTimeout()) {
        // If already logged in and trying to access login page, redirect to dashboard
        window.location.href = 'index.html';
    }
});

// Update user UI elements
function updateUserUI(user) {
    // Update all elements with class 'user-name'
    document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = user.name || 'Nguyễn Văn A';
    });
    
    // Update all elements with class 'user-role'
    document.querySelectorAll('.user-role').forEach(el => {
        el.textContent = user.role === 'shop_owner' ? 'Chủ shop' : 
                         user.role === 'admin' ? 'Quản trị viên' : 
                         user.role || 'Người dùng';
    });
    
    // Update user avatar
    document.querySelectorAll('.user-avatar').forEach(el => {
        if (user.avatar) {
            el.textContent = user.avatar;
        }
    });
    
    // Update shop name if exists
    document.querySelectorAll('.shop-name').forEach(el => {
        if (user.shopName) {
            el.textContent = user.shopName;
        }
    });
}

// Make Auth available globally
window.Auth = Auth;