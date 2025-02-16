# Distributed URL Worker

## Features

- **Distributed Task Processing:** Processes tasks concurrently using a worker that periodically picks tasks from the database.
- **Database Integration:** Uses PostgreSQL to store tasks, their statuses, and HTTP response codes.
- **Migrations & Seeding:** Manages database schema and seed data using `node-pg-migrate`.
- **Express API:** Provides endpoints to add tasks, list tasks, and reset the database.
- **Worker Process:** A dedicated worker (with periodic processing) that processes tasks concurrently.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://your-repository-url.git
   cd your-repository-folder
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the server:**

   ```bash
   npm run start
   ```

4. **Run the worker:**

   ```bash
   npm run worker
   ```

5. **Reset the database:**

   ```bash
   npm run migrate:down
   npm run migrate:up
   ```

6. **Add tasks:**

   ```bash
   curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"url": "https://example.com"}'
   ```

7. **List tasks:**

   ```bash
   curl http://localhost:3000/tasks
   ```

8. **Reset the database:**

   ```bash
   npm run migrate:down
   npm run migrate:up
   ```
