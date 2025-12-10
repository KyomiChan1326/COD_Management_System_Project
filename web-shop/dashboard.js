// =========================================================================
// HÀM TIỆN ÍCH (HELPER FUNCTIONS)
// =========================================================================

function formatCurrency(number) {
    // Đảm bảo số được xử lý là số hợp lệ
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

    // Cập nhật phần trăm thay đổi của Total Balance
    const balanceChangeEl = document.getElementById('balance-change');
    const balanceChangeText = formatPercentage(stats.balanceChange) + ' so với tháng trước';
    
    if (balanceChangeEl) {
        balanceChangeEl.textContent = balanceChangeText;
        // Sửa lỗi tham chiếu và cập nhật class màu sắc
        const parentDiv = balanceChangeEl.closest('.stat-change');
        if (parentDiv) {
            parentDiv.className = stats.balanceChange > 0 ? 'stat-change positive' : 'stat-change negative';
        }
    }
    
    // Cập nhật thay đổi của Today Orders (ĐÃ SỬA LỖI THAM CHIẾU)
    const ordersChangeEl = document.getElementById('orders-change'); 
    const ordersChangeText = (stats.ordersChange > 0 ? `+${stats.ordersChange}` : stats.ordersChange) + ' đơn so với hôm qua';
    
    if (ordersChangeEl) {
        ordersChangeEl.textContent = ordersChangeText;
        const parentDiv = ordersChangeEl.closest('.stat-change');
        if (parentDiv) {
            parentDiv.className = stats.ordersChange > 0 ? 'stat-change positive' : 'stat-change negative';
        }
    }
}


// Hàm 2: Cập nhật biểu đồ (Charts)
function updateCharts(charts) {
    // ----------------------------------------------------
    // 2.1. Biểu đồ Doanh thu (Line Chart)
    // ----------------------------------------------------
    const revenueCtx = document.getElementById('revenueChart');
    if (!revenueCtx) return; // Kiểm tra an toàn
    
    if (window.revenueChartInstance) {
        window.revenueChartInstance.destroy();
    }

    window.revenueChartInstance = new Chart(revenueCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: charts.revenueLabels,
            datasets: [{
                label: 'Doanh thu (Triệu ₫)',
                data: charts.revenueData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true },
                x: { } 
            }
        }
    });

    // ----------------------------------------------------
    // 2.2. Biểu đồ Tình trạng Đơn hàng (Doughnut Chart)
    // ----------------------------------------------------
    const orderTypeCtx = document.getElementById('orderTypeChart');
    if (!orderTypeCtx) return; // Kiểm tra an toàn
    
    if (window.orderTypeChartInstance) {
        window.orderTypeChartInstance.destroy();
    }
     
    window.orderTypeChartInstance = new Chart(orderTypeCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Thành công', 'Đang giao', 'Chờ xử lý', 'Đã hủy'],
            datasets: [{
                data: charts.orderTypeData,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)', 
                    'rgba(54, 162, 235, 0.8)', 
                    'rgba(255, 206, 86, 0.8)', 
                    'rgba(255, 99, 132, 0.8)' 
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}


// Hàm tạo HTML cho một mục Giao Dịch
function renderTransaction(item) {
    const amountClass = item.type === 'in' ? 'positive' : 'negative';
    const amountSign = item.type === 'in' ? '+' : '-';
    
    return `
        <li class="activity-item">
            <div class="activity-icon ${item.iconClass}">
                <i class="${item.icon}"></i>
            </div>
            <div class="activity-details">
                <p>${item.description}</p>
                <span>${item.time} • ${item.status}</span>
            </div>
            <div class="activity-amount ${amountClass}">${amountSign}${formatCurrency(item.amount)}</div>
        </li>
    `;
}

// Hàm tạo HTML cho một mục Đơn Hàng
function renderOrder(item) {
    const statusClass = item.iconClass; 
    
    return `
        <li class="activity-item">
            <div class="activity-icon ${statusClass}">
                <i class="${item.icon}"></i>
            </div>
            <div class="activity-details">
                <p>${item.orderId} • ${item.customer}</p>
                <span>${item.status} • ${item.time}</span>
            </div>
            <div class="activity-amount">${formatCurrency(item.cod)}</div>
        </li>
    `;
}

// Hàm 3: Cập nhật danh sách hoạt động (Transaction và Order)
function updateActivityLists(transactions, pendingOrders) {
    const transactionListEl = document.getElementById('transaction-list');
    const orderListEl = document.getElementById('order-list');
    
    // 1. Cập nhật Giao Dịch
    if (transactionListEl) {
        const transactionHtml = transactions.map(renderTransaction).join('');
        transactionListEl.innerHTML = transactionHtml;
    }
    
    // 2. Cập nhật Đơn Hàng
    if (orderListEl) {
        const orderHtml = pendingOrders.map(renderOrder).join('');
        orderListEl.innerHTML = orderHtml;
    }
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
        // Hiển thị lỗi nếu MockAPI không được định nghĩa hoặc lỗi mạng
        console.error("Error in loadDashboardData (Kiểm tra MockAPI và đường dẫn file):", error);
    }
}


// =========================================================================
// SỰ KIỆN KHỞI TẠO (INITIALIZATION)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});