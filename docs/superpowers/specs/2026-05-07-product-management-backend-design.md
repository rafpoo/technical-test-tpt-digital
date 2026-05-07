# Product Management Backend Design

**Date:** 2026-05-07
**Tech Stack:** FastAPI, MongoDB, JWT, Pydantic, pytest

## Overview

Monolithic FastAPI backend for product management with authentication, CRUD operations, dashboard statistics, and CSV export.

## Architecture

### Project Structure
```
backend/
├── main.py              # App entry point, route registration
├── routers/             # API route modules
│   ├── auth.py
│   ├── categories.py
│   ├── products.py
│   ├── dashboard.py
│   └── reports.py
├── models/              # Pydantic schemas
│   ├── auth.py
│   ├── categories.py
│   ├── products.py
│   └── dashboard.py
├── services/            # Business logic layer
│   ├── auth_service.py
│   ├── category_service.py
│   ├── product_service.py
│   ├── dashboard_service.py
│   └── report_service.py
├── database/            # MongoDB connection and repositories
│   ├── connection.py
│   ├── user_repository.py
│   ├── category_repository.py
│   └── product_repository.py
├── auth/                # JWT token generation/validation
│   ├── security.py
│   └── dependencies.py
├── utils/               # Helper functions
│   └── csv_export.py
└── tests/               # Unit tests
    ├── conftest.py
    ├── test_auth.py
    ├── test_categories.py
    ├── test_products.py
    ├── test_dashboard.py
    └── test_reports.py
```

### MongoDB Collections
- `users` — admin credentials
- `categories` — category data
- `products` — product data

## API Endpoints

### Authentication
- `POST /api/auth/login` — Login, returns JWT token
- `GET /api/auth/verify` — Validate token

### Categories
- `GET /api/categories` — List all categories
- `POST /api/categories` — Create category
- `GET /api/categories/{id}` — Get category by ID
- `PUT /api/categories/{id}` — Update category
- `DELETE /api/categories/{id}` — Delete category

### Products
- `GET /api/products` — List all products (optional `?category_id=` filter)
- `POST /api/products` — Create product
- `GET /api/products/{id}` — Get product by ID
- `PUT /api/products/{id}` — Update product
- `DELETE /api/products/{id}` — Delete product

### Dashboard
- `GET /api/dashboard/stats` — Get statistics (total products, categories, inventory value, low stock)

### Reports
- `GET /api/reports/products` — Export all products as CSV

## Data Models

### User
```python
{
    "id": UUID,
    "username": str (unique),
    "password_hash": str,
    "created_at": datetime,
    "updated_at": datetime
}
```

### Category
```python
{
    "id": UUID,
    "name": str (max 50, unique),
    "description": str (optional, max 200),
    "created_at": datetime,
    "updated_at": datetime
}
```

### Product
```python
{
    "id": UUID,
    "name": str (max 100),
    "description": str (optional, max 500),
    "price": Decimal (positive),
    "category_id": UUID (foreign key),
    "stock_quantity": int (non-negative),
    "created_at": datetime,
    "updated_at": datetime
}
```

### Dashboard Stats
```python
{
    "total_products": int,
    "total_categories": int,
    "total_inventory_value": Decimal,
    "low_stock_products": List[Product] (stock < 10)
}
```

## Data Flow

### Authentication Flow
1. Client sends POST `/api/auth/login` with username/password
2. `AuthService` verifies credentials against MongoDB
3. If valid, generates JWT token (24h expiration)
4. Returns token to client
5. Client includes token in `Authorization: Bearer <token>` header
6. Protected routes validate token via dependency injection

### CRUD Flow
1. Client sends request with auth token
2. Middleware validates token
3. Router validates request with Pydantic model
4. Service layer handles business logic
5. Repository layer performs MongoDB operations
6. Response returned with Pydantic model

### CSV Export Flow
1. Client sends GET `/api/reports/products` with auth token
2. `ReportService` queries all products
3. Generates CSV with: name, description, price, category, stock
4. Returns file with `Content-Type: text/csv`

## Error Handling

| Error Type | Status Code | Response |
|------------|-------------|----------|
| Validation error | 422 | `{"detail": "Error message"}` |
| Duplicate category name | 400 | `{"detail": "Category name already exists"}` |
| Invalid UUID | 422 | `{"detail": "Invalid UUID format"}` |
| Missing/invalid token | 401 | `{"detail": "Could not validate credentials"}` |
| Expired token | 401 | `{"detail": "Token has expired"}` |
| Wrong credentials | 401 | `{"detail": "Incorrect username or password"}` |
| Product not found | 404 | `{"detail": "Product not found"}` |
| Category not found | 404 | `{"detail": "Category not found"}` |
| Server error | 500 | `{"detail": "Internal server error"}` |

## Security

### Password Storage
- bcrypt hashing (12 rounds)
- Never store plain text passwords

### JWT Tokens
- HS256 algorithm
- Secret key from `JWT_SECRET_KEY` environment variable
- 24-hour expiration
- Payload includes user_id

### API Security
- CORS enabled for frontend origin
- Input validation via Pydantic
- No SQL injection risk (MongoDB)

### Environment Variables
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET_KEY` — JWT signing secret
- `ADMIN_USERNAME` — Default admin username
- `ADMIN_PASSWORD` — Default admin password

## Testing

### Unit Tests (pytest)
- `test_auth.py` — login, token validation
- `test_categories.py` — CRUD operations
- `test_products.py` — CRUD operations, category filter
- `test_dashboard.py` — statistics calculation
- `test_reports.py` — CSV generation

### Test Setup
- `conftest.py` — fixtures for MongoDB test database
- Mock MongoDB for unit tests
- Test admin user fixture

### Coverage Goal
80%+

## Validation Rules

### Product
- name: required, max 100 characters
- description: optional, max 500 characters
- price: required, positive decimal
- category_id: required, valid UUID
- stock_quantity: required, non-negative integer

### Category
- name: required, max 50 characters, unique
- description: optional, max 200 characters