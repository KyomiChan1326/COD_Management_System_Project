// js/auth-simple.js
const Auth = {
    // Check login status
    isLoggedIn: function() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return !!token;
    },
    
    // Get user data
    getUser: function() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    },
    
    // Login function
    login: function(email, password, rememberMe = false) {
        // Very simple validation
        const validAccounts = [
            { email: 'shop@example.com', password: 'password123' },
            { email: 'admin@shopcod.com', password: 'password123' }
        ];
        
        const account = validAccounts.find(acc => 
            acc.email === email && acc.password === password
        );
        
        if (account) {
            const userData = {
                id: 1,
                name: 'Nguyễn Văn A',
                email: email,
                role: 'shop_owner'
            };
            
            const token = 'simple_token_' + Date.now();
            
            if (rememberMe) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(userData));
            }
            
            return { success: true };
        }
        
        return { success: false, message: 'Invalid credentials' };
    },
    
    // Logout
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
    }
};

// Auto-protect pages
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that require login
    const protectedPages = ['index.html', 'wallet.html', 'history.html', 'chatbot.html'];
    
    if (protectedPages.includes(currentPage) && !Auth.isLoggedIn()) {
        console.log('Not logged in, redirecting to login');
        window.location.href = 'login.html';
    }
});