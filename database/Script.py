import pandas as pd
from faker import Faker
import random
import time
import unicodedata

# Cấu hình
fake = Faker('vi_VN')
SO_LUONG_NGUOI = 1000  

def generate_people(n):
    print(f"--- Bắt đầu tạo dữ liệu cho {n} người... ---")
    start_time = time.time()
    
    data = []
    prefixes = ['09', '03', '07', '08', '05']
    
    for i in range(1, n + 1):
        # Tạo giới tính
        gender = random.choice(['Nam', 'Nữ'])
        
        # Sửa: Dùng name() chung nếu name_male/female lỗi ở bản cũ, 
        # nhưng thường name_male() vẫn chạy tốt. 
        # Nếu lỗi tiếp ở dòng này, hãy đổi thành fake.name()
        if gender == 'Nam':
            try:
                name = fake.name_male()
            except:
                name = fake.name()
        else:
            try:
                name = fake.name_female()
            except:
                name = fake.name()
            
        phone = random.choice(prefixes) + str(fake.random_number(digits=8, fix_len=True))
        
        # Hàm xử lý email
        def remove_accents(input_str):
            s1 = unicodedata.normalize('NFD', input_str)
            s2 = "".join(c for c in s1 if unicodedata.category(c) != 'Mn')
            return s2.replace(" ", "").lower()
            
        email_user = remove_accents(name)
        email = f"{email_user}{random.randint(10,99)}@gmail.com"

        person = {
            "User_ID": f"USR{i:05d}",
            "Họ_Tên": name,
            "Giới_Tính": gender,
            "Ngày_Sinh": fake.date_of_birth(minimum_age=18, maximum_age=65).strftime('%d/%m/%Y'),
            "Số_Điện_Thoại": phone,
            "Email": email,
            "Địa_Chỉ": fake.street_address(),
            # --- ĐÃ SỬA DÒNG NÀY ---
            "Thành_Phố": fake.city(), 
            "Nghề_Nghiệp": fake.job()
        }
        data.append(person)
        
        if i % 100 == 0:
            print(f"...Đã tạo {i} dòng...")

    end_time = time.time()
    print(f"--- Hoàn tất trong {round(end_time - start_time, 2)} giây ---")
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    df_people = generate_people(SO_LUONG_NGUOI)
    
    filename = 'Danh_Sach_Nguoi_Dung.csv'
    df_people.to_csv(filename, index=False, encoding='utf-8-sig')
    
    print(f"✅ File đã được lưu tại: {filename}")