# Rừng Tri Thức

Hệ thống câu đố nhiều phòng gồm:

- Chủ phòng tạo phòng và đăng nhập lại bằng tài khoản riêng.
- Mỗi đội đăng ký hoặc đăng nhập lại từ link mời.
- Chủ phòng theo dõi đội tham gia và nhật ký mở gợi ý theo giờ UTC+7.
- Đáp án và ảnh đầy đủ chỉ do backend xử lý.
- Có chế độ hướng dẫn/testing dùng đáp án `test` và ảnh placeholder, không trả ảnh trò chơi thật.
- PostgreSQL được lưu trong Docker volume nên dữ liệu không mất khi restart container.

## Chạy toàn bộ hệ thống bằng Docker

Tạo file cấu hình:

```bash
cp .env.example .env
```

Điền `JWT_SECRET` tối thiểu 32 ký tự, đáp án bí mật và mật khẩu PostgreSQL.
Backend chỉ không phân biệt chữ hoa/chữ thường; mọi biến thể khác đều bị từ chối.
Sau đó chạy:

```bash
docker compose up --build -d
```

Mở `http://localhost:8080`. Đổi cổng bằng `APP_PORT` trong `.env`.

Kiểm tra trạng thái:

```bash
docker compose ps
docker compose logs -f
```

Dừng hệ thống mà vẫn giữ dữ liệu:

```bash
docker compose down
```

Chỉ dùng `docker compose down -v` khi muốn xóa toàn bộ phòng, đội và nhật ký.

## Deploy lên Vercel

Repository có [`Dockerfile.vercel`](Dockerfile.vercel) để Vercel build frontend
và backend thành một HTTP container. Không cần điền Build Command, Output
Directory hoặc Install Command theo chế độ Vite tĩnh.

Trước khi deploy:

1. Trong Vercel Marketplace, tạo hoặc kết nối PostgreSQL từ Neon, Supabase hoặc
   nhà cung cấp tương thích.
2. Bảo đảm project có biến `DATABASE_URL` do nhà cung cấp cấp.
3. Thêm `JWT_SECRET` tối thiểu 32 ký tự.
4. Thêm `QUIZ_ANSWER` chứa đáp án bí mật.
5. Chỉ đặt `DATABASE_SSL=true` nếu connection string của nhà cung cấp chưa tự
   khai báo chế độ SSL.

Container tự đọc biến `$PORT`, khởi tạo schema PostgreSQL khi khởi động và phục
vụ cả frontend lẫn `/api` trên cùng domain.

## Phát triển local

Backend:

```bash
docker compose up -d postgres
cd server
npm ci
npm start
```

Frontend ở terminal khác:

```bash
npm ci
npm run dev
```

Vite sẽ proxy `/api` tới backend ở cổng `3000`.
