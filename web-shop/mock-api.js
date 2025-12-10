const MockAPI = {
    // Dữ liệu User Mock
    users: [
        {
            id: 1,
            email: '0123456789',
            password: 'password123',
            name: 'Sumo',
            phone: '0987654321',
            shopName: 'Shop Thời Trang A',
            role: 'Chủ shop', 
            avatar: 'SM',
            initialBalance: 25840000,
            status: 'active'
        }
    ],

    // =========================================================================
    // CHỨC NĂNG AUTH
    // =========================================================================

    login: function(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    // Khởi tạo dữ liệu wallet nếu chưa có
                    this.initializeUserWallet(user.id);
                    
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

    // =========================================================================
    // CHỨC NĂNG WALLET - HOÀN TOÀN ĐỘNG
    // =========================================================================

    // Khởi tạo dữ liệu wallet cho user
    initializeUserWallet: function(userId) {
        const walletKey = `wallet_${userId}`;
        const contactsKey = `wallet_contacts_${userId}`;
        
        // Chỉ khởi tạo nếu chưa có
        if (!localStorage.getItem(walletKey)) {
            const initialTransactions = this.generateInitialTransactions();
            localStorage.setItem(walletKey, JSON.stringify({
                balance: 25840000,
                lastUpdated: new Date().toISOString(),
                walletNumber: 'WALLET-' + (1000 + userId * 100),
                transactions: initialTransactions
            }));
        }
        
        if (!localStorage.getItem(contactsKey)) {
            const initialContacts = [
                { name: 'Trần Văn B', phone: '0987123456', color: '#4361ee' },
                { name: 'Lê Thị C', phone: '0912345678', color: '#06d6a0' },
                { name: 'Nguyễn Văn D', phone: '0934567890', color: '#ffd166' },
                { name: 'Phạm Thị E', phone: '0978901234', color: '#4cc9f0' },
                { name: 'Shop COD Express', phone: '19001001', color: '#ef476f' }
            ];
            localStorage.setItem(contactsKey, JSON.stringify(initialContacts));
        }
    },

    // Tạo giao dịch ban đầu
    generateInitialTransactions: function() {
        const now = new Date();
        const transactions = [];
        
        // Tạo giao dịch trong 30 ngày qua
        for (let i = 0; i < 20; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);
            
            const types = ['deposit', 'withdraw', 'transfer', 'payment'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let amount, description, status;
            
            switch(type) {
                case 'deposit':
                    amount = Math.floor(Math.random() * 5000000) + 1000000;
                    description = ['Nạp tiền từ VNPay', 'Nạp tiền từ MoMo', 'Thu hộ đơn hàng', 'Hoàn tiền đơn hàng'][Math.floor(Math.random() * 4)];
                    status = 'success';
                    break;
                case 'withdraw':
                    amount = -Math.floor(Math.random() * 3000000) + 500000;
                    description = ['Rút tiền về Vietcombank', 'Thanh toán đơn hàng', 'Chi phí vận chuyển'][Math.floor(Math.random() * 3)];
                    status = Math.random() > 0.2 ? 'success' : 'pending';
                    break;
                case 'transfer':
                    amount = -Math.floor(Math.random() * 2000000) + 100000;
                    description = ['Chuyển khoản cho đối tác', 'Chuyển tiền cho nhà cung cấp', 'Ứng tiền cho nhân viên'][Math.floor(Math.random() * 3)];
                    status = 'success';
                    break;
                case 'payment':
                    amount = -Math.floor(Math.random() * 1500000) + 100000;
                    description = ['Thanh toán hóa đơn điện', 'Mua nguyên liệu', 'Đóng phí dịch vụ'][Math.floor(Math.random() * 3)];
                    status = 'success';
                    break;
            }
            
            transactions.push({
                id: 'TXN-' + Date.now() + '-' + i,
                description: description,
                type: type,
                amount: amount,
                date: date.toISOString(),
                status: status,
                reference: 'GD' + date.getFullYear() + 
                          String(date.getMonth() + 1).padStart(2, '0') + 
                          String(date.getDate()).padStart(2, '0') + 
                          String(Math.floor(Math.random() * 1000)).padStart(3, '0')
            });
        }
        
        // Sắp xếp theo thời gian mới nhất
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // Lấy dữ liệu wallet
    getWalletData: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.getCurrentUser();
                if (!user) {
                    resolve({ success: false, message: 'Chưa đăng nhập' });
                    return;
                }
                
                const walletKey = `wallet_${user.id}`;
                const contactsKey = `wallet_contacts_${user.id}`;
                
                let walletData = JSON.parse(localStorage.getItem(walletKey));
                const contacts = JSON.parse(localStorage.getItem(contactsKey)) || [];
                
                // Nếu chưa có wallet data, khởi tạo
                if (!walletData) {
                    this.initializeUserWallet(user.id);
                    walletData = JSON.parse(localStorage.getItem(walletKey));
                }
                
                // Tính toán thống kê động
                const stats = this.calculateWalletStats(walletData.transactions);
                
                // Sử dụng dữ liệu biểu đồ mượt mà
                let charts;
                if (walletData.transactions.length > 30) {
                    charts = this.generateChartData(walletData.transactions);
                } else {
                    charts = this.createSmoothSampleData();
                }
                
                resolve({
                    success: true,
                    walletInfo: {
                        balance: walletData.balance,
                        lastUpdated: new Date().toISOString(),
                        walletNumber: walletData.walletNumber,
                        transactions: walletData.transactions.slice(0, 15), // Chỉ lấy 15 giao dịch gần nhất
                        contacts: contacts
                    },
                    user: user,
                    stats: stats,
                    charts: charts,
                    paymentMethods: this.getPaymentMethods(),
                    bankAccounts: this.getBankAccounts(user.name)
                });
            }, 500);
        });
    },

    // Tính toán thống kê từ transactions
    calculateWalletStats: function(transactions) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        // Lọc giao dịch tháng này
        const currentMonthTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        });
        
        // Lọc giao dịch tháng trước
        const lastMonthTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;
        });
        
        // Tính tổng theo loại
        const totalDeposit = currentMonthTransactions
            .filter(tx => tx.type === 'deposit')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
        const totalWithdraw = currentMonthTransactions
            .filter(tx => tx.type === 'withdraw')
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            
        const totalTransfer = currentMonthTransactions
            .filter(tx => tx.type === 'transfer')
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            
        const totalDepositLastMonth = lastMonthTransactions
            .filter(tx => tx.type === 'deposit')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
        const totalWithdrawLastMonth = lastMonthTransactions
            .filter(tx => tx.type === 'withdraw')
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            
        // Tính phần trăm thay đổi
        const depositChange = totalDepositLastMonth > 0 ? 
            ((totalDeposit - totalDepositLastMonth) / totalDepositLastMonth) : 0;
            
        const withdrawChange = totalWithdrawLastMonth > 0 ? 
            ((totalWithdraw - totalWithdrawLastMonth) / totalWithdrawLastMonth) : 0;
        
        // Tính tỉ lệ thành công
        const successfulTransactions = transactions.filter(tx => tx.status === 'success').length;
        const successRate = transactions.length > 0 ? 
            ((successfulTransactions / transactions.length) * 100).toFixed(1) : 100;
            
        // Giao dịch chờ xử lý
        const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;
        
        return {
            balanceChange: 0.125,
            monthlyTransactions: currentMonthTransactions.length,
            successRate: successRate + '%',
            totalDeposit: totalDeposit,
            totalWithdraw: totalWithdraw,
            totalTransfer: currentMonthTransactions.filter(tx => tx.type === 'transfer').length,
            pendingTransactions: pendingTransactions,
            depositChange: depositChange,
            withdrawChange: withdrawChange,
            transferChange: '+2 GD',
            pendingChange: pendingTransactions > 0 ? '+1 GD' : 'Không có'
        };
    },

    // Tạo dữ liệu biểu đồ từ transactions - PHIÊN BẢN ĐỀU ĐẶN
    generateChartData: function(transactions) {
        const now = new Date();
        const months = [];
        const depositData = [];
        const withdrawData = [];
        
        // Tạo dữ liệu cho 6 tháng gần nhất VỚI XU HƯỚNG TĂNG ĐỀU
        let baseDeposit = 15000000;  // Cơ sở 15 triệu
        let baseWithdraw = 8000000;  // Cơ sở 8 triệu
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('vi-VN', { month: 'short' });
            const year = date.getFullYear().toString().slice(-2);
            months.push(`${monthName}/${year}`);
            
            // Lọc giao dịch trong tháng này
            const monthTransactions = transactions.filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getMonth() === date.getMonth() && 
                       txDate.getFullYear() === date.getFullYear();
            });
            
            // Tính tổng nạp và rút THỰC TẾ
            let monthDeposit = monthTransactions
                .filter(tx => tx.type === 'deposit')
                .reduce((sum, tx) => sum + tx.amount, 0);
                
            let monthWithdraw = monthTransactions
                .filter(tx => tx.type === 'withdraw' || tx.type === 'transfer' || tx.type === 'payment')
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            
            // Nếu có dữ liệu thực TỐT, dùng dữ liệu thực
            // Nếu không, tạo dữ liệu MƯỢT MÀ dựa trên xu hướng
            if (monthDeposit > 1000000 && monthTransactions.length > 3) { // Có đủ dữ liệu
                // Làm mượt dữ liệu: trung bình với giá trị base
                monthDeposit = Math.round((monthDeposit + baseDeposit) / 2);
            } else {
                // Tạo dữ liệu mượt: tăng đều 3% mỗi tháng
                const growthFactor = Math.pow(1.03, 5-i); // Lũy thừa cho tăng trưởng đều
                monthDeposit = Math.round(baseDeposit * growthFactor);
                
                // Thêm biến động NHỎ (±8%)
                const variation = 0.92 + (Math.random() * 0.16); // 0.92 đến 1.08
                monthDeposit = Math.round(monthDeposit * variation);
            }
            
            if (monthWithdraw > 500000 && monthTransactions.length > 3) {
                monthWithdraw = Math.round((monthWithdraw + baseWithdraw) / 2);
            } else {
                const growthFactor = Math.pow(1.025, 5-i); // Tăng chậm hơn deposit
                monthWithdraw = Math.round(baseWithdraw * growthFactor);
                
                const variation = 0.90 + (Math.random() * 0.20); // 0.90 đến 1.10
                monthWithdraw = Math.round(monthWithdraw * variation);
            }
            
            // ĐẢM BẢO deposit luôn cao hơn withdraw (có lãi)
            if (monthDeposit <= monthWithdraw) {
                monthWithdraw = Math.round(monthDeposit * 0.75); // Withdraw = 75% deposit max
            }
            
            // ĐẢM BẢO giá trị hợp lý
            monthDeposit = Math.max(1000000, Math.min(30000000, monthDeposit));
            monthWithdraw = Math.max(500000, Math.min(20000000, monthWithdraw));
            
            depositData.push(monthDeposit);
            withdrawData.push(monthWithdraw);
            
            // Cập nhật base cho tháng tiếp theo
            baseDeposit = monthDeposit;
            baseWithdraw = monthWithdraw;
        }
        
        // Áp dụng moving average để làm MƯỢT hơn
        const smoothData = (data) => {
            if (data.length < 3) return data;
            
            const smoothed = [];
            for (let i = 0; i < data.length; i++) {
                if (i === 0) {
                    // Điểm đầu: trung bình của điểm đầu và điểm tiếp theo
                    smoothed.push(Math.round((data[i] + data[i+1]) / 2));
                } else if (i === data.length - 1) {
                    // Điểm cuối: trung bình của điểm cuối và điểm trước
                    smoothed.push(Math.round((data[i-1] + data[i]) / 2));
                } else {
                    // Điểm giữa: trung bình 3 điểm
                    smoothed.push(Math.round((data[i-1] + data[i] + data[i+1]) / 3));
                }
            }
            return smoothed;
        };
        
        const finalDepositData = smoothData(depositData);
        const finalWithdrawData = smoothData(withdrawData);
        
        // Phân bổ chi tiêu CHO SHOPCOD - CỐ ĐỊNH ĐỀU ĐẶN
        const expenseCategories = {
            'COD (Thu hộ)': 40,    // Cao nhất cho ShopCOD
            'Vận chuyển': 25,      // Chi phí ship
            'Mua nguyên liệu': 15, // Mua hàng
            'Phí dịch vụ': 10,     // Phí platform
            'Khác': 10             // Chi phí khác
        };
        
        // Nếu có nhiều dữ liệu thực (> 20 giao dịch), tính toán thực tế
        const expenseTransactions = transactions.filter(tx => 
            tx.type === 'withdraw' || tx.type === 'payment'
        );
        
        if (expenseTransactions.length > 20) {
            const calculatedExpenses = {
                'COD (Thu hộ)': 0,
                'Vận chuyển': 0,
                'Mua nguyên liệu': 0,
                'Phí dịch vụ': 0,
                'Khác': 0
            };
            
            let hasValidData = false;
            
            expenseTransactions.forEach(tx => {
                const amount = Math.abs(tx.amount);
                const desc = tx.description.toLowerCase();
                
                if (desc.includes('cod') || desc.includes('thu hộ') || desc.includes('đơn hàng') || desc.includes('đh')) {
                    calculatedExpenses['COD (Thu hộ)'] += amount;
                    hasValidData = true;
                } else if (desc.includes('vận chuyển') || desc.includes('ship') || desc.includes('giao hàng') || desc.includes('ghtk')) {
                    calculatedExpenses['Vận chuyển'] += amount;
                    hasValidData = true;
                } else if (desc.includes('mua') || desc.includes('nguyên liệu') || desc.includes('hàng hóa') || desc.includes('nhập')) {
                    calculatedExpenses['Mua nguyên liệu'] += amount;
                    hasValidData = true;
                } else if (desc.includes('phí') || desc.includes('dịch vụ') || desc.includes('platform') || desc.includes('commission')) {
                    calculatedExpenses['Phí dịch vụ'] += amount;
                    hasValidData = true;
                } else {
                    calculatedExpenses['Khác'] += amount;
                    hasValidData = true;
                }
            });
            
            // Chỉ dùng dữ liệu tính toán nếu có dữ liệu hợp lệ
            if (hasValidData && calculatedExpenses['COD (Thu hộ)'] > 0) {
                // Tính phần trăm
                const total = Object.values(calculatedExpenses).reduce((a, b) => a + b, 0);
                
                if (total > 0) {
                    const percentages = {};
                    Object.keys(calculatedExpenses).forEach(key => {
                        percentages[key] = Math.round((calculatedExpenses[key] / total) * 100);
                    });
                    
                    // Đảm bảo tổng = 100
                    let currentTotal = Object.values(percentages).reduce((a, b) => a + b, 0);
                    if (currentTotal !== 100) {
                        const diff = 100 - currentTotal;
                        // Thêm/trừ vào COD vì nó thường chiếm tỷ trọng lớn
                        percentages['COD (Thu hộ)'] += diff;
                    }
                    
                    // Đảm bảo COD chiếm tỷ trọng cao nhất (30-50%)
                    if (percentages['COD (Thu hộ)'] < 30) {
                        percentages['COD (Thu hộ)'] = 35;
                        // Điều chỉnh các mục khác
                        const otherTotal = 100 - percentages['COD (Thu hộ)'];
                        const otherItems = ['Vận chuyển', 'Mua nguyên liệu', 'Phí dịch vụ', 'Khác'];
                        const totalOther = otherItems.reduce((sum, item) => sum + (percentages[item] || 0), 0);
                        
                        otherItems.forEach(item => {
                            if (percentages[item]) {
                                percentages[item] = Math.round((percentages[item] / totalOther) * otherTotal);
                            }
                        });
                    }
                    
                    return {
                        spendingLabels: months,
                        depositData: finalDepositData,
                        withdrawData: finalWithdrawData,
                        expenseLabels: Object.keys(percentages),
                        expenseDistribution: Object.values(percentages)
                    };
                }
            }
        }
        
        // Nếu không có đủ dữ liệu, dùng mẫu CỐ ĐỊNH và ĐỀU ĐẶN
        return {
            spendingLabels: months,
            depositData: finalDepositData,
            withdrawData: finalWithdrawData,
            expenseLabels: Object.keys(expenseCategories),
            expenseDistribution: Object.values(expenseCategories)
        };
    },

    // Tạo dữ liệu mẫu MƯỢT MÀ cho lần đầu
    createSmoothSampleData: function() {
        const now = new Date();
        const months = [];
        const depositData = [];
        const withdrawData = [];
        
        // Tăng trưởng ỔN ĐỊNH cho shop COD
        let deposit = 12000000;  // Bắt đầu từ 12 triệu
        let withdraw = 7000000;  // Bắt đầu từ 7 triệu
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('vi-VN', { month: 'short' });
            const year = date.getFullYear().toString().slice(-2);
            months.push(`${monthName}/${year}`);
            
            // Tăng trưởng ĐỀU ĐẶN: deposit tăng 4%/tháng, withdraw tăng 3%/tháng
            const depositGrowth = Math.pow(1.04, 5-i);
            const withdrawGrowth = Math.pow(1.03, 5-i);
            
            const currentDeposit = Math.round(deposit * depositGrowth);
            const currentWithdraw = Math.round(withdraw * withdrawGrowth);
            
            // Thêm biến động RẤT NHỎ (±3%) để tự nhiên
            const depositVariation = 0.97 + (Math.random() * 0.06); // 0.97 đến 1.03
            const withdrawVariation = 0.96 + (Math.random() * 0.08); // 0.96 đến 1.04
            
            depositData.push(Math.round(currentDeposit * depositVariation));
            withdrawData.push(Math.round(currentWithdraw * withdrawVariation));
        }
        
        // Phân bổ chi tiêu CỐ ĐỊNH cho ShopCOD
        const expenseCategories = {
            'COD (Thu hộ)': 40,
            'Vận chuyển': 25,
            'Mua nguyên liệu': 15,
            'Phí dịch vụ': 10,
            'Khác': 10
        };
        
        // Tính phần trăm
        const totalExpense = Object.values(expenseCategories).reduce((a, b) => a + b, 0);
        const expenseDistribution = totalExpense > 0 ? 
            Object.values(expenseCategories).map(v => Math.round((v / totalExpense) * 100)) : 
            [25, 20, 15, 25, 15];
        
        return {
            spendingLabels: months,
            depositData: depositData,
            withdrawData: withdrawData,
            expenseLabels: Object.keys(expenseCategories),
            expenseDistribution: expenseDistribution
        };
    },

    // Thêm giao dịch mới - VỚI CẬP NHẬT BIỂU ĐỒ THÔNG MINH
    addTransaction: function(transactionData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.getCurrentUser();
                if (!user) {
                    resolve({ success: false, message: 'Chưa đăng nhập' });
                    return;
                }
                
                const walletKey = `wallet_${user.id}`;
                let walletData = JSON.parse(localStorage.getItem(walletKey));
                
                // Tạo transaction object với dữ liệu PHÙ HỢP CHO SHOPCOD
                const transactionTypes = {
                    'deposit': {
                        prefixes: ['Nạp', 'Thu hộ', 'Hoàn tiền', 'COD'],
                        defaultDesc: 'Nạp tiền vào ví'
                    },
                    'withdraw': {
                        prefixes: ['Rút', 'Thanh toán', 'Chi phí', 'Phí'],
                        defaultDesc: 'Rút tiền từ ví'
                    },
                    'transfer': {
                        prefixes: ['Chuyển', 'Ứng', 'Thanh toán NCC'],
                        defaultDesc: 'Chuyển khoản'
                    },
                    'payment': {
                        prefixes: ['Mua', 'Ship', 'Dịch vụ', 'Đơn hàng'],
                        defaultDesc: 'Thanh toán dịch vụ'
                    }
                };
                
                const typeInfo = transactionTypes[transactionData.type] || transactionTypes.deposit;
                let description = transactionData.description;
                
                // Tạo description tự động nếu không có
                if (!description && transactionData.amount) {
                    const amountText = Math.abs(transactionData.amount).toLocaleString('vi-VN');
                    const prefix = typeInfo.prefixes[Math.floor(Math.random() * typeInfo.prefixes.length)];
                    description = `${prefix} ${amountText} ₫`;
                    
                    // Thêm thông tin cụ thể cho COD
                    if (transactionData.type === 'deposit' && transactionData.amount > 500000) {
                        description = `Thu hộ COD đơn hàng #DH${Date.now().toString().slice(-6)}`;
                    } else if (transactionData.type === 'withdraw' && transactionData.amount < 0) {
                        description = `Chi phí vận chuyển đơn #DH${Date.now().toString().slice(-6)}`;
                    }
                }
                
                const transaction = {
                    id: 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                    description: description || typeInfo.defaultDesc,
                    type: transactionData.type,
                    amount: transactionData.amount,
                    date: new Date().toISOString(),
                    status: transactionData.instantUpdate ? 'success' : 'pending',
                    reference: transactionData.reference || 
                              'GD' + new Date().getFullYear().toString().slice(-2) + 
                              String(new Date().getMonth() + 1).padStart(2, '0') + 
                              String(new Date().getDate()).padStart(2, '0') + 
                              String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
                    method: transactionData.method,
                    recipient: transactionData.recipient,
                    feeOption: transactionData.feeOption,
                    bankAccount: transactionData.bankAccount
                };
                
                // Thêm vào đầu danh sách
                walletData.transactions.unshift(transaction);
                
                // Cập nhật số dư (nếu là giao dịch thành công ngay)
                if (transactionData.instantUpdate) {
                    walletData.balance += transaction.amount;
                }
                
                // Cập nhật thời gian
                walletData.lastUpdated = new Date().toISOString();
                
                // Lưu lại
                localStorage.setItem(walletKey, JSON.stringify(walletData));
                
                // Ghi nhận giao dịch cho biểu đồ
                this.recordTransactionForChart(transaction);
                
                // Nếu là chuyển khoản và có thông tin người nhận mới, thêm vào danh bạ
                if (transactionData.type === 'transfer' && transactionData.recipient) {
                    this.addContact({
                        name: transactionData.recipient,
                        phone: '',
                        color: this.getRandomColor()
                    });
                }
                
                resolve({
                    success: true,
                    transaction: transaction,
                    newBalance: walletData.balance,
                    message: 'Giao dịch đã được thêm thành công'
                });
            }, 300);
        });
    },

    // Ghi nhận giao dịch để cải thiện dữ liệu biểu đồ
    recordTransactionForChart: function(transaction) {
        const user = this.getCurrentUser();
        if (!user) return;
        
        const chartDataKey = `chart_data_${user.id}`;
        let chartData = JSON.parse(localStorage.getItem(chartDataKey)) || {
            monthlyTotals: {},
            categoryTotals: {}
        };
        
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        // Cập nhật tổng theo tháng
        if (!chartData.monthlyTotals[monthKey]) {
            chartData.monthlyTotals[monthKey] = { deposit: 0, withdraw: 0 };
        }
        
        if (transaction.type === 'deposit') {
            chartData.monthlyTotals[monthKey].deposit += Math.abs(transaction.amount);
        } else {
            chartData.monthlyTotals[monthKey].withdraw += Math.abs(transaction.amount);
        }
        
        // Cập nhật phân loại chi tiêu
        if (transaction.type === 'withdraw' || transaction.type === 'payment') {
            const category = this.categorizeExpense(transaction.description);
            if (!chartData.categoryTotals[category]) {
                chartData.categoryTotals[category] = 0;
            }
            chartData.categoryTotals[category] += Math.abs(transaction.amount);
        }
        
        localStorage.setItem(chartDataKey, JSON.stringify(chartData));
    },

    // Phân loại chi tiêu tự động
    categorizeExpense: function(description) {
        const desc = description.toLowerCase();
        
        if (desc.includes('cod') || desc.includes('thu hộ') || desc.includes('đơn hàng')) {
            return 'COD (Thu hộ)';
        } else if (desc.includes('vận chuyển') || desc.includes('ship') || desc.includes('giao hàng')) {
            return 'Vận chuyển';
        } else if (desc.includes('mua') || desc.includes('nguyên liệu') || desc.includes('hàng hóa')) {
            return 'Mua nguyên liệu';
        } else if (desc.includes('phí') || desc.includes('dịch vụ')) {
            return 'Phí dịch vụ';
        } else {
            return 'Khác';
        }
    },

    // Xác nhận giao dịch pending
    confirmTransaction: function(transactionId, status = 'success') {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.getCurrentUser();
                if (!user) {
                    resolve({ success: false, message: 'Chưa đăng nhập' });
                    return;
                }
                
                const walletKey = `wallet_${user.id}`;
                let walletData = JSON.parse(localStorage.getItem(walletKey));
                
                // Tìm và cập nhật transaction
                const transactionIndex = walletData.transactions.findIndex(tx => tx.id === transactionId);
                
                if (transactionIndex === -1) {
                    resolve({ success: false, message: 'Không tìm thấy giao dịch' });
                    return;
                }
                
                const transaction = walletData.transactions[transactionIndex];
                
                // Nếu đang pending và chuyển sang success, cập nhật số dư
                if (transaction.status === 'pending' && status === 'success') {
                    walletData.balance += transaction.amount;
                }
                
                // Cập nhật trạng thái
                walletData.transactions[transactionIndex].status = status;
                walletData.lastUpdated = new Date().toISOString();
                
                // Lưu lại
                localStorage.setItem(walletKey, JSON.stringify(walletData));
                
                resolve({
                    success: true,
                    transaction: walletData.transactions[transactionIndex],
                    newBalance: walletData.balance,
                    message: `Giao dịch đã được ${status === 'success' ? 'xác nhận thành công' : 'hủy bỏ'}`
                });
            }, 200);
        });
    },

    // Thêm contact mới
    addContact: function(contact) {
        const user = this.getCurrentUser();
        if (!user) return { success: false };
        
        const contactsKey = `wallet_contacts_${user.id}`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey)) || [];
        
        // Kiểm tra nếu đã tồn tại
        const exists = contacts.some(c => c.name === contact.name || c.phone === contact.phone);
        if (!exists) {
            contacts.push({
                ...contact,
                id: 'CONTACT-' + Date.now()
            });
            localStorage.setItem(contactsKey, JSON.stringify(contacts));
        }
        
        return { success: true };
    },

    // Lấy thông tin user hiện tại
    getCurrentUser: function() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userStr) return null;
        
        try {
            const user = JSON.parse(userStr);
            // Tìm user trong mock data để lấy id
            const mockUser = this.users.find(u => u.email === user.email);
            return mockUser ? { ...user, id: mockUser.id } : user;
        } catch {
            return null;
        }
    },

    // Helper functions
    getPaymentMethods: function() {
        return [
            { value: 'vnpay', name: 'VNPay', icon: 'fas fa-qrcode' },
            { value: 'momo', name: 'Ví MoMo', icon: 'fas fa-mobile-alt' },
            { value: 'zalopay', name: 'ZaloPay', icon: 'fab fa-font-awesome' },
            { value: 'banking', name: 'Chuyển khoản ngân hàng', icon: 'fas fa-university' },
            { value: 'visa', name: 'Thẻ Visa/Mastercard', icon: 'fas fa-credit-card' }
        ];
    },

    getBankAccounts: function(userName) {
        return [
            { id: 'vcb', bank: 'Vietcombank', last4: '1234', name: userName || 'Nguyễn Văn A' },
            { id: 'vpb', bank: 'VPBank', last4: '5678', name: userName || 'Nguyễn Văn A' },
            { id: 'tcb', bank: 'Techcombank', last4: '9012', name: userName || 'Nguyễn Văn A' },
            { id: 'mb', bank: 'MB Bank', last4: '3456', name: userName || 'Nguyễn Văn A' }
        ];
    },

    getRandomColor: function() {
        const colors = ['#4361ee', '#06d6a0', '#ffd166', '#4cc9f0', '#ef476f', '#7209b7', '#f72585'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // =========================================================================
    // CHỨC NĂNG LỊCH SỬ GIAO DỊCH (HISTORY) - SỬA LẠI CHO ĐÚNG
    // =========================================================================

    // Lấy danh sách giao dịch với bộ lọc và phân trang
    getHistoryTransactions: function(filters = {}) {
        console.log('📊 MockAPI.getHistoryTransactions called with:', filters);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const user = this.getCurrentUser();
                    if (!user) {
                        resolve({ 
                            success: false, 
                            message: 'Chưa đăng nhập',
                            data: { transactions: [], pagination: {} }
                        });
                        return;
                    }
                    
                    const walletKey = `wallet_${user.id}`;
                    const walletData = JSON.parse(localStorage.getItem(walletKey));
                    
                    if (!walletData || !walletData.transactions) {
                        console.log('📦 No wallet data found, generating sample data');
                        // Tạo dữ liệu mẫu nếu chưa có
                        this.initializeUserWallet(user.id);
                        const newData = JSON.parse(localStorage.getItem(walletKey));
                        
                        if (!newData) {
                            resolve({ 
                                success: true, 
                                data: { 
                                    transactions: this.generateSampleTransactions(),
                                    pagination: { page: 1, totalPages: 1, total: 10 }
                                }
                            });
                            return;
                        }
                        
                        // Sử dụng dữ liệu mới tạo
                        walletData = newData;
                    }
                    
                    console.log(`📦 Found ${walletData.transactions.length} transactions`);
                    
                    let transactions = [...walletData.transactions];
                    
                    // Format thời gian đúng chuẩn
                    transactions = transactions.map(tx => ({
                        ...tx,
                        time: new Date(tx.date).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        })
                    }));
                    
                    // Áp dụng bộ lọc thời gian
                    transactions = this.filterTransactionsByDate(transactions, filters.dateRange || 'month');
                    
                    // Áp dụng bộ lọc tìm kiếm
                    if (filters.search) {
                        const searchTerm = filters.search.toLowerCase();
                        transactions = transactions.filter(t => 
                            t.description.toLowerCase().includes(searchTerm) ||
                            (t.reference && t.reference.toLowerCase().includes(searchTerm)) ||
                            t.id.toLowerCase().includes(searchTerm)
                        );
                    }
                    
                    // Áp dụng bộ lọc loại giao dịch
                    if (filters.type && filters.type !== 'all') {
                        transactions = transactions.filter(t => t.type === filters.type);
                    }
                    
                    // Áp dụng bộ lọc trạng thái
                    if (filters.status && filters.status !== 'all') {
                        transactions = transactions.filter(t => t.status === filters.status);
                    }
                    
                    // Áp dụng bộ lọc số tiền
                    if (filters.minAmount) {
                        const min = parseInt(filters.minAmount);
                        if (!isNaN(min)) {
                            transactions = transactions.filter(t => Math.abs(t.amount) >= min);
                        }
                    }
                    
                    if (filters.maxAmount) {
                        const max = parseInt(filters.maxAmount);
                        if (!isNaN(max)) {
                            transactions = transactions.filter(t => Math.abs(t.amount) <= max);
                        }
                    }
                    
                    console.log(`🔍 After filtering: ${transactions.length} transactions`);
                    
                    // Tính toán phân trang
                    const page = filters.page || 1;
                    const limit = filters.limit || 10;
                    const total = transactions.length;
                    const totalPages = Math.ceil(total / limit) || 1;
                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    const paginatedTransactions = transactions.slice(startIndex, endIndex);
                    
                    // Format lại dữ liệu cho hiển thị
                    const formattedTransactions = paginatedTransactions.map(tx => ({
                        id: tx.id,
                        reference: tx.reference || tx.id,
                        time: tx.time,
                        type: tx.type,
                        note: tx.description,
                        amount: tx.amount,
                        status: tx.status,
                        customer: this.extractCustomerFromDescription(tx.description)
                    }));
                    
                    const result = {
                        success: true,
                        message: "Lấy dữ liệu lịch sử thành công",
                        data: {
                            transactions: formattedTransactions,
                            pagination: {
                                page,
                                limit,
                                total,
                                totalPages,
                                hasNextPage: endIndex < total,
                                hasPrevPage: startIndex > 0
                            }
                        }
                    };
                    
                    console.log('✅ Returning history data:', result);
                    resolve(result);
                    
                } catch (error) {
                    console.error('❌ Error in getHistoryTransactions:', error);
                    resolve({
                        success: true,
                        message: "Lấy dữ liệu thành công",
                        data: {
                            transactions: this.generateSampleTransactions(),
                            pagination: { page: 1, totalPages: 1, total: 5 }
                        }
                    });
                }
            }, 300);
        });
    },

    // Tạo dữ liệu mẫu cho history
    generateSampleTransactions: function() {
        const now = new Date();
        const sampleTransactions = [];
        
        for (let i = 0; i < 10; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const types = ['deposit', 'withdraw', 'transfer', 'payment'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let amount, note, status;
            
            switch(type) {
                case 'deposit':
                    amount = Math.floor(Math.random() * 5000000) + 1000000;
                    note = ['Nạp tiền từ Vietcombank', 'Nạp tiền từ MoMo', 'Thu hộ COD đơn hàng #DH20240515001'][Math.floor(Math.random() * 3)];
                    status = 'success';
                    break;
                case 'withdraw':
                    amount = -Math.floor(Math.random() * 3000000) - 500000;
                    note = ['Rút tiền về VPBANK', 'Thanh toán đơn hàng', 'Chi phí vận chuyển'][Math.floor(Math.random() * 3)];
                    status = Math.random() > 0.3 ? 'success' : 'pending';
                    break;
                case 'transfer':
                    amount = -Math.floor(Math.random() * 2000000) - 100000;
                    note = ['Chuyển khoản cho NCC Vải', 'Ứng tiền cho nhân viên', 'Thanh toán hóa đơn'][Math.floor(Math.random() * 3)];
                    status = 'success';
                    break;
                case 'payment':
                    amount = -Math.floor(Math.random() * 1500000) - 100000;
                    note = ['Thanh toán hóa đơn điện', 'Mua nguyên liệu', 'Đóng phí dịch vụ'][Math.floor(Math.random() * 3)];
                    status = 'success';
                    break;
            }
            
            sampleTransactions.push({
                id: 'TXN-SAMPLE-' + i,
                reference: 'GD' + date.getFullYear().toString().slice(-2) + 
                          String(date.getMonth() + 1).padStart(2, '0') + 
                          String(date.getDate()).padStart(2, '0') + 
                          String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
                time: date.toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }),
                type: type,
                note: note,
                amount: amount,
                status: status,
                customer: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'][Math.floor(Math.random() * 4)]
            });
        }
        
        return sampleTransactions;
    },

    // Lọc giao dịch theo thời gian
    filterTransactionsByDate: function(transactions, dateRange) {
        if (!dateRange || dateRange === 'all') {
            return transactions;
        }
        
        const now = new Date();
        let startDate = new Date();
        
        switch(dateRange) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            default:
                return transactions;
        }
        
        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= startDate;
        });
    },

    // Trích xuất tên khách hàng từ mô tả
    extractCustomerFromDescription: function(description) {
        if (!description) return 'Không xác định';
        
        const lowerDesc = description.toLowerCase();
        
        // Mẫu thông tin khách hàng
        const customers = [
            'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 
            'Hoàng Văn E', 'Đặng Thị F', 'Bùi Văn G', 'Mai Thị H',
            'Võ Văn I', 'Hồ Thị K', 'Ngô Văn L', 'Trương Thị M'
        ];
        
        // Kiểm tra nếu có chứa tên khách hàng trong mô tả
        for (const customer of customers) {
            const firstName = customer.toLowerCase().split(' ')[0];
            if (lowerDesc.includes(firstName)) {
                return customer;
            }
        }
        
        // Nếu description chứa từ khóa đặc biệt
        if (lowerDesc.includes('đơn hàng') || lowerDesc.includes('cod') || lowerDesc.includes('ncc')) {
            return customers[Math.floor(Math.random() * 8)]; // Lấy ngẫu nhiên 8 khách đầu
        }
        
        // Nếu không tìm thấy, chọn ngẫu nhiên
        return customers[Math.floor(Math.random() * customers.length)];
    },

    // Lấy thống kê cho lịch sử giao dịch
    getHistoryStatistics: function(filters = {}) {
        console.log('📈 MockAPI.getHistoryStatistics called');
        
        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    // Lấy tất cả giao dịch đã lọc
                    const response = await this.getHistoryTransactions({ 
                        ...filters, 
                        page: 1, 
                        limit: 10000 
                    });
                    
                    if (!response.success) {
                        resolve({
                            success: true,
                            data: {
                                totalAmount: 2357724,
                                income: 13919131,
                                expense: 11561407,
                                pending: 0,
                                depositChange: 0.243,
                                withdrawChange: -0.085
                            }
                        });
                        return;
                    }
                    
                    const transactions = response.data.transactions;
                    
                    if (!transactions || transactions.length === 0) {
                        // Trả về dữ liệu mẫu nếu không có giao dịch
                        resolve({
                            success: true,
                            data: {
                                totalAmount: 2357724,
                                income: 13919131,
                                expense: 11561407,
                                pending: 0,
                                depositChange: 0.243,
                                withdrawChange: -0.085,
                                transactionCount: 0
                            }
                        });
                        return;
                    }
                    
                    // Tính toán thống kê từ dữ liệu thực
                    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
                    const income = transactions
                        .filter(t => t.amount > 0)
                        .reduce((sum, t) => sum + t.amount, 0);
                    const expense = transactions
                        .filter(t => t.amount < 0)
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                    const pending = transactions.filter(t => t.status === 'pending').length;
                    
                    resolve({
                        success: true,
                        data: {
                            totalAmount: Math.abs(totalAmount),
                            income: income,
                            expense: expense,
                            pending: pending,
                            depositChange: 0.243, // Mẫu: 24.3% tăng
                            withdrawChange: -0.085 // Mẫu: -8.5% giảm
                        },
                        message: "Lấy thống kê thành công"
                    });
                    
                } catch (error) {
                    console.error('❌ Error in getHistoryStatistics:', error);
                    // Trả về dữ liệu mẫu an toàn
                    resolve({
                        success: true,
                        data: {
                            totalAmount: 2357724,
                            income: 13919131,
                            expense: 11561407,
                            pending: 0,
                            depositChange: 0.243,
                            withdrawChange: -0.085
                        }
                    });
                }
            }, 200);
        });
    },

    // Xuất dữ liệu lịch sử
    exportHistoryData: function(format = 'pdf', filters = {}) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    // Lấy tất cả giao dịch đã lọc
                    const response = await this.getHistoryTransactions({ 
                        ...filters, 
                        page: 1, 
                        limit: 10000 
                    });
                    
                    if (!response.success) {
                        resolve({
                            success: true,
                            message: `Xuất ${format.toUpperCase()} thành công`,
                            data: {
                                filename: `lich_su_giao_dich.${format}`,
                                downloadUrl: `#`,
                                count: 0,
                                format: format
                            }
                        });
                        return;
                    }
                    
                    const transactionCount = response.data.transactions.length;
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('vi-VN').replace(/\//g, '-');
                    
                    resolve({
                        success: true,
                        message: `Xuất ${format.toUpperCase()} thành công (${transactionCount} giao dịch)`,
                        data: {
                            filename: `lich_su_giao_dich_${dateStr}.${format}`,
                            downloadUrl: `#`,
                            count: transactionCount,
                            format: format
                        }
                    });
                } catch (error) {
                    console.error('❌ Error in exportHistoryData:', error);
                    resolve({
                        success: false,
                        message: "Lỗi xuất dữ liệu",
                        data: null
                    });
                }
            }, 500);
        });
    },

    // =========================================================================
    // CHỨC NĂNG DASHBOARD
    // =========================================================================

    getDashboardData: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.getCurrentUser();
                const walletKey = `wallet_${user.id}`;
                const walletData = JSON.parse(localStorage.getItem(walletKey));
                
                if (!walletData) {
                    resolve({ success: false, message: 'Không tìm thấy dữ liệu' });
                    return;
                }
                
                const transactions = walletData.transactions.slice(0, 8);
                
                resolve({
                    success: true,
                    stats: {
                        totalBalance: walletData.balance,
                        todayOrders: Math.floor(Math.random() * 20) + 30,
                        revenue: Math.floor(walletData.balance * 0.7),
                        newCustomers: Math.floor(Math.random() * 10) + 5,
                        balanceChange: 0.125,
                        ordersChange: 8,
                        revenueChange: 0.243,
                        customersChange: -2
                    },
                    charts: {
                        revenueLabels: ['1/5', '5/5', '10/5', '15/5', '20/5', '25/5', '30/5'],
                        revenueData: [8.2, 12.5, 18.2, 22.8, 24.5, 25.1, 26.9],
                        orderTypeData: [65, 20, 10, 5]
                    },
                    transactions: transactions.map(tx => ({
                        type: tx.type === 'deposit' ? 'in' : 'out',
                        description: tx.description,
                        amount: Math.abs(tx.amount),
                        time: new Date(tx.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                        status: tx.status === 'success' ? 'Thành công' : 
                               tx.status === 'pending' ? 'Đang xử lý' : 'Thất bại',
                        icon: tx.type === 'deposit' ? 'fas fa-arrow-down' : 
                             tx.type === 'withdraw' ? 'fas fa-arrow-up' : 'fas fa-exchange-alt',
                        iconClass: tx.status === 'success' ? 'success' : 
                                  tx.status === 'pending' ? 'warning' : 'danger'
                    })),
                    pendingOrders: [
                        { orderId: '#DH20240515001', customer: 'Trần Văn B', cod: 850000, status: 'Đang giao', time: 'Dự kiến 16:00', icon: 'fas fa-box', iconClass: 'primary' },
                        { orderId: '#DH20240515002', customer: 'Lê Thị C', cod: 1200000, status: 'Đang đóng gói', time: 'Giao sáng mai', icon: 'fas fa-box', iconClass: 'primary' },
                        { orderId: '#DH20240514003', customer: 'Nguyễn Văn D', cod: 450000, status: 'Chờ xác nhận', time: 'Chưa có shipper', icon: 'fas fa-exclamation-triangle', iconClass: 'warning' },
                    ]
                });
            }, 800);
        });
    }
};

// Khởi tạo MockAPI toàn cục
if (typeof window !== 'undefined') {
    window.MockAPI = MockAPI;
    console.log('✅ MockAPI loaded successfully');
}