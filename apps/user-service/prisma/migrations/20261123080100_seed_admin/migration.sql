-- Seeds the first ADMIN account (replaces "register, then edit role in user_db.users").
--
-- `password` is a bcrypt hash (cost 10, same as user-service); the plain password is
-- not stored in the repo. Change it after the first login: PATCH /api/users/me.
--
-- If this email is already registered, nothing happens: an existing account is never
-- promoted to ADMIN by this migration.
INSERT INTO "users" ("email", "password", "fullName", "role")
VALUES (
  'admin@tiketbox.local',
  '$2b$10$vlRmu1NXIharWIL0Y5taAel0JN6XIzjRDrwIracxZz2cSAJBmKAEu',
  'Administrator',
  'ADMIN'
)
ON CONFLICT ("email") DO NOTHING;
