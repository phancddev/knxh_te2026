# Rừng Tri Thức

Ứng dụng câu đố tương tác xây dựng bằng React, TypeScript và Vite.

## Chạy local

```bash
npm ci
npm run dev
```

## Build production

```bash
npm run build
```

## Docker

```bash
docker build -t knxh-quiz .
docker run --rm -p 8080:80 knxh-quiz
```

## GitHub Pages

Mỗi lần push lên branch `main`, workflow
[`deploy-pages.yml`](.github/workflows/deploy-pages.yml) sẽ build và triển khai ứng dụng tại:

https://phancddev.github.io/knxh_te2026/
