# Product Management Mini App

Aplikasi fullstack sederhana untuk mengelola produk toko online kecil. Project ini berisi backend FastAPI, database MongoDB, autentikasi JWT, dan dashboard admin React untuk mengelola produk serta kategori.

## Tech Stack

- Backend: FastAPI, MongoDB Motor, Pydantic, JWT, bcrypt, pytest
- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query, Axios, Zod
- Database: MongoDB Atlas atau MongoDB lokal

## Fitur

- Login admin dengan JWT
- Proteksi halaman dashboard
- CRUD produk
- CRUD kategori
- Filter produk berdasarkan kategori
- Statistik dashboard
- Tabel produk dengan stok rendah
- Export produk ke CSV
- Loading state, error state, validasi form, dan konfirmasi hapus
- Layout admin yang responsif

## Screenshot Aplikasi

### Login

<img width="1896" height="1022" alt="image" src="https://github.com/user-attachments/assets/dd701e48-93cf-4210-acfc-2ec00fcb1b57" />

### Dashboard

<img width="1912" height="1003" alt="image" src="https://github.com/user-attachments/assets/327f0c40-43b5-4f49-9634-6b50a501275e" />

### Products

<img width="1893" height="1022" alt="image" src="https://github.com/user-attachments/assets/6ddb683c-41ae-47a6-a6ae-f34bb0a3663a" />
<br />
<img width="1905" height="1023" alt="image" src="https://github.com/user-attachments/assets/d3c9d47e-4f27-4a6e-931f-8f3a005a09ff" />


### Categories

<img width="1904" height="1030" alt="image" src="https://github.com/user-attachments/assets/470ee41e-d44e-44ca-b789-b0b4f167fb58" />
<br />
<img width="1904" height="1018" alt="image" src="https://github.com/user-attachments/assets/1927818e-7fd2-42c8-9451-ac521472b832" />

## Struktur Project

```txt
backend/
  main.py
  routers/
  models/
  services/
  database/
  auth/
  tests/

frontend/
  src/
    components/
    pages/
    lib/
```

## Requirement Setup

Pastikan sudah terinstall:

- Python 3.11 atau versi kompatibel
- Node.js dan npm
- Git

## Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

Buat dan aktifkan virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

Install dependency:

```bash
pip install -r requirements.txt
```

Buat file `backend/.env`:

```env
MONGODB_URI=mongodb-uri
JWT_SECRET_KEY=change-this-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Jika memakai MongoDB Atlas, isi `MONGODB_URI` dengan connection string dari Atlas.

Jalankan backend:

```bash
venv\Scripts\uvicorn.exe main:app --reload --host 0.0.0.0 --port 8000
```

Cek backend:

```txt
GET http://localhost:8000/health
```

Dokumentasi API otomatis tersedia di:

```txt
http://localhost:8000/docs
```

## Setup Frontend

Masuk ke folder frontend:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Buat file `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Jalankan frontend:

```bash
npm run dev
```

## Login Default

Backend akan membuat user admin saat startup berdasarkan environment variable berikut:

```env
ADMIN_USERNAME
ADMIN_PASSWORD
```

Gunakan value tersebut untuk login di halaman frontend.

## API Documentation

Semua endpoint yang dilindungi membutuhkan header:

```txt
Authorization: Bearer <token>
```

### Auth

```txt
POST /api/auth/login
GET  /api/auth/verify
```

### Products

```txt
GET    /api/products
GET    /api/products/{product_id}
POST   /api/products
PUT    /api/products/{product_id}
DELETE /api/products/{product_id}
```

Filter produk berdasarkan kategori:

```txt
GET /api/products?category_id=<category_id>
```

Contoh model produk:

```json
{
  "id": "uuid",
  "name": "Product name",
  "description": "Optional description",
  "price": 10.5,
  "category_id": "category uuid",
  "stock_quantity": 5,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Categories

```txt
GET    /api/categories
GET    /api/categories/{category_id}
POST   /api/categories
PUT    /api/categories/{category_id}
DELETE /api/categories/{category_id}
```

Contoh model kategori:

```json
{
  "id": "uuid",
  "name": "Category name",
  "description": "Optional description",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Dashboard

```txt
GET /api/dashboard/stats
```

Endpoint ini mengembalikan total produk, total kategori, total nilai inventori, dan daftar produk dengan stok rendah.

### Reports

```txt
GET /api/reports/products
```

Endpoint ini mengunduh data produk sebagai file `products.csv`.

## Testing

Jalankan test backend:

```bash
cd backend
venv\Scripts\pytest.exe -q
```

Jalankan pengecekan frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Deployment

Contoh start command backend untuk Render atau Railway:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Environment variable frontend:

```env
VITE_API_URL=https://your-backend-url
```

