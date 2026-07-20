# Inventory SaaS Backend Production Blueprint

This file is a single-place reference for building the backend in a production-safe way.
It is intentionally written as a blueprint, not implementation code.

## 1. Goals

- Keep the backend modular and easy to maintain.
- Make APIs predictable and consistent.
- Add validation, auth, and error handling from day one.
- Support pagination, filtering, and search for large datasets.
- Keep the system safe for production deployment.

## 2. Suggested Stack

- Next.js App Router route handlers
- MongoDB + Mongoose
- Zod or Joi for request validation
- JWT or session-based auth
- Role-based access control
- Centralized error response helper
- Logger for server-side debugging

## 3. Recommended Folder Structure

```text
src/
  app/
    api/
      auth/
      products/
      categories/
      orders/
      suppliers/
      reports/
      settings/
    lib/
      db.js
      auth.js
      error.js
      response.js
    models/
      userSchema.js
      productSchema.js
      categorySchema.js
      orderSchema.js
      supplierSchema.js
    validators/
      product.js
      category.js
      order.js
      supplier.js
      auth.js
    services/
      productService.js
      categoryService.js
      orderService.js
      supplierService.js
    middleware/
      authMiddleware.js
      roleMiddleware.js
      validateMiddleware.js
```

## 4. Core API Standards

Every API should return a consistent shape.

### Success response

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {},
  "meta": {}
}
```

### Error response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

## 5. Authentication

### Minimum auth requirements

- Login
- Logout
- Current user session
- Protected routes
- Role-based access

### Suggested roles

- `admin`
- `manager`
- `staff`

### Route protection rules

- `admin`: full access
- `manager`: products, categories, orders, reports
- `staff`: limited read/update access

## 6. Data Models

### User

- name
- email
- passwordHash
- role
- isActive
- createdAt
- updatedAt

### Product

- name
- price
- costPrice
- stock
- category
- sku
- description
- status
- createdAt
- updatedAt

### Category

- name
- description
- slug
- createdAt
- updatedAt

### Order

- orderNumber
- customerName
- items
- totalAmount
- status
- shippingAddress
- paymentStatus
- createdAt
- updatedAt

### Supplier

- name
- contact
- email
- rating
- status
- productCount
- createdAt
- updatedAt

## 7. API Endpoints

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Products

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Categories

- `GET /api/categories`
- `POST /api/categories`
- `GET /api/categories/:id`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Orders

- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`

### Suppliers

- `GET /api/suppliers`
- `POST /api/suppliers`
- `GET /api/suppliers/:id`
- `PUT /api/suppliers/:id`
- `DELETE /api/suppliers/:id`

### Reports

- `GET /api/reports/summary`
- `GET /api/reports/sales`
- `GET /api/reports/stock`
- `GET /api/reports/orders`

### Settings

- `GET /api/settings`
- `PUT /api/settings`

## 8. Validation Rules

### Product validation

- `name`: required, trimmed, minimum length 2
- `price`: required, number, greater than 0
- `costPrice`: optional, number, greater than or equal to 0
- `stock`: required, integer, greater than or equal to 0
- `category`: required
- `sku`: optional, unique if provided
- `description`: optional, max length limit

### Category validation

- `name`: required, unique, trimmed
- `description`: optional

### Order validation

- `customerName`: required
- `items`: required, non-empty array
- `totalAmount`: required, number
- `status`: required, one of allowed enum values

### Supplier validation

- `name`: required
- `email`: optional but valid if present
- `contact`: optional
- `rating`: optional number between 0 and 5

## 9. Database Indexes

Important indexes for production:

- `Product.name`
- `Product.category`
- `Product.sku` unique
- `Product.createdAt`
- `Order.orderNumber` unique
- `Order.status`
- `Supplier.email`
- `Category.name` unique

## 10. Pagination and Search

For list endpoints:

- accept `page`
- accept `limit`
- accept `search`
- accept `sortBy`
- accept `sortOrder`

Default behavior:

- `page = 1`
- `limit = 10`
- sort by `createdAt desc`

Response meta should include:

- current page
- limit
- total items
- total pages
- hasNext
- hasPrev

## 11. Error Handling

Use a central error pattern.

### Common cases

- validation error -> `400`
- unauthenticated -> `401`
- forbidden -> `403`
- not found -> `404`
- duplicate key -> `409`
- server error -> `500`

### Suggested policy

- never leak stack traces to client
- log stack traces on the server only
- return user-friendly messages

## 12. Security Checklist

- hash passwords with bcrypt
- store secrets in `.env.local`
- validate all incoming data
- sanitize string inputs
- protect all write routes
- enforce role checks
- use HTTP-only cookies if using sessions
- rate limit auth endpoints
- set `SameSite`, `Secure`, and `HttpOnly` where relevant
- do not expose internal DB details in responses

## 13. Logging

Log these server events:

- auth failures
- validation failures
- DB errors
- unexpected exceptions
- important admin actions

Avoid logging:

- passwords
- tokens
- full card data
- secret env values

## 14. File-by-File Build Order

Recommended order to implement:

1. `src/app/lib/db.js`
2. `src/app/lib/response.js`
3. `src/app/lib/error.js`
4. `src/app/models/*`
5. `src/app/validators/*`
6. `src/app/services/*`
7. `src/app/api/auth/*`
8. `src/app/api/products/*`
9. `src/app/api/categories/*`
10. `src/app/api/orders/*`
11. `src/app/api/suppliers/*`
12. `src/app/api/reports/*`
13. `src/app/api/settings/*`

## 15. Production Readiness Checklist

- [ ] all routes validated
- [ ] auth implemented
- [ ] roles enforced
- [ ] indexes added
- [ ] unique constraints tested
- [ ] pagination tested
- [ ] search tested
- [ ] error responses consistent
- [ ] logging added
- [ ] env variables configured
- [ ] lint passes
- [ ] build passes
- [ ] API tested with sample data
- [ ] no secrets committed

## 16. Suggested Enhancements Later

- audit logs
- soft delete for important records
- activity timeline
- webhooks
- CSV export
- PDF export
- dashboard analytics caching
- background jobs for reports

## 17. My Recommendation

If building this for real production use, start with:

1. auth
2. product/category CRUD
3. order CRUD
4. supplier CRUD
5. reports endpoints
6. settings endpoint

That gives you a stable base before adding advanced features.

## 18. Implemented Snapshot

```text
src/app/
  api/
    auth/{login,logout,me,signup}
    barcodes/scan
    category
    dashboard
    orders/{route,[id],[id]/approve,[id]/cancel}
    reports
    returns
    sessions/{route,[id]}
    settings
    product/{route,[id]}
  lib/
    apiHelpers.js
    authConstants.js
    db.js
    realtime.js
    response.js
    security.js
    stateMachine.js
    tenant.js
    validation.js
  models/
    barcodeSchema.js
    categorySchema.js
    orderSchema.js
    returnSchema.js
    sessionSchema.js
    settingsSchema.js
    productSchema.js
    userSchema.js
  services/
    authService.js
    barcodeService.js
    categoryService.js
    orderService.js
    productService.js
    reportService.js
    sessionService.js
    settingsService.js
```

Barcode lifecycle:

- `AVAILABLE -> RESERVED -> SOLD -> RETURNED -> AVAILABLE`
- `AVAILABLE -> SOLD`

Order lifecycle:

- `DRAFT -> PENDING_APPROVAL -> COMPLETED`
- `DRAFT -> CANCELLED`
- `PENDING_APPROVAL -> CANCELLED`

Offline-first notes:

- Cart drafts are kept in localStorage.
- The Orders page is the only POS surface.
- Scan requests use `/api/barcodes/scan` and fall back to cached products when needed.
- Orders remain pending until the owner approves them.
- Returns create a separate `returns` record and restore stock.
