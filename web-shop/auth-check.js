// js/auth-check.js - Authentication Check for ShopCOD Pro
console.log('🔐 Auth Check System Loading...');

// ========== CONFIGURATION ==========
const CONFIG = {
    protectedPages: ['index.html', 'wallet.html', 'history.html', 'chatbot.html'],
    loginPage: 'login.html',
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    debug: true,
    // Enable development mode on localhost or file protocol
    developmentMode: false,
    // Auto login delay in dev mode (milliseconds)
    devAutoLoginDelay: 2000
};

// ========== AUTH UTILITIES ==========
const AuthUtils = {
    // Check if user is authenticated
    isAuthenticated: function() {
        // DEVELOPMENT MODE: Always allow access
        if (CONFIG.developmentMode) {
            console.log('🛠️ Development mode - Auth bypassed');
            
            // Auto-create dev user if not exists
            this.ensureDevUser();
            return true;
        }
        
        // PRODUCTION MODE: Check authentication
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (!token || !user) {
            CONFIG.debug && console.log('❌ No authentication data found');
            return false;
        }
        
        // Check session timeout
        const loginTime = localStorage.getItem('login_time') || sessionStorage.getItem('login_time');
        if (loginTime) {
            const currentTime = Date.now();
            const sessionAge = currentTime - parseInt(loginTime);
            
            if (sessionAge > CONFIG.sessionTimeout) {
                CONFIG.debug && console.log('⏰ Session expired');
                this.clearAuth();
                return false;
            }
            
            // Auto-refresh session if near expiry (last 30 minutes)
            if (sessionAge > CONFIG.sessionTimeout - (30 * 60 * 1000)) {
                this.refreshSession();
            }
        }
        
        return true;
    },
    
    // Ensure dev user exists in development mode
    ensureDevUser: function() {
        if (!CONFIG.developmentMode) return;
        
        if (!localStorage.getItem('dev_user_created')) {
            const devUser = {
                id: 'user_dev_001',
                name: 'Sumo Developer',
                email: 'sumo@shopcod.dev',
                phone: '0987 654 321',
                role: 'admin',
                shopName: 'ShopCOD Pro Store',
                avatar: 'SD',
                balance: 50000000,
                lastLogin: new Date().toISOString(),
                permissions: ['all']
            };
            
            localStorage.setItem('user', JSON.stringify(devUser));
            localStorage.setItem('token', 'dev_token_' + Date.now());
            localStorage.setItem('login_time', Date.now().toString());
            localStorage.setItem('dev_user_created', 'true');
            
            console.log('👤 Dev user created:', devUser);
        }
    },
    
    // Get current user data
    getCurrentUser: function() {
        try {
            if (CONFIG.developmentMode && !localStorage.getItem('user')) {
                this.ensureDevUser();
            }
            
            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (!userStr) return null;
            
            return JSON.parse(userStr);
        } catch (error) {
            CONFIG.debug && console.error('Error parsing user data:', error);
            return null;
        }
    },
    
    // Refresh session timestamp
    refreshSession: function() {
        if (CONFIG.developmentMode) return;
        
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('login_time', Date.now().toString());
        CONFIG.debug && console.log('🔄 Session refreshed');
    },
    
    // Clear all authentication data
    clearAuth: function() {
        const itemsToRemove = ['token', 'user', 'login_time'];
        
        itemsToRemove.forEach(item => {
            localStorage.removeItem(item);
            sessionStorage.removeItem(item);
        });
        
        CONFIG.debug && console.log('🧹 Auth data cleared');
    },
    
    // Logout user
    logout: function() {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            this.clearAuth();
            
            // Redirect to login page after logout
            setTimeout(() => {
                window.location.href = CONFIG.loginPage;
            }, 300);
        }
    },
    
    // Update user information in UI elements
    updateUserUI: function(userData = null) {
        if (!userData) {
            userData = this.getCurrentUser();
        }
        
        if (!userData) {
            console.warn('No user data to update UI');
            return;
        }
        
        CONFIG.debug && console.log('🎨 Updating UI with user data');
        
        // Wait for DOM to be ready
        const update = () => {
            // Update user name
            const nameElements = [
                ...document.querySelectorAll('.user-name'),
                ...document.querySelectorAll('.user-info h4'),
                ...document.querySelectorAll('[data-user="name"]')
            ];
            
            nameElements.forEach(el => {
                if (el && userData.name) {
                    el.textContent = userData.name;
                }
            });
            
            // Update user role
            const roleMap = {
                'admin': 'Quản trị viên',
                'shop_owner': 'Chủ shop',
                'staff': 'Nhân viên',
                'customer': 'Khách hàng'
            };
            
            const roleElements = [
                ...document.querySelectorAll('.user-role'),
                ...document.querySelectorAll('.user-info p'),
                ...document.querySelectorAll('[data-user="role"]')
            ];
            
            roleElements.forEach(el => {
                if (el && userData.role) {
                    el.textContent = roleMap[userData.role] || userData.role;
                }
            });
            
            // Update user avatar (initials)
            const avatarElements = [
                ...document.querySelectorAll('.user-avatar'),
                ...document.querySelectorAll('[data-user="avatar"]')
            ];
            
            avatarElements.forEach(el => {
                if (el) {
                    const initials = userData.avatar || 
                                   userData.name?.charAt(0)?.toUpperCase() || 
                                   'U';
                    el.textContent = initials;
                    
                    // Add gradient background if element supports it
                    if (el.classList.contains('user-avatar')) {
                        el.style.background = 'linear-gradient(135deg, #4361ee, #3a0ca3)';
                        el.style.color = 'white';
                    }
                }
            });
            
            // Update shop name if exists
            const shopElements = document.querySelectorAll('[data-user="shop"]');
            shopElements.forEach(el => {
                if (el && userData.shopName) {
                    el.textContent = userData.shopName;
                }
            });
            
            // Update balance if element exists
            const balanceElements = document.querySelectorAll('[data-user="balance"]');
            balanceElements.forEach(el => {
                if (el && userData.balance !== undefined) {
                    const formatter = new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    });
                    el.textContent = formatter.format(userData.balance);
                }
            });
            
            CONFIG.debug && console.log('✅ UI updated successfully');
        };
        
        // Execute when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', update);
        } else {
            update();
        }
    },
    
    // Quick login for development
    quickDevLogin: function(username = 'sumo') {
        if (!CONFIG.developmentMode) {
            console.warn('Quick login only available in development mode');
            return;
        }
        
        const devUser = {
            id: 'user_' + Date.now(),
            name: username,
            email: username + '@shopcod.dev',
            phone: '098' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0'),
            role: 'admin',
            shopName: `${username}'s Store`,
            avatar: username.charAt(0).toUpperCase(),
            balance: 10000000 + Math.floor(Math.random() * 90000000),
            lastLogin: new Date().toISOString(),
            permissions: ['all']
        };
        
        localStorage.setItem('user', JSON.stringify(devUser));
        localStorage.setItem('token', 'dev_token_' + Date.now());
        localStorage.setItem('login_time', Date.now().toString());
        
        console.log('🚀 Quick login as:', devUser.name);
        this.updateUserUI(devUser);
        
        // Show notification
        this.showNotification(`Đăng nhập thành công với tài khoản ${username}`);
        
        return devUser;
    },
    
    // Show notification toast
    showNotification: function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#06d6a0' : '#ef476f'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        // Add CSS animations if not exists
        if (!document.getElementById('auth-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-toast-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// ========== MAIN AUTH CHECK FUNCTION ==========
function checkAuthentication() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isProtectedPage = CONFIG.protectedPages.includes(currentPage);
    
    CONFIG.debug && console.log(`📄 Current page: ${currentPage}, Protected: ${isProtectedPage}`);
    
    // If not a protected page, no need to check
    if (!isProtectedPage) {
        // If on login page but already logged in, redirect to dashboard
        if (currentPage === CONFIG.loginPage && AuthUtils.isAuthenticated()) {
            CONFIG.debug && console.log('🔄 Already logged in, redirecting to dashboard');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
        return true;
    }
    
    // For protected pages, check authentication
    if (!AuthUtils.isAuthenticated()) {
        CONFIG.debug && console.log('🔒 Authentication required');
        
        // In development mode, show warning but don't redirect
        if (CONFIG.developmentMode) {
            console.warn('⚠️ Development mode: Showing page without redirect');
            console.warn('   Use AuthUtils.quickDevLogin() to login manually');
            
            // Show warning to user
            setTimeout(() => {
                if (typeof AuthUtils.showNotification === 'function') {
                    AuthUtils.showNotification('Chế độ phát triển: Bạn chưa đăng nhập', 'warning');
                }
            }, 1000);
            
            return false; // Still return false to indicate not authenticated
        }
        
        // In production, redirect to login page
        console.log('⏳ Redirecting to login page...');
        
        // Use setTimeout to allow page to render before redirect
        setTimeout(() => {
            const redirectUrl = CONFIG.loginPage + '?redirect=' + encodeURIComponent(currentPage);
            window.location.href = redirectUrl;
        }, 1500); // Give user time to see the page
        
        return false;
    }
    
    // User is authenticated, update UI
    CONFIG.debug && console.log('✅ User authenticated');
    AuthUtils.updateUserUI();
    
    return true;
}

// ========== INITIALIZATION ==========
function initializeAuthSystem() {
    console.log('🔧 Initializing Auth System...');
    
    // Check authentication status
    const isAuthenticated = checkAuthentication();
    
    // Add logout button event listeners
    document.addEventListener('DOMContentLoaded', () => {
        // Find all logout buttons
        const logoutButtons = document.querySelectorAll('[data-action="logout"], .logout-btn');
        
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                AuthUtils.logout();
            });
        });
        
        // Add dev tools if in development mode
        if (CONFIG.developmentMode) {
            addDevTools();
        }
    });
    
    return isAuthenticated;
}

// ========== DEVELOPMENT TOOLS ==========
function addDevTools() {
    if (!CONFIG.developmentMode) return;
    
    console.log('🛠️ Adding development tools...');
    
    // Create dev tools panel
    const devTools = document.createElement('div');
    devTools.id = 'auth-dev-tools';
    devTools.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(30, 41, 59, 0.95);
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 9998;
        border: 1px solid #4361ee;
        max-width: 300px;
    `;
    
    devTools.innerHTML = `
        <div style="margin-bottom: 8px; font-weight: bold; color: #4cc9f0;">
            🔧 Auth Dev Tools
        </div>
        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
            <button onclick="AuthUtils.quickDevLogin('sumo')" style="padding: 4px 8px; background: #4361ee; border: none; color: white; border-radius: 4px; cursor: pointer;">
                Login as Sumo
            </button>
            <button onclick="AuthUtils.quickDevLogin('admin')" style="padding: 4px 8px; background: #06d6a0; border: none; color: white; border-radius: 4px; cursor: pointer;">
                Login as Admin
            </button>
            <button onclick="AuthUtils.logout()" style="padding: 4px 8px; background: #ef476f; border: none; color: white; border-radius: 4px; cursor: pointer;">
                Logout
            </button>
            <button onclick="debugAuth()" style="padding: 4px 8px; background: #ffd166; border: none; color: #1e293b; border-radius: 4px; cursor: pointer;">
                Debug
            </button>
        </div>
        <div style="margin-top: 8px; font-size: 10px; opacity: 0.7;">
            Development Mode Active
        </div>
    `;
    
    document.body.appendChild(devTools);
}

// ========== DEBUG FUNCTIONS ==========
window.debugAuth = function() {
    console.log('=== 🔍 AUTH DEBUG INFO ===');
    console.log('Development Mode:', CONFIG.developmentMode);
    console.log('Current Page:', window.location.pathname);
    console.log('Is Authenticated:', AuthUtils.isAuthenticated());
    console.log('User Data:', AuthUtils.getCurrentUser());
    console.log('Token Exists:', !!(localStorage.getItem('token') || sessionStorage.getItem('token')));
    console.log('Login Time:', localStorage.getItem('login_time') || 'Not set');
    
    if (localStorage.getItem('login_time')) {
        const age = Date.now() - parseInt(localStorage.getItem('login_time'));
        console.log('Session Age:', Math.floor(age / 1000 / 60) + ' minutes');
    }
    
    console.log('==========================');
};

window.clearAuthData = function() {
    if (confirm('Xóa tất cả dữ liệu đăng nhập?\n(This will log you out)')) {
        AuthUtils.clearAuth();
        location.reload();
    }
};

// ========== GLOBAL EXPORTS ==========
// Make utilities available globally
window.AuthUtils = AuthUtils;
window.checkAuth = checkAuthentication;
window.logout = AuthUtils.logout.bind(AuthUtils);

// ========== AUTO-INITIALIZE ==========
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthSystem);
} else {
    // DOM already loaded, initialize immediately
    initializeAuthSystem();
}

// Auto-login in development mode after delay
if (CONFIG.developmentMode && CONFIG.devAutoLoginDelay > 0) {
    setTimeout(() => {
        if (!AuthUtils.isAuthenticated()) {
            console.log('🤖 Auto-login in development mode...');
            AuthUtils.quickDevLogin('sumo');
        }
    }, CONFIG.devAutoLoginDelay);
}

console.log('✅ Auth Check System Ready');