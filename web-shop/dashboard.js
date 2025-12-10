// =========================================================================
// HÀM TIỆN ÍCH (HELPER FUNCTIONS)
// =========================================================================

function formatCurrency(number) {
    if (typeof number !== 'number') return '0 ₫'; 
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0 
    }).format(number);
}

function formatPercentage(decimal) {
    const percentage = (decimal * 100).toFixed(1);
    if (decimal > 0) {
        return `+${percentage}%`;
    } else if (decimal < 0) {
        return `${percentage}%`;
    }
    return '0%';
}

// =========================================================================
// HÀM RENDER DỮ LIỆU CHÍNH (MAIN RENDER FUNCTIONS)
// =========================================================================

// Hàm 1: Cập nhật 4 thẻ thống kê (Stats Cards)
function updateStatsCards(stats) {
    // Cập nhật giá trị chính
    document.getElementById('total-balance').textContent = formatCurrency(stats.totalBalance);
    document.getElementById('today-orders').textContent = stats.todayOrders;
    document.getElementById('total-revenue').textContent = formatCurrency(stats.revenue);
    document.getElementById('new-customers').textContent = stats.newCustomers;

    // --- Cập nhật Total Balance ---
    const balanceChangeEl = document.getElementById('balance-change');
    const balanceChangeContainer = document.getElementById('balance-change-container');
    
    if (balanceChangeEl && balanceChangeContainer) {
        const changeText = formatPercentage(stats.balanceChange) + ' so với tháng trước';
        balanceChangeEl.textContent = changeText;
        balanceChangeContainer.className = stats.balanceChange > 0 ? 
            'stat-change positive' : 'stat-change negative';
    }
    
    // --- Cập nhật Today Orders ---
    const ordersChangeEl = document.getElementById('orders-change');
    const ordersChangeContainer = document.getElementById('orders-change-container');
    
    if (ordersChangeEl && ordersChangeContainer) {
        const changeText = (stats.ordersChange > 0 ? `+${stats.ordersChange}` : stats.ordersChange) + ' đơn so với hôm qua';
        ordersChangeEl.textContent = changeText;
        ordersChangeContainer.className = stats.ordersChange > 0 ? 
            'stat-change positive' : 'stat-change negative';
    }

    // --- Cập nhật Revenue Change ---
    const revenueChangeEl = document.getElementById('revenue-change');
    const revenueContainer = revenueChangeEl ? revenueChangeEl.closest('.stat-change') : null;
    
    // Giả định Mock API có revenueChange (0.243 nếu 24.3%)
    if (stats.revenueChange !== undefined && revenueChangeEl && revenueContainer) {
        const revenueChangeText = formatPercentage(stats.revenueChange) + ' tăng trưởng';
        revenueChangeEl.textContent = revenueChangeText;
        revenueContainer.className = stats.revenueChange > 0 ? 'stat-change positive' : 'stat-change negative';
    } else if (revenueChangeEl) {
        // Cập nhật giá trị cố định nếu Mock API không cung cấp (tối ưu UI)
        revenueChangeEl.textContent = '24.3% tăng trưởng'; 
    }
    
    // --- Cập nhật Customers Change ---
    const customersChangeEl = document.getElementById('customers-change');
    const customersContainer = customersChangeEl ? customersChangeEl.closest('.stat-change') : null;

    // Giả định Mock API có customersChange (-2 nếu 2 khách giảm)
    if (stats.customersChange !== undefined && customersChangeEl && customersContainer) {
        const customersChangeText = (stats.customersChange > 0 ? `+${stats.customersChange}` : stats.customersChange) + ' khách so với tuần trước';
        customersChangeEl.textContent = customersChangeText;
        customersContainer.className = stats.customersChange > 0 ? 'stat-change positive' : 'stat-change negative';
    } else if (customersChangeEl) {
        // Cập nhật giá trị cố định nếu Mock API không cung cấp (tối ưu UI)
        customersChangeEl.textContent = '2 khách so với tuần trước'; 
    }
}


// Hàm 2: Cập nhật biểu đồ (Charts)
function updateCharts(charts) {
    // --- Logic Chart 1 (Biểu đồ Doanh thu) ---
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx && window.revenueChartInstance) window.revenueChartInstance.destroy();
    
    if (revenueCtx) {
        window.revenueChartInstance = new Chart(revenueCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: charts.revenueLabels,
                // ĐÃ SỬA LỖI: ĐIỀN DỮ LIỆU ĐỒ THỊ VÀO ĐÂY
                datasets: [{ 
                    label: 'Doanh thu (Triệu ₫)',
                    data: charts.revenueData,
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderColor: '#4361ee',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { 
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true }, x: {} }
            }
        });
    }

    // --- Logic Chart 2 (Biểu đồ Doughnut) ---
    const orderTypeCtx = document.getElementById('orderTypeChart');
    if (orderTypeCtx && window.orderTypeChartInstance) window.orderTypeChartInstance.destroy();
    
    if (orderTypeCtx) {
        window.orderTypeChartInstance = new Chart(orderTypeCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Thành công', 'Đang giao', 'Chờ xử lý', 'Đã hủy'],
                // ĐÃ SỬA LỖI: ĐIỀN DỮ LIỆU ĐỒ THỊ VÀO ĐÂY
                datasets: [{
                    data: charts.orderTypeData,
                    backgroundColor: ['#06d6a0', '#4361ee', '#ffd166', '#ef476f'],
                    hoverOffset: 4
                }]
            },
            options: { 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

// Hàm tạo HTML cho một mục Giao Dịch
function renderTransaction(item) {
    const statusClass = item.status.toLowerCase().includes('hoàn tất') || item.status.toLowerCase().includes('thành công') || item.status.toLowerCase().includes('đã đối soát') ? 'success' : item.status.toLowerCase().includes('đang xử lý') ? 'warning' : item.status.toLowerCase().includes('hủy') ? 'danger' : 'primary';
    const isPositive = item.type === 'in';
    const amountClass = isPositive ? 'positive' : 'negative';
    const amountSign = isPositive ? '+' : '-';
    
    return `
        <li class="transaction-item ${item.iconClass}">
            <div class="transaction-icon ${item.iconClass}">
                <i class="${item.icon}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-info">
                    <div class="transaction-title">${item.description}</div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountSign}${formatCurrency(item.amount)}
                    </div>
                </div>
                <div class="transaction-status status-${statusClass}">
                    ${item.status}
                </div>
                <div class="transaction-time">${item.time}</div>
            </div>
        </li>
    `;
}

// Hàm tạo HTML cho một mục Đơn Hàng
function renderOrder(item) {
    const customerName = item.customer;
    const avatarText = customerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const progress = item.status === 'Đã giao' ? 100 : item.status === 'Đang giao' ? 70 : 40; 
    
    return `
        <li class="order-item">
            <div class="order-avatar">${avatarText}</div>
            <div class="order-details">
                <div class="order-id">${item.orderId}</div>
                <div class="order-customer">${customerName}</div>
                <div class="order-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%;"></div>
                    </div>
                    <div class="order-value">${formatCurrency(item.cod)}</div>
                </div>
            </div>
            <div class="delivery-time">${item.time}</div>
        </li>
    `;
}

// Hàm 3: Cập nhật danh sách hoạt động (Transaction và Order)
function updateActivityLists(transactions, pendingOrders) {
    const transactionListEl = document.getElementById('transaction-list');
    const orderListEl = document.getElementById('order-list');
    
    // Xóa loading state nếu có
    document.getElementById('transaction-loading')?.remove();
    document.getElementById('order-loading')?.remove();

    // 1. Cập nhật Giao Dịch
    if (transactionListEl && transactions) {
        if (transactions.length === 0) {
            transactionListEl.innerHTML = `<div class="empty-state"><i class="fas fa-exchange-alt"></i><p>Chưa có giao dịch nào</p></div>`;
        } else {
            transactionListEl.innerHTML = transactions.map(renderTransaction).join('');
        }
    }
    
    // 2. Cập nhật Đơn Hàng
    if (orderListEl && pendingOrders) {
        if (pendingOrders.length === 0) {
            orderListEl.innerHTML = `<div class="empty-state"><i class="fas fa-shipping-fast"></i><p>Không có đơn hàng đang giao</p></div>`;
        } else {
            orderListEl.innerHTML = pendingOrders.map(renderOrder).join('');
        }
    }
    
    // Thêm animation (giữ nguyên logic animation của bạn)
    setTimeout(() => {
        document.querySelectorAll('.transaction-item, .order-item').forEach((item, index) => {
            item.style.animation = 'fadeInUp 0.5s ease forwards';
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }, 100);
}

// Cập nhật thông tin User (Sau khi login)
function updateUserInfo(user) {
    if (user) {
        document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name || 'User');
        document.querySelectorAll('.user-role').forEach(el => el.textContent = user.role || 'Chủ shop');
        
        // Cập nhật chữ viết tắt 
        const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'US';
        
        const sidebarAvatar = document.getElementById('user-avatar-sidebar');
        const headerAvatar = document.getElementById('user-avatar-header');

        if (sidebarAvatar) sidebarAvatar.textContent = initials;
        if (headerAvatar) headerAvatar.textContent = initials;
    }
}

// =========================================================================
// HÀM TẢI DỮ LIỆU CHÍNH (MAIN DATA FETCH FUNCTION)
// =========================================================================

async function loadDashboardData() {
    try {
        // 1. Gọi Mock API 
        const response = await MockAPI.getDashboardData(); 
        
        if (response.success) {
            console.log("Dashboard data loaded successfully.");
            
            // 2. Cập nhật các khối
            updateStatsCards(response.stats);
            updateCharts(response.charts);
            updateActivityLists(response.transactions, response.pendingOrders);

            // 3. Cập nhật thông tin User (Lấy từ localStorage/sessionStorage)
            const userJSON = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (userJSON) {
                const user = JSON.parse(userJSON);
                updateUserInfo(user);
            }
        } else {
            console.error("Failed to load dashboard data:", response.message);
        }
    } catch (error) {
        console.error("Error in loadDashboardData:", error);
    }
}

// =========================================================================
// SỰ KIỆN KHỞI TẠO (INITIALIZATION)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

// Export các hàm để có thể gọi từ nơi khác (giữ nguyên yêu cầu này)
window.updateStatsCards = updateStatsCards;
window.updateCharts = updateCharts;
window.updateActivityLists = updateActivityLists;
window.updateUserInfo = updateUserInfo;
window.loadDashboardData = loadDashboardData;