# Tiketbox Backend

NestJS microservices (monorepo) cho hệ thống bán vé sự kiện.

## Kiến trúc

```
Client ──HTTP──► api-gateway (:3000/api)
                    │  TCP
     ┌──────────┬───┴──────┬───────────┬────────────┬───────────┬────────────┐
 user-svc   auth-svc   event-svc  booking-svc  payment-svc  ticket-svc  checkin-svc
  :4001      :4002      :4003       :4004        :4005        :4006       :4007
  user_db   (JWT)      event_db   booking_db   payment_db   ticket_db   checkin_db
```

- **api-gateway**: HTTP duy nhất, validate DTO, xác thực JWT (gọi auth-service), phân quyền theo role.
- **Database-per-service**: mỗi service có DB riêng trên cùng 1 Postgres (tạo bởi `docker/postgres/init.sql`).
- **Redis**: đã có trong docker-compose, chưa dùng (dự kiến: cache, distributed lock khi giữ vé, queue, hoặc thay TCP transport).
- **libs/common**: constants, message patterns, DTO, enums, DatabaseModule, exception filter dùng chung.

```
apps/
  api-gateway/      # HTTP → TCP, guards, modules: auth, user, event, booking, payment, ticket, checkin
  user-service/
  auth-service/
  event-service/
  booking-service/
  payment-service/
  ticket-service/
  checkin-service/
libs/common/
docker/postgres/init.sql
```

## Chạy local

```bash
cp .env.example .env   # nếu chưa có
npm install
docker compose up -d   # Postgres + Redis
npm run start:all      # chạy cả 8 app (watch mode)
```

Chạy riêng lẻ: `npm run start:gateway`, `start:user`, `start:auth`, `start:event`, `start:booking`, `start:payment`, `start:ticket`, `start:checkin`.

> `DB_SYNC=true` cho phép TypeORM tự tạo bảng — chỉ dùng khi dev, production cần chuyển sang migrations.

## API (prefix `/api`)

| Method | Path | Quyền |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | public |
| GET | `/auth/me` | đã đăng nhập |
| GET/PATCH | `/users/me` | đã đăng nhập |
| GET/POST/PATCH/DELETE | `/users`, `/users/:id` | ADMIN |
| GET | `/events`, `/events/:id` | public |
| POST/PATCH/DELETE | `/events`, `/events/:id` | ADMIN |
| POST/GET | `/bookings`, `/bookings/:id` | đã đăng nhập |
| PATCH | `/bookings/:id/cancel` | đã đăng nhập |
| POST/GET | `/payments`, `/payments/:id` | đã đăng nhập |
| GET | `/tickets`, `/tickets/:id` | đã đăng nhập |
| POST | `/checkins` | STAFF, ADMIN |
| GET | `/checkins/events/:eventId` | STAFF, ADMIN |

Header: `Authorization: Bearer <accessToken>`.

Swagger UI: http://localhost:3000/docs (JSON: `/docs-json`). Bấm **Authorize** và dán `accessToken` để gọi API cần đăng nhập.

## Luồng mua vé

1. `POST /bookings { eventId, quantity }` → event-service trừ `availableTickets` (atomic) → booking `PENDING`.
2. `POST /payments { bookingId, method }` → thanh toán (mock) → booking `CONFIRMED` → ticket-service phát hành vé (mỗi vé có `code`).
3. `POST /checkins { ticketCode }` (staff quét QR) → vé chuyển `USED`, lưu lịch sử check-in. Mỗi vé chỉ check-in được 1 lần.

Event mới tạo có status `DRAFT`; cần `PATCH /events/:id { "status": "PUBLISHED" }` mới đặt vé được.

Tài khoản ADMIN/STAFF đầu tiên: đăng ký bình thường rồi sửa `role` trực tiếp trong `user_db.users`.

## TODO

- Payment provider thật + webhook, saga/compensation khi bước sau thất bại.
- Booking hết hạn tự động (Redis TTL / queue) để nhả vé.
- Refresh token, migrations, Dockerfile cho từng service.
