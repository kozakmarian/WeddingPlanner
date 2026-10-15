INSERT INTO "User" ("id", "email", "passwordHash", "createdAt", "updatedAt")
VALUES ('legacy-user', 'legacy@example.test', 'hash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Wedding" ("id", "userId", "name", "date", "location", "budget", "createdAt", "updatedAt")
VALUES ('legacy-wedding', 'legacy-user', 'Alex & Sam', '2027-06-12', 'Chateau Bela', 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Guest" ("id", "weddingId", "name", "attendance", "accompanyingGuests", "createdAt", "updatedAt")
VALUES
  ('legacy-guest-1', 'legacy-wedding', 'Jamie Novak', 'ATTENDING', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('legacy-guest-2', 'legacy-wedding', 'Taylor Smith', 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "BudgetItem" ("id", "weddingId", "name", "category", "estimatedCost", "createdAt", "updatedAt")
VALUES
  ('legacy-budget-1', 'legacy-wedding', 'Venue', 'Venue', 8500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('legacy-budget-2', 'legacy-wedding', 'Flowers', 'Decor', 1800, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Task" ("id", "weddingId", "title", "completed", "createdAt", "updatedAt")
VALUES
  ('legacy-task-1', 'legacy-wedding', 'Book photographer', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('legacy-task-2', 'legacy-wedding', 'Send invitations', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
