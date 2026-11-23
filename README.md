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
- **Database-per-service**: mỗi service có DB riêng trên cùng 1 Postgres (tạo bởi `docker/postgres/init.sql`), truy cập bằng **Prisma 7** (driver adapter `@prisma/adapter-pg`).
- **Redis**: đã có trong docker-compose, chưa dùng (dự kiến: cache, distributed lock khi giữ vé, queue, hoặc thay TCP transport).
- **libs/common**: constants, message patterns, DTO, enums, `databaseUrl`, exception filter dùng chung.

```
apps/
  api-gateway/      # HTTP → TCP, guards, modules: auth, user, event, booking, payment, ticket, checkin
  user-service/
    prisma/           # schema.prisma + migrations/ của riêng service
    prisma.config.ts  # config Prisma CLI (DB lấy từ USER_DB)
    src/prisma.service.ts
    src/generated/    # Prisma Client sinh ra (gitignore)
  auth-service/       # không có DB
  event-service/  booking-service/  payment-service/  ticket-service/  checkin-service/   # cấu trúc như user-service
libs/common/
scripts/prisma-all.mjs  # chạy 1 lệnh Prisma cho cả 6 service
docker/postgres/init.sql
```

## Chạy local

```bash
cp .env.example .env   # nếu chưa có
yarn install           # tự chạy prisma generate (postinstall)
yarn db:up             # Postgres + Redis
yarn db:migrate        # prisma migrate deploy cho cả 6 DB (gồm cả tạo tài khoản admin)
yarn start:all         # chạy cả 8 app (watch mode)
```

Chạy riêng lẻ: `yarn start:gateway`, `start:user`, `start:auth`, `start:event`, `start:booking`, `start:payment`, `start:ticket`, `start:checkin`.

## Database (Prisma)

- **CRUD** dùng Prisma Client (`this.prisma.<model>`). **Query phức tạp** viết SQL thuần bằng `this.prisma.$queryRaw` / `$executeRaw` (tagged template → tham số hoá, an toàn SQL injection).
- Bảng/cột giữ tên camelCase như trước (`"availableTickets"`, `"createdAt"`…), nên SQL thuần phải đặt tên cột trong dấu nháy kép.
- `DECIMAL` (giá, số tiền) được Prisma trả về dạng `Decimal`; service đổi sang `number` trước khi trả ra API.

Đổi schema của 1 service → tạo migration mới (cần Postgres đang chạy):

```bash
yarn prisma migrate dev --config apps/event-service/prisma.config.ts --name add_something
```

Migration chỉ chứa dữ liệu / SQL viết tay: thêm `--create-only`, sửa file `migration.sql` rồi chạy lại `yarn db:migrate`.

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

Tài khoản ADMIN đầu tiên `admin@tiketbox.local` được tạo bởi migration `apps/user-service/prisma/migrations/*_seed_admin` (chỉ lưu bcrypt hash, mật khẩu không có trong repo) — **đổi mật khẩu ngay sau lần đăng nhập đầu** qua `PATCH /users/me`. ADMIN tạo/đổi role cho STAFF qua `POST /users` hoặc `PATCH /users/:id`.

## TODO

- Payment provider thật + webhook, saga/compensation khi bước sau thất bại.
- Booking hết hạn tự động (Redis TTL / queue) để nhả vé.
- Refresh token, Dockerfile cho từng service.
