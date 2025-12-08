import pandas as pd
from faker import Faker
import random
from datetime import datetime, timedelta
import os

# Cấu hình Faker
fake = Faker('vi_VN')

# --- CẤU HÌNH SỐ LƯỢNG ---
NUM_SHOPS = 10         
NUM_SHIPPERS = 15      
NUM_ADMINS = 3         
NUM_ORDERS = 500       

# Danh sách Quận/Huyện TP.HCM
HCM_DISTRICTS = [
    'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 
    'Quận 11', 'Quận 12', 'TP. Thủ Đức', 'Quận Bình Thạnh', 'Quận Gò Vấp', 
    'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Huyện Bình Chánh'
]

def get_hcm_address():
    street = fake.street_name()
    district = random.choice(HCM_DISTRICTS)
    number = fake.building_number()
    return f"{number} {street}, {district}, TP.HCM"

# ==========================================
# 1. TẠO USERS
# ==========================================
def generate_users():
    users = []
    for i in range(1, NUM_SHOPS + 1):
        users.append({"User_ID": f"U_SHOP_{i:03d}", "Username": f"shop_hcm_{i}", "Password": "123", "Role": "SHOP"})
    for i in range(1, NUM_SHIPPERS + 1):
        users.append({"User_ID": f"U_SHIP_{i:03d}", "Username": f"shipper_hcm_{i}", "Password": "123", "Role": "SHIPPER"})
    for i in range(1, NUM_ADMINS + 1):
        users.append({"User_ID": f"U_ADMIN_{i:03d}", "Username": f"admin_hcm_{i}", "Password": "admin", "Role": "ADMIN"})
    return pd.DataFrame(users)

# ==========================================
# 2. TẠO SHOPS
# ==========================================
def generate_shops(df_users):
    shops = []
    shop_users = df_users[df_users['Role'] == 'SHOP']['User_ID'].tolist()
    for user_id in shop_users:
        shops.append({
            "Shop_ID": f"SHOP_{user_id.split('_')[-1]}",
            "User_ID": user_id,
            "Ten_Shop": fake.company(),
            "Chu_Shop": fake.name(),
            "SDT_Lien_He": f"09{fake.msisdn()[3:]}",
            "Dia_Chi_Kho": get_hcm_address(),
            "So_Du_Vi": random.randint(0, 50) * 100000,
            "Ngan_Hang": random.choice(["Vietcombank HCM", "ACB HCM", "Sacombank"]),
            "STK": fake.credit_card_number(card_type='visa')
        })
    return pd.DataFrame(shops)

# ==========================================
# 3. TẠO SHIPPERS
# ==========================================
def generate_shippers(df_users):
    shippers = []
    shipper_users = df_users[df_users['Role'] == 'SHIPPER']['User_ID'].tolist()
    hcm_hubs = ['Kho Thủ Đức', 'Kho Gò Vấp', 'Kho Quận 7', 'Kho Tân Bình', 'Kho Bình Tân']
    for user_id in shipper_users:
        shippers.append({
            "Shipper_ID": f"SHP_{user_id.split('_')[-1]}",
            "User_ID": user_id,
            "Ho_Ten": fake.name(),
            "SDT": f"09{fake.msisdn()[3:]}",
            "Bien_So_Xe": f"59-{fake.random_uppercase_letter()}{random.randint(1,9)} {random.randint(1000,9999)}",
            "Khu_Vuc_Hub": random.choice(hcm_hubs),
            "Tien_Ky_Quy": 5000000,
            "Cash_On_Hand": 0 
        })
    return pd.DataFrame(shippers)

# ==========================================
# 4. TẠO ORDERS
# ==========================================
def generate_orders(n, list_shop_ids, list_shipper_ids):
    orders = []
    statuses = ['Mới tạo', 'Đang lấy', 'Đang giao', 'Đã giao', 'Hoàn trả', 'Hủy']
    for _ in range(n):
        created_at = fake.date_time_between(start_date='-30d', end_date='now')
        shop_id = random.choice(list_shop_ids)
        status = random.choice(statuses)
        assigned_shipper = None
        if status not in ['Mới tạo', 'Hủy']:
            assigned_shipper = random.choice(list_shipper_ids)
            
        orders.append({
            "Order_ID": f"HCM{fake.random_number(digits=8)}",
            "Shop_ID": shop_id,
            "Shipper_ID": assigned_shipper,
            "Nguoi_Nhan": fake.name(),
            "SDT_Nhan": f"07{fake.msisdn()[3:]}",
            "Dia_Chi_Nhan": get_hcm_address(),
            "Tien_COD": random.choice([0, 150000, 250000, 500000, 1200000]),
            "Phi_Ship": random.choice([16000, 22000, 30000]),
            "Trang_Thai": status,
            "Ngay_Tao": created_at
        })
    return pd.DataFrame(orders)

# ==========================================
# 5. TẠO LOGS & CẬP NHẬT TIỀN
# ==========================================
def process_logs_and_cash(df_orders, df_shippers):
    logs = []
    for _, row in df_orders.iterrows():
        order_id = row['Order_ID']
        status = row['Trang_Thai']
        shipper_id = row['Shipper_ID']
        time_base = row['Ngay_Tao']
        
        logs.append([fake.uuid4(), order_id, "Mới tạo", time_base, "Shop tạo đơn tại TP.HCM"])
        
        if status in ['Mới tạo', 'Hủy']: continue
        
        time_assign = time_base + timedelta(minutes=30)
        logs.append([fake.uuid4(), order_id, "Đã điều phối", time_assign, f"Gán cho Shipper {shipper_id}"])
        
        time_pick = time_assign + timedelta(hours=2)
        logs.append([fake.uuid4(), order_id, "Đang giao", time_pick, "Shipper đã lấy hàng"])
        
        time_end = time_pick + timedelta(hours=random.randint(1, 24))
        desc = "Giao thành công" if status == 'Đã giao' else "Giao thất bại/Hoàn trả"
        logs.append([fake.uuid4(), order_id, status, time_end, desc])

    df_logs = pd.DataFrame(logs, columns=["Log_ID", "Order_ID", "Trang_Thai", "Thoi_Gian", "Mo_Ta"])

    # Tính lại tiền Shipper đang cầm
    delivered_orders = df_orders[df_orders['Trang_Thai'] == 'Đã giao']
    cash_summary = delivered_orders.groupby('Shipper_ID')['Tien_COD'].sum().reset_index()
    
    df_shippers_final = df_shippers.copy()
    for index, row in cash_summary.iterrows():
        shp_id = row['Shipper_ID']
        total_cash = row['Tien_COD']
        df_shippers_final.loc[df_shippers_final['Shipper_ID'] == shp_id, 'Cash_On_Hand'] = total_cash

    return df_logs, df_shippers_final

# ==========================================
# XUẤT CSV
# ==========================================
if __name__ == "__main__":
    print("--- Đang tạo dữ liệu CSV cho hệ thống COD TP.HCM ---")
    
    # 1. Logic tạo dữ liệu
    df_users = generate_users()
    df_shops = generate_shops(df_users)
    df_shippers_raw = generate_shippers(df_users)
    shop_ids = df_shops['Shop_ID'].tolist()
    shipper_ids = df_shippers_raw['Shipper_ID'].tolist()
    df_orders = generate_orders(NUM_ORDERS, shop_ids, shipper_ids)
    df_logs, df_shippers_final = process_logs_and_cash(df_orders, df_shippers_raw)

    # 2. Xuất ra 5 file CSV riêng biệt
    print("Đang lưu file CSV...")
    
    df_users.to_csv('database/data/Users.csv', index=False, encoding='utf-8-sig')
    df_shops.to_csv('database/data/Shops.csv', index=False, encoding='utf-8-sig')
    df_shippers_final.to_csv('database/data/Shippers.csv', index=False, encoding='utf-8-sig')
    df_orders.to_csv('database/data/Orders.csv', index=False, encoding='utf-8-sig')
    df_logs.to_csv('database/data/Tracking_Logs.csv', index=False, encoding='utf-8-sig')
    
    print(f"\n✅ THÀNH CÔNG! Đã tạo 5 file CSV tại thư mục hiện tại:")
    print("   1. Users.csv")
    print("   2. Shops.csv")
    print("   3. Shippers.csv")
    print("   4. Orders.csv")
    print("   5. Tracking_Logs.csv")