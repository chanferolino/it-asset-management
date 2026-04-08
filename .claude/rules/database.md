# Database Conventions

## Prisma Schema

- Use `@id @default(cuid())` for primary keys
- Use `@map("snake_case")` for column names, camelCase in Prisma models
- Use `@@map("snake_case_plural")` for table names
- Always include `createdAt` and `updatedAt` timestamps
- Use enums for fixed option sets
- Use relations with explicit foreign keys
