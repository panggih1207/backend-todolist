# Todo List REST API Backend

Backend REST API untuk aplikasi Todo List menggunakan Node.js, Express, dan Prisma ORM dengan PostgreSQL.

## Tech Stack

- **Runtime:** Node.js v24+
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL
- **ORM:** Prisma v7.3.0
- **Module System:** ES Modules (`"type": "module"`)
- **Dev Tool:** nodemon

---

## Struktur Project

```
todo_list_app_be/
├── prisma/
│   └── schema.prisma          # Database schema & konfigurasi Prisma
├── src/
│   ├── conn.js                # Koneksi database & instance Prisma Client
│   ├── server.js              # Entry point application
│   ├── routes.js              # Route definitions
│   └── todos/
│       └── todos.service.js   # Business logic untuk todos
├── generated/                 # Generated Prisma Client (auto-generated)
├── .env                       # Environment variables (jangan di-commit)
├── prisma.config.ts           # Konfigurasi Prisma CLI
├── package.json               # Dependencies & scripts
└── README.md                  # Dokumentasi ini
```

---

## Setup Project dari Awal

### 1. Inisialisasi Project Baru

```bash
# Buat folder project
mkdir todo_list_app_be
cd todo_list_app_be

# Inisialisasi package.json dengan ES modules
npm init -y
```

Edit `package.json` dan tambahkan `"type": "module"`:

```json
{
  "name": "todo_list_app_be",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js"
  }
}
```

### 2. Install Dependencies

```bash
# Install production dependencies
npm install express cors dotenv pg @prisma/client @prisma/adapter-pg

# Install dev dependencies
npm install -D nodemon prisma @types/pg
```

**Penjelasan Dependencies:**

| Package | Kegunaan |
|---------|----------|
| `express` | Web framework |
| `cors` | Cross-Origin Resource Sharing middleware |
| `dotenv` | Load environment variables dari .env |
| `pg` | PostgreSQL driver untuk Node.js |
| `@prisma/client` | Prisma Client untuk query database |
| `@prisma/adapter-pg` | Adapter untuk menghubungkan Prisma dengan PostgreSQL |
| `nodemon` | Auto-restart server saat file berubah (dev) |
| `prisma` | Prisma CLI untuk generate client, migrate, dll (dev) |

### 3. Setup Database dengan Prisma

#### Step 3a: Inisialisasi Prisma

```bash
npx prisma init
```

Perintah ini akan membuat:
- `prisma/schema.prisma` - File konfigurasi schema database
- `.env` - File environment variables

#### Step 3b: Konfigurasi Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**Penjelasan:**
- `generator client`: Konfigurasi bagaimana Prisma Client di-generate
  - `provider = "prisma-client-js"`: Generate JavaScript client (untuk project JS)
  - `output = "../generated/prisma"`: Custom output directory
- `datasource db`: Konfigurasi koneksi database
  - `provider = "postgresql"`: Tipe database yang digunakan
  - `url = env("DATABASE_URL")`: Ambil connection string dari environment variable

#### Step 3c: Setup Environment Variables

Edit `.env`:

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Contoh untuk PostgreSQL lokal:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tododb"
```

#### Step 3d: Generate Prisma Client

```bash
npx prisma generate
```

**Kapan menggunakan `prisma generate`:**
- **WAJIB** setelah mengubah `schema.prisma`
- **WAJIB** setelah menginstal Prisma pertama kali
- **WAJIB** setelah `npm install`
- **TIDAK perlu** setiap kali menjalankan aplikasi
- **TIDAK perlu** jika hanya mengubah data (hanya schema yang trigger re-generate)

Perintah ini akan menghasilkan file Prisma Client di direktori `generated/prisma/`.

#### Step 3e: Buat Migration (Buat tabel di database)

```bash
npx prisma migrate dev --name init
```

**Kapan menggunakan `prisma migrate dev`:**
- **Hanya saat development**
- Untuk membuat tabel/kolom baru di database
- Akan otomatis menjalankan `prisma generate` setelah migration berhasil

**Perintah migration lainnya:**

| Perintah | Kegunaan |
|----------|----------|
| `npx prisma migrate dev` | Create & apply migration (development) |
| `npx prisma migrate deploy` | Apply migration tanpa membuat baru (production) |
| `npx prisma migrate reset` | Reset database & re-apply semua migration |
| `npx prisma migrate status` | Cek status migration |

### 4. Buat File Koneksi Database

Buat `src/conn.js`:

```javascript
import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
```

**Penjelasan:**
- `dotenv/config`: Load environment variables
- `pg.Pool`: Koneksi pool ke PostgreSQL
- `PrismaPg`: Adapter yang menghubungkan Prisma dengan pg
- `PrismaClient`: Instance Prisma untuk query database

### 5. Buat Service Layer

Buat `src/todos/todos.service.js`:

```javascript
import prisma from "../conn.js";

export const getAllTodos = async () => {
  return await prisma.todo.findMany();
};

export const createTodo = async (title) => {
  return await prisma.todo.create({
    data: { title }
  });
};
```

**Penjelasan Prisma Methods:**
- `prisma.todo.findMany()`: SELECT semua record dari tabel todos
- `prisma.todo.create()`: INSERT record baru ke tabel todos

### 6. Buat Routes

Buat `src/routes.js`:

```javascript
import express, { Router } from 'express';
import { createTodo, getAllTodos } from './todos/todos.service.js';

const router = Router();

router.get('/', async (req, res) => {
  const todos = await getAllTodos();
  res.json(todos);
});

router.post('/', async (req, res) => {
  const { title } = req.body;
  const newTodo = await createTodo(title);
  res.status(201).json(newTodo);
});

export default router;
```

### 7. Buat Server Entry Point

Buat `src/server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import router from './routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/todos', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

### 8. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000` dengan auto-restart.

---

## API Endpoints

### GET /api/todos
Get semua todos

**Response:**
```json
[
  {
    "id": 1,
    "title": "Belajar Prisma",
    "completed": false,
    "createdAt": "2026-02-04T10:30:00.000Z"
  }
]
```

### POST /api/todos
Create todo baru

**Request Body:**
```json
{
  "title": "Todo baru"
}
```

**Response:**
```json
{
  "id": 2,
  "title": "Todo baru",
  "completed": false,
  "createdAt": "2026-02-04T10:35:00.000Z"
}
```

---

## Prisma Commands Reference

### Development Workflow

```bash
# 1. Ubah schema di prisma/schema.prisma

# 2. Generate ulang Prisma Client
npx prisma generate

# 3. (Opsional) Buat migration jika ada perubahan tabel
npx prisma migrate dev --name deskripsi_migration

# 4. Jalankan server
npm run dev
```

### Perintah-perintah Penting

| Perintah | Kegunaan | Kapan Dipakai |
|----------|----------|--------------|
| `npx prisma init` | Inisialisasi Prisma | Setup project baru |
| `npx prisma generate` | Generate Prisma Client | Setelah ubah schema |
| `npx prisma migrate dev` | Create & apply migration | Saat develop, ubah tabel |
| `npx prisma migrate deploy` | Apply migration | Di production |
| `npx prisma studio` | Buka GUI database | Development, melihat data |
| `npx prisma db seed` | Seed database | Isi data dummy |
| `npx prisma db push` | Push schema ke DB tanpa migration | Quick prototyping |

### Prisma Studio (GUI Database)

```bash
npx prisma studio
```

Akan membuka GUI di browser untuk melihat dan edit data secara visual.

---

## Troubleshooting

### Error: Cannot find Prisma Client

**Problem:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'generated/prisma/client/index.js'
```

**Solution:**
```bash
npx prisma generate
```

### Error: Database connection failed

**Problem:**
```
Error: Can't reach database server
```

**Solution:**
1. Pastikan PostgreSQL berjalan
2. Cek `DATABASE_URL` di `.env`
3. Pastikan database sudah dibuat

### Error: Relation does not exist

**Problem:**
```
Error: Relation "todos" does not exist
```

**Solution:**
```bash
# Jalankan migration
npx prisma migrate dev

# Atau push schema (hanya untuk development)
npx prisma db push
```

---

## Best Practices

1. **Jangan commit `generated/` dan `node_modules/`**
   - Tambahkan ke `.gitignore`

2. **Jangan commit `.env`**
   - Gunakan `.env.example` sebagai template

3. **Selalu generate setelah ubah schema**
   - `npx prisma generate` setelah edit `schema.prisma`

4. **Gunakan migration di development**
   - `npx prisma migrate dev` untuk track perubahan schema

5. **Gunakan `prisma migrate deploy` di production**
   - Jangan gunakan `migrate dev` atau `db push` di production

---

## Deployment Checklist

- [ ] Set `DATABASE_URL` di environment production
- [ ] Jalankan `npx prisma migrate deploy` untuk apply migration
- [ ] Pastikan `npx prisma generate` dijalankan saat build
- [ ] Set `NODE_ENV=production` untuk optimalisasi

---

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
