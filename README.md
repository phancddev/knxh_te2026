# Rừng Tri Thức

Hệ thống câu đố nhiều phòng gồm:

- Chủ phòng tạo phòng và đăng nhập lại bằng tài khoản riêng.
- Mỗi đội đăng ký hoặc đăng nhập lại từ link mời.
- Chủ phòng theo dõi đội tham gia và nhật ký mở gợi ý theo giờ UTC+7.
- Đáp án, alias và ảnh đầy đủ chỉ do backend xử lý.
- SQLite được lưu trong Docker volume nên dữ liệu không mất khi restart container.

## Chạy toàn bộ hệ thống bằng Docker

Tạo file cấu hình:

```bash
cp .env.example .env
```

Điền `JWT_SECRET` tối thiểu 32 ký tự và đáp án bí mật. Backend chỉ không phân
biệt chữ hoa/chữ thường; mọi biến thể khác đều bị từ chối.
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

## Phát triển local

Backend:

```bash
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
