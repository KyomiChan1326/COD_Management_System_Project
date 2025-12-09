// js/auth-check.js - Authentication Check for ALL Pages
console.log('=== AUTH CHECK SYSTEM LOADED ===');

// Configuration
const CONFIG = {
    protectedPages: ['index.html', 'wallet.html', 'history.html', 'chatbot.html'],
    loginPage: 'login.html',
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    debug: true
};

// Utility Functions
const AuthUtils = {
    // Check if user is logged in
    isAuthenticated: function() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (!token || !user) {
            CONFIG.debug && console.log(' No token or user found');
            return false;
        }
        
        // Check session timeout
        const loginTime = localStorage.getItem('login_time') || sessionStorage.getItem('login_time');
        if (loginTime) {
            const currentTime = Date.now();
            if (currentTime - parseInt(loginTime) > CONFIG.sessionTimeout) {
                CONFIG.debug && console.log(' Session expired');
                this.clearAuth();
                return false;
            }
        }
        
        return true;
    },
    
    // Get current user
    getCurrentUser: function() {
        if (!this.isAuthenticated()) return null;
        
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        try {
            return JSON.parse(userStr);
        } catch (error) {
            CONFIG.debug && console.error('Error parsing user data:', error);
            return null;
        }
    },
    
    // Clear authentication
    clearAuth: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('login_time');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('login_time');
        CONFIG.debug && console.log(' Auth data cleared');
    },
    
    // Logout function
    logout: function() {
        if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
            this.clearAuth();
            window.location.href = CONFIG.loginPage;
        }
    },
    
    // Update user info in UI
    updateUserUI: function(userData) {
        if (!userData) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._updateUI(userData));
        } else {
            this._updateUI(userData);
        }
    },
    
    // Private method to update UI
    _updateUI: function(userData) {
        CONFIG.debug && console.log('Updating UI with user data:', userData);
        
        // Update user name
        document.querySelectorAll('.user-name, .user-info h4, [data-user="name"]').forEach(el => {
            el.textContent = userData.name || 'Người dùng';
        });
        
        // Update user role
        document.querySelectorAll('.user-role, .user-info p, [data-user="role"]').forEach(el => {
            const roleText = userData.role === 'shop_owner' ? 'Chủ shop' : 
                           userData.role === 'admin' ? 'Quản trị viên' : 
                           userData.role || 'Người dùng';
            el.textContent = roleText;
        });
        
        // Update user avatar
        document.querySelectorAll('.user-avatar, [data-user="avatar"]').forEach(el => {
            el.textContent = userData.avatar || userData.name?.charAt(0) || 'U';
        });
        
        // Update shop name
        document.querySelectorAll('.shop-name, [data-user="shop"]').forEach(el => {
            if (userData.shopName) {
                el.textContent = userData.shopName;
            }
        });
        
        // Update email/phone if elements exist
        document.querySelectorAll('[data-user="email"]').forEach(el => {
            el.textContent = userData.email || '';
        });
        
        document.querySelectorAll('[data-user="phone"]').forEach(el => {
            el.textContent = userData.phone || '';
        });
        
        CONFIG.debug && console.log(' UI updated successfully');
    }
};

// Main Authentication Check
function checkAuthentication() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isProtectedPage = CONFIG.protectedPages.includes(currentPage);
    
    CONFIG.debug && console.log('Current page:', currentPage, 'Protected:', isProtectedPage);
    
    if (isProtectedPage) {
        if (!AuthUtils.isAuthenticated()) {
            CONFIG.debug && console.log('Redirecting to login page...');
            setTimeout(() => {
                window.location.href = CONFIG.loginPage + '?redirect=' + encodeURIComponent(currentPage);
            }, 100);
            return false;
        }
        
        // Load user data and update UI
        const user = AuthUtils.getCurrentUser();
        if (user) {
            AuthUtils.updateUserUI(user);
        }
        
        return true;
    }
    
    // If on login page but already logged in, redirect to index
    if (currentPage === CONFIG.loginPage && AuthUtils.isAuthenticated()) {
        CONFIG.debug && console.log('Already logged in, redirecting to index...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 100);
    }
    
    return true;
}

// Initialize when page loads
window.addEventListener('load', function() {
    CONFIG.debug && console.log('=== PAGE LOADED, CHECKING AUTH ===');
    checkAuthentication();
});

// Make functions available globally
window.AuthUtils = AuthUtils;
window.checkAuth = checkAuthentication;
window.logout = AuthUtils.logout.bind(AuthUtils);

// Debug functions
window.debugAuth = function() {
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Token exists:', !!(localStorage.getItem('token') || sessionStorage.getItem('token')));
    console.log('User exists:', !!(localStorage.getItem('user') || sessionStorage.getItem('user')));
    console.log('Current user:', AuthUtils.getCurrentUser());
    console.log('Session timeout:', CONFIG.sessionTimeout / 1000 / 60 / 60 + ' hours');
    console.log('========================');
};

window.clearAuthData = function() {
    if (confirm('Xóa tất cả dữ liệu đăng nhập?')) {
        AuthUtils.clearAuth();
        location.reload();
    }
};

CONFIG.debug && console.log('Auth system initialized');