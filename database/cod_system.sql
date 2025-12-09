/* 1. Tổng hợp tiền COD shipper đã thu theo ngày (Đối soát cuối ngày)*/
SELECT 
    u.id AS shipper_id,
    u.name AS shipper_name,
    COALESCE(SUM(cc.amount), 0) AS total_collected_today
FROM users u
LEFT JOIN cod_collected cc ON u.id = cc.shipper_id 
    AND DATE(cc.collected_at) = CURDATE()
WHERE u.role = 'shipper'
GROUP BY u.id, u.name
ORDER BY total_collected_today DESC;


/* 2. Tổng tiền shipper đã nộp và được duyệt trong ngày */
SELECT 
    u.id, u.name,
    COALESCE(SUM(cs.amount), 0) AS total_submitted_approved
FROM users u
LEFT JOIN cod_submitted cs ON u.id = cs.shipper_id 
    AND cs.approved = TRUE
    AND DATE(cs.submit_at) = CURDATE()
WHERE u.role = 'shipper'
GROUP BY u.id, u.name;


/* 3. Báo cáo đối soát tự động cuối ngày (Chênh lệch = thu - nộp) */
/* YÊU CẦU: Cần tạo query_1_today & query_2_today (view/subquery) trước */
SELECT 
    shipper_id,
    shipper_name,
    total_collected_today,
    total_submitted_approved,
    (total_collected_today - total_submitted_approved) AS difference
FROM (
    SELECT 
        COALESCE(col.shipper_id, sub.shipper_id) AS shipper_id,
        COALESCE(col.shipper_name, sub.shipper_name) AS shipper_name,
        COALESCE(col.total_collected_today, 0) AS total_collected_today,
        COALESCE(sub.total_submitted_approved, 0) AS total_submitted_approved
    FROM (SELECT * FROM query_1_today) col
    FULL OUTER JOIN (SELECT * FROM query_2_today) sub 
        ON col.shipper_id = sub.shipper_id
) summary
WHERE difference != 0;


/* 4. Cộng tiền vào ví tạm giữ (pending_balance) khi giao thành công */
INSERT INTO wallet_transactions (wallet_id, order_id, amount, type, status, created_at)
SELECT 
    w.id, o.id, o.cod_amount, 'cod_pending', 'completed', NOW()
FROM orders o
JOIN wallets w ON o.shop_id = w.shop_id
WHERE o.id = ?;   -- order_id đơn vừa giao thành công


/* 5. Duyệt nộp tiền → chuyển pending_balance → available_balance */
BEGIN;

UPDATE wallets 
SET pending_balance = pending_balance - cs.amount,
    available_balance = available_balance + cs.amount
WHERE shop_id = (
    SELECT shop_id 
    FROM orders o 
    JOIN cod_collected cc ON o.id = cc.order_id 
    WHERE cc.shipper_id = cs.shipper_id 
    LIMIT 1
);

UPDATE cod_submitted cs 
SET approved = TRUE, approved_by = ?, approved_at = NOW()
WHERE cs.id = ?;

COMMIT;


/* 6. Top 10 shipper thu COD nhiều nhất trong tháng */
SELECT 
    u.name, COUNT(cc.id) AS total_orders, SUM(cc.amount) AS total_cod
FROM cod_collected cc
JOIN users u ON cc.shipper_id = u.id
WHERE MONTH(cc.collected_at) = MONTH(CURDATE())
  AND YEAR(cc.collected_at) = YEAR(CURDATE())
GROUP BY u.id, u.name
ORDER BY total_cod DESC
LIMIT 10;


/* 7. Tìm đơn hàng thành công nhưng chưa có bản ghi COD (lỗi dữ liệu) */
SELECT o.id, o.customer_name, o.cod_amount, o.shipper_id
FROM orders o
LEFT JOIN cod_collected cc ON o.id = cc.order_id
WHERE o.status = 'success' AND cc.id IS NULL;


/* 8. Lịch sử dòng tiền ví điện tử của 1 shop */
SELECT 
    wt.created_at,
    wt.type,
    wt.amount,
    wt.status,
    o.id AS order_id
FROM wallet_transactions wt
LEFT JOIN orders o ON wt.order_id = o.id
WHERE wt.wallet_id = (SELECT id FROM wallets WHERE shop_id = ?)
ORDER BY wt.created_at DESC
LIMIT 100;


/*  9. Tạo báo cáo đối soát cuối ngày (chạy cron job) */
INSERT INTO reconciliation_reports 
    (report_date, shipper_id, total_collected, total_submitted, difference, status, created_at)
SELECT 
    CURDATE(),
    shipper_id,
    total_collected_today,
    total_submitted_approved,
    (total_collected_today - total_submitted_approved),
    CASE 
        WHEN (total_collected_today - total_submitted_approved) = 0 
            THEN 'closed' 
            ELSE 'disputed' 
    END,
    NOW()
FROM query_3_summary;


/* 10. Tỷ lệ giao thành công + thu COD của shipper (đánh giá hiệu suất) */
SELECT 
    u.name,
    COUNT(o.id) AS total_assigned,
    COUNT(cc.id) AS total_collected,
    ROUND(COUNT(cc.id)*100.0 / COUNT(o.id), 2) AS success_rate_percent
FROM users u
LEFT JOIN orders o ON u.id = o.shipper_id 
    AND o.status IN ('success','failed','returned')
LEFT JOIN cod_collected cc ON o.id = cc.order_id
WHERE u.role = 'shipper'
GROUP BY u.id, u.name
HAVING total_assigned > 0
ORDER BY success_rate_percent DESC;

