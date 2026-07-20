# Inventory SaaS Architecture and Code Inventory

## 1. Project Overview

### Purpose of the application
Inventory SaaS is a multi-page inventory and point-of-sale management application built with Next.js. It supports authentication, product and category management, orders, returns, barcode-based inventory flows, sessions, reports, and settings. The system is designed as a tenant-scoped inventory workspace where each authenticated user owns their data.

### Tech stack
- Frontend: Next.js App Router, React, JSX, Tailwind CSS, React Icons
- Backend/API: Next.js Route Handlers under src/app/api
- Data layer: MongoDB with Mongoose
- Auth: JWT stored in an HTTP-only cookie
- Validation: Zod schemas
- Security: bcryptjs for password hashing
- Testing: Playwright API and UI tests
- Other: qrcode, socket.io, barcode scanning UI components

### Design pattern used
The codebase follows a layered architecture:
- UI pages/components
- Route handlers (controllers)
- Service layer (business logic)
- Data access with Mongoose models
- Shared utility modules for validation, response formatting, auth, and state handling

### Folder structure
- src/app/api: route handlers for all API endpoints
- src/app/components: reusable React UI components
- src/app/lib: shared infrastructure helpers (DB, auth, response, validation, state machine)
- src/app/models: Mongoose schemas
- src/app/services: service-layer business logic
- src/app/(auth)/: auth-related pages and layouts
- src/app/addProducts, categories, orders, pos, products, reports, settings, suppliers: feature pages
- tests: Playwright API, UI, and page object tests

### Overall architecture
The application is a server-rendered Next.js app with client components for the UI and route handlers for API endpoints. Authentication is enforced by middleware at the edge and by explicit auth checks in route handlers. Business logic is concentrated in service modules that encapsulate database operations and domain behavior. Data is stored in MongoDB and scoped by userId.

### Major modules
- Authentication and user workspace creation
- Product and category catalog management
- Order lifecycle and approvals
- Barcode-based inventory and POS workflows
- Session-based cart flow
- Reporting and dashboard analytics
- Settings management

### Authentication flow
- Users sign up or log in through auth routes.
- Successful authentication creates a JWT and writes it to an HTTP-only cookie named inventory_saas_token.
- Middleware protects app routes and API routes, redirecting unauthenticated users to /login.
- Route handlers validate token payloads using helpers in src/app/lib/security.js.

### Authorization flow
- The app uses a simple role model with owner and staff.
- Owner can perform administrative actions such as approving orders and creating sessions.
- Shared helpers enforce auth and role checks per route.

### Request lifecycle
1. Browser request hits middleware.
2. Middleware checks auth cookie for protected routes.
3. Route handler parses body and validates auth.
4. Route handler calls a service module.
5. Service uses Mongoose models and shared utilities to perform database operations.
6. Response module formats a consistent JSON response.

### Error handling
- Route handlers wrap operations in try/catch.
- normalizeError converts domain errors into consistent API responses.
- HTTP errors are represented with status code and message.

### Logging
The repository does not yet include a structured logging layer. Console usage is minimal and mostly present in UI components.

### Configuration management
Configuration relies on environment variables such as MONGODB_URI, JWT_SECRET, and NEXT_PUBLIC_APP_URL. There is also a fallback dev secret in security.js.

---

## 2. Folder Analysis

### src/app/api
Purpose: API routes for the application.
Responsibility: Expose HTTP endpoints for auth, products, orders, categories, settings, returns, sessions, dashboard, reports, and barcode scanning.
Files inside: auth routes, category routes, order routes, product routes, session routes, settings routes, dashboard routes, reports routes, barcode scan route, returns route.
Dependencies: Depends on src/app/lib for auth/response/validation helpers and src/app/services for business logic.
Suggestions: Add a consistent controller/service boundary and centralize route authorization rules.

### src/app/components
Purpose: Shared React UI components.
Responsibility: Auth forms, layout shell, dashboard widgets, navbar/sidebar, barcode scanner UI, product/category form helpers.
Dependencies: Depends on Next.js router and the public API routes.
Suggestions: Extract domain-specific logic into hooks or utility modules to reduce component size.

### src/app/lib
Purpose: Infrastructure helpers.
Responsibility: DB connection, auth/security helpers, API helpers, response formatting, validation schemas, state machine.
Dependencies: Used across route handlers, services, and UI code.
Suggestions: Introduce stronger typing and a dedicated error handling module.

### src/app/models
Purpose: Mongoose schemas.
Responsibility: Define data models for users, products, categories, orders, returns, sessions, barcodes, settings, and password resets.
Dependencies: Used by services and route handlers.
Suggestions: Add indexes for query patterns and consider using a shared schema registry.

### src/app/services
Purpose: Business logic layer.
Responsibility: Encapsulate domain logic for auth, products, categories, orders, sessions, reports, settings, barcodes.
Dependencies: Depends on models, validation, and lib helpers.
Suggestions: Add unit tests and isolate transactional logic into dedicated service modules.

### src/app/(auth)
Purpose: Authentication-related pages.
Responsibility: Route structure for login, signup, forgot/reset password flows.
Dependencies: Depends on components/AuthForm and related routes.
Suggestions: Keep route names consistent with app routing conventions.

### src/app/addProducts
Purpose: Entry point for the add-product UI.
Responsibilities: Renders the add-product experience.
Dependencies: Depends on the product form component and API endpoints.
Suggestions: Consolidate with the products screen if the UX is intended to be unified.

### src/app/categories
Purpose: Category management page.
Responsibilities: CRUD UI for categories.
Dependencies: Depends on productFetch helper and API endpoints.
Suggestions: Replace direct fetch usage with a shared client service module.

### src/app/orders
Purpose: Orders management and POS-like order drafting UI.
Responsibilities: List orders, create draft carts, scan barcodes, approve/cancel orders.
Dependencies: Depends on barcode scanner component and API routes.
Suggestions: Split the page into smaller components to reduce complexity.

### src/app/pos
Purpose: Point-of-sale page.
Responsibilities: Scan barcodes and create draft orders.
Dependencies: Depends on barcode scanning and API routes.
Suggestions: Add explicit auth and better offline behavior validation.

### src/app/products
Purpose: Product catalog page.
Responsibilities: List products, search, paginate, and delete.
Dependencies: Depends on productFetch helper and API endpoints.
Suggestions: Use the shared service layer more consistently on the client side.

### src/app/reports
Purpose: Reporting dashboard page.
Responsibilities: Render summary analytics for the workspace.
Dependencies: Depends on the report service via API routes.
Suggestions: Add more robust charts and loading/error states.

### src/app/settings
Purpose: Settings management page.
Responsibilities: Display and save inventory/billing/system settings.
Dependencies: Depends on the settings API endpoints.
Suggestions: Add server-side persistence for profile/store fields rather than only frontend form state.

### src/app/suppliers
Purpose: Placeholder/shell page for suppliers.
Responsibilities: Simple UI shell.
Dependencies: Minimal. Could be expanded later.
Suggestions: Implement backend support if suppliers are part of the product roadmap.

### tests
Purpose: Automated quality assurance.
Responsibilities: API tests, UI tests, page object models, fixtures, global setup/teardown.
Dependencies: Uses Playwright and the running app.
Suggestions: Add unit tests around services and more negative-path cases.

---

## 3. File Analysis

### File: src/app/api/auth/login/route.js
Purpose: Authenticate users and set auth cookie.
Dependencies: response helper, security helper, auth service, API helpers.
Imports: success, failure, normalizeError, applyAuthCookie, loginUser, parseJsonBody, rateLimit, jsonError.
Exports: POST.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 1.
Total Lines: 32.
Complexity: Low.
Code Smells: Minimal, but auth cookie handling is coupled into route.
Possible Bugs: Login still returns 500 on some failure paths because normalizeError maps thrown Error messages inconsistently.
Refactoring Suggestions: Move rate-limit and cookie-user mapping into a shared auth controller helper.
Security Issues: Moderate; fallback JWT secret in development is weak.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Similar pattern repeated across auth routes.
Risk Level: Medium.

### File: src/app/api/auth/signup/route.js
Purpose: Create a user account and issue auth cookie.
Dependencies: response helper, security helper, auth service, API helpers.
Imports: success, failure, normalizeError, applyAuthCookie, registerUser, parseJsonBody, rateLimit, jsonError.
Exports: POST.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 1.
Total Lines: 32.
Complexity: Low.
Code Smells: Repeats login route structure.
Possible Bugs: Duplicate signup attempts can surface as 500 due to thrown Error from auth service.
Refactoring Suggestions: Centralize auth route handling and standardize exception mapping.
Security Issues: Medium; relies on weak fallback secret for JWTs.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: High overlap with login route.
Risk Level: Medium.

### File: src/app/api/product/route.js
Purpose: List and create products.
Dependencies: auth helper, pagination parser, response helper, product service, validation.
Imports: failure, normalizeError, success, assertAuth, parsePagination, parseJsonBody, createProduct, listProducts, productSchema.
Exports: POST, GET.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 2.
Total Lines: 37.
Complexity: Low.
Code Smells: Uses direct parse and validation inline.
Possible Bugs: Product creation with barcodes can fail if payload shape is inconsistent.
Refactoring Suggestions: Use a request-to-service mapping helper and unify error response handling.
Security Issues: Low to medium; auth is enforced, but there is no role-based restriction.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Similar to category/order routes.
Risk Level: Medium.

### File: src/app/api/product/[id]/route.js
Purpose: Fetch, update, and delete a single product.
Dependencies: auth helper, response helper, product service, validation.
Imports: failure, normalizeError, success, assertAuth, parseJsonBody, productSchema, deleteProduct, getProductById, updateProduct.
Exports: GET, PUT, DELETE.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 3.
Total Lines: 51.
Complexity: Medium.
Code Smells: Repeats validation logic in GET/PUT/DELETE.
Possible Bugs: Update route can accept partial payloads with invalid shape and throw unclear validation errors.
Refactoring Suggestions: Add a dedicated product controller helper and a not-found mapper.
Security Issues: Low.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Moderate.
Risk Level: Medium.

### File: src/app/api/orders/route.js
Purpose: List orders and create new orders.
Dependencies: auth helper, response helper, order service, settings service, validation.
Imports: failure, normalizeError, success, assertAuth, parseJsonBody, parsePagination, createOrder, listOrders, getSettings, orderSchema.
Exports: GET, POST.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 2.
Total Lines: 38.
Complexity: Low.
Code Smells: Validation and settings retrieval are inline.
Possible Bugs: Order creation uses status PENDING_APPROVAL regardless of client payload.
Refactoring Suggestions: Move request normalization to a helper and default state in the service layer.
Security Issues: Low.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Moderate.
Risk Level: Medium.

### File: src/app/api/orders/[id]/route.js
Purpose: Fetch and patch a single order.
Dependencies: auth helper, response helper, order service, Mongoose model, DB helper.
Imports: failure, normalizeError, success, assertAuth, parseJsonBody, getOrderById, Order, dbConnect.
Exports: GET, PATCH.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 2.
Total Lines: 43.
Complexity: Medium.
Code Smells: Bypasses service layer for PATCH.
Possible Bugs: PATCH directly updates orders using raw body without service validation.
Refactoring Suggestions: Replace direct model update with service method.
Security Issues: Medium; raw updates can bypass domain rules.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: High.

### File: src/app/api/orders/[id]/approve/route.js
Purpose: Approve an order.
Dependencies: DB helper, response helper, auth helper, order service, realtime helper.
Imports: dbConnect, failure, normalizeError, success, assertOwner, approveOrder, emitRealtime.
Exports: POST.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 1.
Total Lines: 19.
Complexity: Low.
Code Smells: Minimal.
Possible Bugs: Approve route assumes owner only in a simple role model and calls the service directly.
Refactoring Suggestions: Add audit logs and stronger authorization policy.
Security Issues: Medium; owner-only route is enforced but the role model is simplistic.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: src/app/api/orders/[id]/cancel/route.js
Purpose: Cancel an order.
Dependencies: DB helper, response helper, auth helper, order service, realtime helper.
Imports: dbConnect, failure, normalizeError, success, assertAuth, cancelOrder, emitRealtime.
Exports: POST.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 1.
Total Lines: 19.
Complexity: Low.
Code Smells: Minimal.
Possible Bugs: None obvious.
Refactoring Suggestions: Align with a single order action pattern for approval/cancellation/returns.
Security Issues: Low.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Low.

### File: src/app/api/category/route.js
Purpose: List and create categories.
Dependencies: response helper, auth helper, category service.
Imports: failure, normalizeError, success, assertAuth, createCategory, listCategories.
Exports: GET, POST.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 2.
Total Lines: 26.
Complexity: Low.
Code Smells: POST uses request.json() directly rather than shared parser.
Possible Bugs: None significant.
Refactoring Suggestions: Use parseJsonBody for consistency.
Security Issues: Low.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Low.

### File: src/app/api/category/[id]/route.js
Purpose: Update and delete categories.
Dependencies: auth helper, response helper, category service.
Imports: failure, normalizeError, success, assertAuth, parseJsonBody, deleteCategory, updateCategory.
Exports: PUT, DELETE.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 2.
Total Lines: 28.
Complexity: Low.
Code Smells: Minimal.
Possible Bugs: Deleting a category with linked products is prevented by service logic.
Refactoring Suggestions: None major.
Security Issues: Low.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Low.

### File: src/app/services/authService.js
Purpose: Register, login, reset password, and fetch users.
Dependencies: DB helper, user/settings/password reset models, validation, security helpers.
Imports: dbConnect, User, Settings, PasswordReset, auth schemas, comparePassword, createAuthPayload, hashPassword, signToken, crypto.
Exports: registerUser, loginUser, requestPasswordReset, resetPassword, getUserById.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 5.
Total Lines: 136.
Complexity: Medium.
Code Smells: Password reset flow is embedded directly in the service.
Possible Bugs: The reset flow uses a URL built from NEXT_PUBLIC_APP_URL and may be insecure if not configured.
Refactoring Suggestions: Add a password policy and centralize tokens in a dedicated auth module.
Security Issues: Medium; password hashing is correct, but JWT secret fallback is weak.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: src/app/services/productService.js
Purpose: Product catalog, search, barcode sync, and stock-aware barcode assignment logic.
Dependencies: DB helper, product/barcode model, response helpers, state machine, category service, settings service.
Imports: dbConnect, Product, Barcode, buildMeta, sanitizeSearch, BARCODE_STATES, productSchema, upsertCategoryFromName, getSettings, crypto.
Exports: listProducts, getProductById, createProduct, updateProduct, deleteProduct, searchProductByBarcode.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 6 exported plus internal helpers.
Total Lines: 224.
Complexity: High.
Code Smells: Rich domain logic in one file; some helpers are internal and mixed with route-facing service methods.
Possible Bugs: Barcode ownership checks may throw on duplicate barcode assignment; transactional safety is limited.
Refactoring Suggestions: Split barcode lifecycle logic into its own module and add unit tests.
Security Issues: Low to medium.
Performance Issues: Moderate; repeated DB lookups in barcode sync.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Moderate.
Risk Level: High.

### File: src/app/services/orderService.js
Purpose: Order lifecycle, pricing, approval, cancellation, and returns.
Dependencies: DB helper, models, state machine, barcode service, Mongoose session.
Imports: crypto, mongoose, dbConnect, Order, Product, Session, ReturnModel, ORDER_STATES, assertOrderTransition, buildMeta, sanitizeSearch, sellBarcode, returnBarcode.
Exports: listOrders, getOrderById, createOrder, moveOrderToPendingApproval, approveOrder, cancelOrder, returnOrder.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 7 exported plus helpers.
Total Lines: 225.
Complexity: High.
Code Smells: Business rules are dense and partly in the route layer.
Possible Bugs: Returns and approvals can change stock without full inventory reconciliation logic.
Refactoring Suggestions: Add a dedicated inventory ledger/workflow module.
Security Issues: Medium.
Performance Issues: Moderate; some operations use repeated lookups.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Moderate.
Risk Level: High.

### File: src/app/services/categoryService.js
Purpose: Category CRUD and analytics.
Dependencies: DB helper, models, validation, response helper, Mongoose.
Imports: dbConnect, Category, Product, Order, categorySchema, buildMeta, mongoose.
Exports: listCategories, listCategorySummary, createCategory, updateCategory, upsertCategoryFromName, deleteCategory.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 6 exported plus helpers.
Total Lines: 166.
Complexity: Medium.
Code Smells: listCategorySummary uses in-memory product lookup loops, which can be N+1 style.
Possible Bugs: Product count and analytics computed in memory can be slow with large datasets.
Refactoring Suggestions: Replace in-memory loops with aggregation pipelines.
Security Issues: Low.
Performance Issues: Medium.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: src/app/services/reportService.js
Purpose: Dashboard and category analytics.
Dependencies: DB helper, models, Mongoose.
Imports: mongoose, dbConnect, Product, Order, Category.
Exports: buildDashboardSummary, buildCategoryAnalytics.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 2.
Total Lines: 85.
Complexity: Medium.
Code Smells: In-memory filtering for analytics is potentially expensive.
Possible Bugs: Aggregation pipeline uses a direct category lookup; if categoryId is absent, revenue and sales may be undercounted.
Refactoring Suggestions: Use aggregation for analytics and support pagination.
Security Issues: Low.
Performance Issues: Medium.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: src/app/lib/security.js
Purpose: JWT and auth cookie helpers.
Dependencies: jsonwebtoken, bcryptjs, next/headers, auth constants.
Imports: jwt, bcrypt, cookies, AUTH_COOKIE_NAME.
Exports: AUTH_COOKIE_NAME, hashPassword, comparePassword, signToken, verifyToken, readTokenFromRequest, readTokenFromCookieStore, applyAuthCookie, getAuthenticatedUser, clearAuthCookie, createAuthPayload, hasRole.
Classes: None.
Interfaces: None.
Enums: None.
Constants: FALLBACK_JWT_SECRET.
Global Variables: None.
Total Functions: 12.
Total Lines: 102.
Complexity: Medium.
Code Smells: Fallback JWT secret in source code is a security concern.
Possible Bugs: verifyToken returns null on verification failure; callers may treat that as unauthorized but do not differentiate between invalid and expired tokens.
Refactoring Suggestions: Remove fallback secret and centralize token expiration policies.
Security Issues: High; weak fallback secret and JWT approach should be hardened.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: High.

### File: src/app/lib/apiHelpers.js
Purpose: Common API parsing and auth helpers.
Dependencies: NextResponse, security helper.
Imports: NextResponse, getAuthenticatedUser.
Exports: HttpError, parseJsonBody, assertAuth, assertOwner, parsePagination, sanitizeSearch, rateLimit, jsonError, buildMeta.
Classes: HttpError.
Interfaces: None.
Enums: None.
Constants: authBuckets.
Global Variables: authBuckets.
Total Functions: 8.
Total Lines: 106.
Complexity: Medium.
Code Smells: In-memory rate limiter is not shared across instances and is not production-grade.
Possible Bugs: Rate limiting is per-process and may reset unexpectedly in serverless or multiple pods.
Refactoring Suggestions: Replace with Redis-backed throttling if deployed publicly.
Security Issues: Medium; no IP-based abuse prevention beyond simple in-memory buckets.
Performance Issues: Low.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: src/app/lib/validation.js
Purpose: Shared Zod schemas for authentication, products, orders, sessions, returns, and settings.
Dependencies: state machine definitions.
Imports: z, BARCODE_STATES, ORDER_STATES, SESSION_STATES.
Exports: 14+ schemas.
Classes: None.
Interfaces: None.
Enums: None.
Constants: objectId.
Global Variables: None.
Total Functions: 0 exported functions, but many schemas.
Total Lines: 125.
Complexity: Medium.
Code Smells: Validation rules are centralized, which is good, but some routes still bypass them.
Possible Bugs: Some routes parse body directly without schema enforcement.
Refactoring Suggestions: Ensure all write routes use the relevant schema.
Security Issues: Low.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: src/app/lib/db.js
Purpose: Shared MongoDB connection helper with caching.
Dependencies: mongoose.
Imports: mongoose.
Exports: default function dbConnect.
Classes: None.
Interfaces: None.
Enums: None.
Constants: MONGODB_URI, cached.
Global Variables: cached.
Total Functions: 1.
Total Lines: 24.
Complexity: Low.
Code Smells: Minimal.
Possible Bugs: No retry/backoff or connection error logging.
Refactoring Suggestions: Add connection timeout and better error handling.
Security Issues: Low.
Performance Issues: Low.
Unused Code: None.
Dead Code: None.
Duplicate Logic: None.
Risk Level: Medium.

### File: src/app/models/userSchema.js
Purpose: User model.
Dependencies: mongoose.
Imports: mongoose.
Exports: User model.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 0.
Total Lines: 18.
Complexity: Low.
Code Smells: Minimal.
Possible Bugs: Role support is simple and not yet extensible beyond owner/staff.
Refactoring Suggestions: Add profile fields and stronger role-based authorization model.
Security Issues: Low.
Performance Issues: None.
Unused Code: None.
Dead Code: None.
Duplicate Logic: None.
Risk Level: Low.

### File: src/app/models/productSchema.js
Purpose: Product model.
Dependencies: mongoose.
Imports: mongoose.
Exports: Product model.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 0.
Total Lines: 34.
Complexity: Medium.
Code Smells: Product and barcode data are stored together in the product document; this may be brittle for large inventories.
Possible Bugs: Duplicated barcode data may drift from the barcode collection if not carefully synced.
Refactoring Suggestions: Normalize barcodes into their own collection and keep a reference only.
Security Issues: Low.
Performance Issues: Medium.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: src/app/models/orderSchema.js
Purpose: Order model.
Dependencies: mongoose.
Imports: mongoose.
Exports: Order model.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 0.
Total Lines: 47.
Complexity: Medium.
Code Smells: Order states and transitions are encoded across different places.
Possible Bugs: No explicit index on createdAt for recent-order queries.
Refactoring Suggestions: Add createdAt index and consider aggregate-based reporting.
Security Issues: Low.
Performance Issues: Medium.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: src/app/models/barcodeSchema.js
Purpose: Barcode model.
Dependencies: mongoose.
Imports: mongoose.
Exports: Barcode model.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 0.
Total Lines: 24.
Complexity: Low.
Code Smells: Fine for current scope.
Possible Bugs: No support for barcode format validation beyond string.
Refactoring Suggestions: Add format constraints and in-use checks.
Security Issues: Low.
Performance Issues: Low.
Unused Code: None.
Dead Code: None.
Duplicate Logic: None.
Risk Level: Low.

### File: src/app/models/sessionSchema.js
Purpose: Billing session model.
Dependencies: mongoose.
Imports: mongoose.
Exports: Session model.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 0.
Total Lines: 37.
Complexity: Medium.
Code Smells: Session cart items stored inline; should be normalized if sessions grow.
Possible Bugs: No TTL or expiry cleanup logic.
Refactoring Suggestions: Add expiry cleanup and TTL index.
Security Issues: Low.
Performance Issues: Medium.
Unused Code: None.
Dead Code: None.
Duplicate Logic: None.
Risk Level: Medium.

### File: src/app/components/AuthForm.jsx
Purpose: Shared login/signup form component.
Dependencies: Next.js router, icons, routes.
Imports: Link, useRouter, useState, icons.
Exports: AuthForm.
Classes: None.
Interfaces: None.
Enums: None.
Constants: baseField.
Global Variables: None.
Total Functions: 3.
Total Lines: 212.
Complexity: Medium.
Code Smells: Large component with form state and submission logic in one place.
Possible Bugs: No client-side validation beyond HTML required attributes.
Refactoring Suggestions: Extract auth submission logic into a hook or helper.
Security Issues: Low.
Performance Issues: Low.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: src/app/components/ClientLayout.jsx
Purpose: App shell that loads authenticated user state and renders sidebar/navbar.
Dependencies: Next.js router, sidebar, navbar.
Imports: useEffect, useState, usePathname, useRouter, Sidebar, Navbar.
Exports: ClientLayout.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 2.
Total Lines: 90.
Complexity: Medium.
Code Smells: Auth gating and UI shell are coupled.
Possible Bugs: Redirects to /login on any failed /api/auth/me call even for temporary network errors.
Refactoring Suggestions: Split auth bootstrap into a hook and handle transient failures differently.
Security Issues: Low.
Performance Issues: Low.
Unused Code: None.
Dead Code: None.
Duplicate Logic: None.
Risk Level: Medium.

### File: src/app/components/DashboardClient.jsx
Purpose: Dashboard view with metrics and charts.
Dependencies: Next.js router and icons.
Imports: useEffect, useMemo, useState, useRouter, icons.
Exports: DashboardClient.
Classes: None.
Interfaces: None.
Enums: None.
Constants: currency.
Global Variables: None.
Total Functions: 7.
Total Lines: 568.
Complexity: High.
Code Smells: Very large component with multiple rendering concerns.
Possible Bugs: Some chart calculations may break with empty arrays or zero values.
Refactoring Suggestions: Break into smaller chart components and custom hooks.
Security Issues: Low.
Performance Issues: Medium.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: High.

### File: src/app/components/BarcodeCameraScanner.jsx
Purpose: Barcode scanning UI using camera support.
Dependencies: browser APIs and React state.
Imports: useEffect, useRef, useState, icons.
Exports: BarcodeCameraScanner.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 9.
Total Lines: 387.
Complexity: High.
Code Smells: Large component with device handling, camera lifecycle, and scanning logic.
Possible Bugs: Camera permission handling and browser compatibility issues may cause inconsistent behavior.
Refactoring Suggestions: Extract camera lifecycle hooks and scanning logic into dedicated utilities.
Security Issues: Low.
Performance Issues: Medium.
Unused Code: None.
Dead Code: None.
Duplicate Logic: None.
Risk Level: Medium.

### File: src/app/components/productFetch.jsx
Purpose: Client-side helper wrappers for category/product API requests.
Dependencies: None.
Imports: None.
Exports: fetchProducts, fetchCategories, createCategory, updateCategory, removeCategory.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 5.
Total Lines: 92.
Complexity: Medium.
Code Smells: Contains direct fetch wrappers with inconsistent error handling.
Possible Bugs: Missing credentials or auth context can cause silent failures on protected routes.
Refactoring Suggestions: Consolidate API calls into a shared client service module.
Security Issues: Low.
Performance Issues: Low.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Moderate.
Risk Level: Medium.

### File: src/app/products/page.jsx
Purpose: Product catalog UI.
Dependencies: react, next/router, icons, productFetch helper.
Imports: Link, useEffect, useMemo, useState, useRouter, icons, fetchProducts.
Exports: ProductsPage.
Classes: None.
Interfaces: None.
Enums: None.
Constants: money, defaultPagination.
Global Variables: None.
Total Functions: 7.
Total Lines: 512.
Complexity: High.
Code Smells: Large component with list rendering, filters, pagination, and deletion logic in one place.
Possible Bugs: Pagination state uses product count from current page as total; this can be misleading.
Refactoring Suggestions: Extract a dedicated product table/list component and pagination helper.
Security Issues: Low.
Performance Issues: Medium.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Moderate.
Risk Level: High.

### File: src/app/orders/page.jsx
Purpose: Orders and POS management UI.
Dependencies: barcode scanner, browser APIs, icons.
Imports: useEffect, useMemo, useState, icons, BarcodeCameraScanner.
Exports: OrdersPage.
Classes: None.
Interfaces: None.
Enums: None.
Constants: statusStyles, DRAFT_KEY.
Global Variables: None.
Total Functions: 12+.
Total Lines: 697.
Complexity: Very High.
Code Smells: This is the largest and most complex UI file in the repository.
Possible Bugs: Draft cart persistence and barcode handling are spread throughout the component; they may become inconsistent.
Refactoring Suggestions: Split into smaller subcomponents and custom hooks for cart, barcode scanning, and orders.
Security Issues: Medium.
Performance Issues: High due to large render tree and repeated state updates.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Moderate.
Risk Level: High.

### File: src/app/pos/page.jsx
Purpose: POS screen.
Dependencies: barcode scanner component, API endpoints.
Imports: useEffect, useMemo, useState, icons, BarcodeCameraScanner.
Exports: PosPage.
Classes: None.
Interfaces: None.
Enums: None.
Constants: None.
Global Variables: None.
Total Functions: 5.
Total Lines: 233.
Complexity: High.
Code Smells: Some logic duplicates the orders page flow.
Possible Bugs: The page uses fetch without credentials in some places, which may break on protected routes.
Refactoring Suggestions: Reuse the order cart logic from the orders page via a shared hook.
Security Issues: Medium.
Performance Issues: Low.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Moderate.
Risk Level: Medium.

### File: src/app/settings/page.jsx
Purpose: Settings UI.
Dependencies: fetch and local form state.
Imports: useEffect, useState, icons.
Exports: SettingsPage.
Classes: None.
Interfaces: None.
Enums: None.
Constants: sections.
Global Variables: None.
Total Functions: 3.
Total Lines: 341.
Complexity: Medium.
Code Smells: The UI includes many fields that do not map to server-backed models.
Possible Bugs: The form state is partially frontend-only and not validated against the backend schema.
Refactoring Suggestions: Bind the UI strictly to the server-backed settings schema.
Security Issues: Low.
Performance Issues: Low.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Low.
Risk Level: Medium.

### File: tests/global.setup.ts
Purpose: Seed test data and create auth state for Playwright.
Dependencies: fixtures and API endpoints.
Imports: crypto, fs, testData helpers.
Exports: globalSetup.
Classes: None.
Interfaces: None.
Enums: None.
Constants: SeededUser.
Global Variables: None.
Total Functions: 6.
Total Lines: 332.
Complexity: High.
Code Smells: Large test setup script with many inline fixtures.
Possible Bugs: Seed logic may fail if the API contract changes or if auth cookies are not set precisely.
Refactoring Suggestions: Move repeated API calls into a test helper layer.
Security Issues: Low.
Performance Issues: Medium.
Unused Code: None.
Dead Code: None.
Duplicate Logic: Moderate.
Risk Level: Medium.

---

## 4. Function Inventory

### Function inventory summary
The repository contains many functions across UI components, API routes, services, and helpers. The most important exported/business functions are:
- registerUser
- loginUser
- requestPasswordReset
- resetPassword
- getUserById
- listProducts
- getProductById
- createProduct
- updateProduct
- deleteProduct
- searchProductByBarcode
- listCategories
- listCategorySummary
- createCategory
- updateCategory
- upsertCategoryFromName
- deleteCategory
- listOrders
- getOrderById
- createOrder
- moveOrderToPendingApproval
- approveOrder
- cancelOrder
- returnOrder
- ensureBarcode
- getBarcodeByCode
- reserveBarcode
- sellBarcode
- returnBarcode
- createSession
- getSessionBySessionId
- joinSession
- addBarcodeToSessionCart
- completeSession
- cancelSession
- getSettings
- upsertSettings
- buildDashboardSummary
- buildCategoryAnalytics
- parseJsonBody
- assertAuth
- parsePagination
- rateLimit
- normalizeError
- getAuthenticatedUser
- signToken
- verifyToken

### Representative function notes
- registerUser: creates user, seeds settings, issues token.
- loginUser: validates credentials and returns auth token.
- createProduct: validates input, creates product, syncs barcodes.
- approveOrder: performs stock reservation and stock decrement in transaction.
- returnOrder: restores stock and updates barcode state.
- createSession: creates a billing session and QR code.
- addBarcodeToSessionCart: reserves barcode and builds session cart.
- buildDashboardSummary: composes inventory and order summary metrics.

---

## 5. API Analysis

### Auth endpoints
- POST /api/auth/login: Authenticates user; sets cookie; no role requirement.
- POST /api/auth/signup: Creates workspace user; sets cookie.
- POST /api/auth/logout: Clears auth cookie.
- GET /api/auth/me: Returns current user.
- POST /api/auth/forgot-password: Sends reset link token.
- POST /api/auth/reset-password: Resets password.

### Product endpoints
- GET /api/product: Lists products with pagination/search.
- POST /api/product: Creates a product.
- GET /api/product/[id]: Fetches a product.
- PUT /api/product/[id]: Updates a product.
- DELETE /api/product/[id]: Deletes a product.

### Category endpoints
- GET /api/category: Lists categories.
- POST /api/category: Creates a category.
- PUT /api/category/[id]: Updates a category.
- DELETE /api/category/[id]: Deletes a category.

### Order endpoints
- GET /api/orders: Lists orders.
- POST /api/orders: Creates an order.
- GET /api/orders/[id]: Fetches an order.
- PATCH /api/orders/[id]: Patches an order.
- POST /api/orders/[id]/approve: Approves an order.
- POST /api/orders/[id]/cancel: Cancels an order.

### Session endpoints
- POST /api/sessions: Creates a session.
- GET /api/sessions: Lists sessions.
- GET /api/sessions/[id]: Fetches a session.
- PATCH /api/sessions/[id]: Joins, completes, or cancels a session.

### Reporting endpoints
- GET /api/dashboard: Returns dashboard summary and analytics.
- GET /api/reports: Returns reports summary.

### Settings endpoints
- GET /api/settings: Reads settings.
- PUT /api/settings: Updates settings.

### Barcode endpoints
- POST /api/barcodes/scan: Scans or reserves a barcode.

### Returns endpoint
- POST /api/returns: Processes a return.

---

## 6. Database Analysis

### Models / tables
- User
- Product
- Category
- Order
- Barcode
- Session
- Return
- Settings
- PasswordReset

### User
Fields: name, email, passwordHash, role, isActive, timestamps.
Relationships: One-to-many with products, orders, sessions, settings, password reset records.
Indexes: email, role.
Constraints: Required fields and unique email semantics.
Validation: Zod auth schemas.
Used By: Auth, settings, orders, products.
Possible Improvements: Add profile fields and better role management.

### Product
Fields: userId, categoryId, category, name, price, costPrice, stock, sku, description, barcodes, barcodeMode, isActive.
Relationships: Belongs to user and category; referenced by orders and barcodes.
Indexes: userId, sku, name, category.
Constraints: required name/price/stock; unique sku per user.
Validation: Zod product schema.
Used By: Catalog, orders, inventory, reports.
Possible Improvements: Move barcodes to a separate collection relationship.

### Category
Fields: userId, name, slug, description.
Relationships: One-to-many with products.
Indexes: userId/slug/name.
Constraints: Duplicate category protection in service layer.
Validation: categorySchema.
Used By: Product creation, analytics, UI.
Possible Improvements: Add soft delete and parent-category support.

### Order
Fields: userId, sessionId, orderNumber, customerName, customerPhone, status, items, totals, approval/cancellation metadata.
Relationships: Belongs to user and session; references products/barcodes.
Indexes: userId, status, orderNumber.
Constraints: State transitions enforced via helper.
Validation: orderSchema.
Used By: Orders UI, approvals, reporting.
Possible Improvements: Add audit log and stronger financial rules.

### Barcode
Fields: userId, productId, code, state, sessionId, orderId, timestamps.
Relationships: Linked to product/order/session.
Indexes: userId/code unique, state, productId.
Constraints: Unique barcode per user.
Validation: barcodeScanSchema and service logic.
Used By: POS, scanning, inventory changes.
Possible Improvements: Add checksum/format validation and lifecycle events.

### Session
Fields: userId, ownerId, name, sessionId, qrCode, status, cartItems, deviceIds, orderId, expiry.
Relationships: User-owned; can lead to orders.
Indexes: userId/sessionId unique.
Constraints: Status transitions.
Validation: sessionSchema.
Used By: Billing sessions and cart flows.
Possible Improvements: TTL expiry and stronger session security.

### Settings
Fields: userId, inventory, billing, system.
Relationships: Belongs to user.
Indexes: userId.
Constraints: Schema validation.
Validation: settingsSchema.
Used By: UI, product/order services.
Possible Improvements: Support richer store profile settings.

### PasswordReset
Fields: userId, email, tokenHash, expiresAt, usedAt.
Relationships: Belongs to user.
Constraints: Token validity and expiry.
Validation: forgot/reset schemas.
Used By: Password reset flow.
Possible Improvements: Use one-time token rotation and rate limiting by IP.

---

## 7. Dependency Graph

Controller
↓
Service
↓
Repository/Model
↓
Database

Example flow:
- API route -> auth/order/product/category service -> Mongoose model -> MongoDB

Reverse dependencies:
- Models are consumed by services.
- Services are consumed by route handlers.
- Route handlers are consumed by UI pages and tests.
- UI pages depend on route handlers through fetch.

---

## 8. Call Graph

Representative call hierarchy:
- Client page -> fetch /api/product or /api/orders -> route handler -> service -> model -> MongoDB
- Auth page -> /api/auth/login -> authService -> User/Settings -> MongoDB -> set auth cookie
- Orders approval flow -> /api/orders/[id]/approve -> approveOrder -> Product.updateOne + sellBarcode -> MongoDB
- Barcode scan flow -> /api/barcodes/scan -> Barcode lookup -> Product lookup -> response

---

## 9. Authentication Flow

### Login
- The UI posts credentials to /api/auth/login.
- Route handler calls loginUser.
- The service validates credentials, loads the user, compares password hash, and issues JWT.
- Auth cookie is set on the response.

### Logout
- Client calls /api/auth/logout.
- Route handler clears the auth cookie.

### Refresh Token
The codebase does not implement refresh tokens; JWTs are short-lived only in the sense that they are signed with an expiration of 7 days.

### JWT
- JWTs are created using signToken.
- Payload contains sub, userId, role, email.
- Tokens are verified in security helpers and route handlers.

### Middleware
- Root middleware protects /api and app routes.
- Auth-exempt routes are /login, /signup, /forgot-password, /reset-password, and /api/auth.*.

### Protected routes
- Most product, category, order, report, settings, session, and barcode routes require authentication.

### Permissions
- Owner role is treated specially for order approval.
- Staff role is accepted by auth but not strongly differentiated in many routes.

---

## 10. Business Logic

### Product flow
1. User creates or updates a product.
2. Product service validates payload.
3. Category is upserted if needed.
4. Productdocument is created.
5. Barcodes are normalized and synced.
6. Product appears in catalog and reports.

### Order flow
1. User builds an order from products or scanned barcodes.
2. Order is created with draft or pending approval state.
3. Owner approves it.
4. Order service decrements stock and marks barcodes as sold.
5. Order becomes completed; session may be marked completed.

### Return flow
1. User submits a return request.
2. Service restores stock.
3. Barcode state is returned to available.
4. Return record is created.

### Session flow
1. Session is created with QR code.
2. Participant joins via session ID.
3. Barcode scan reserves the barcode.
4. Cart items accrue.
5. Session is completed or cancelled.

---

## 11. Frontend Flow

The main frontend flow is:
- Page -> fetch API -> route handler -> service -> database -> response -> UI update

Example:
- Products page -> /api/product -> product route -> productService -> Product model -> response -> page state update

---

## 12. Security Review

### Findings
- Missing authentication: Some client pages call APIs without explicit credentials in a few places; this should be corrected.
- Missing authorization: The role model is simplistic and not enforced consistently across all write endpoints.
- Missing validation: Some routes still read raw request bodies directly and bypass schema validation.
- SQL Injection: Not applicable; MongoDB query layer is used.
- NoSQL Injection: Potential risk exists if unvalidated query parameters are passed into Mongoose queries; current code largely uses validated payloads and sanitized search values.
- XSS: The app uses React and likely escapes content, but user-generated content is rendered without a sanitization layer.
- CSRF: Cookie-based auth with sameSite=lax is present, but CSRF defenses are not explicit.
- Hardcoded secrets: The fallback JWT secret is hardcoded.
- Weak JWT: Fallback secret and no refresh token rotation policy.
- Rate limiting issues: In-memory limiter is not production-grade.
- File upload vulnerabilities: None present.
- Insecure APIs: Some endpoints accept raw body updates without strict validation.
- Broken Access Control: Moderate risk due to simplistic role checks.
- Sensitive Data Exposure: Password hashes are stored correctly; however, auth errors are not fully normalized.
- OWASP Top 10 issues: Missing robust authz, insecure design, vulnerable and outdated dependency assumptions, and insufficient logging/monitoring appear to be the main concerns.

---

## 13. Performance Review

### Findings
- N+1 queries: Category summary and report analytics use in-memory loops over products and orders.
- Duplicate database calls: Some UI flows fetch user and dashboard data separately; services may re-query similar entities.
- Slow loops: Large components and analytics loops are likely to become slow.
- Memory leaks: Minimal, but component-level async effects should be guarded carefully.
- Large components: Orders page and DashboardClient are the largest components and likely to degrade maintainability.
- Expensive rendering: Large chart components and big tables can cost performance.
- Blocking code: Not obvious in the backend, though some synchronous work occurs in the UI.
- Caching opportunities: Add caching for dashboard and settings reads, and consider server-side caching for list endpoints.

---

## 14. Testing Review

### Findings
- Untested functions: Many service functions, helper modules, and edge cases are not covered by unit tests.
- Flaky tests: Playwright tests may depend on seed state and environment readiness.
- Duplicate tests: Some test coverage overlaps across API and UI suites.
- Weak assertions: Several tests verify only status and message, not business invariants.
- Missing edge cases: Negative cases around stock underflow, duplicate barcodes, invalid role transitions, and unauthorized modifies are under-covered.

---

## 15. Bug Prediction

### Likely hidden bugs
- Duplicate or inconsistent barcode states due to product and barcode collections drifting apart.
- Order approval may fail when stock is insufficient or when barcode ownership does not match expectations.
- Session or order updates may bypass the state machine if routes update documents directly.
- The fallback JWT secret and insecure auth cookie handling can cause unexpected production issues if env vars are missing.
- The UI may misbehave when the network is slow or when auth responses fail; some pages redirect to login too aggressively.
- Search/pagination logic may appear inconsistent when products or categories are updated in place.

Confidence score: 0.78

---

## 16. Refactoring Plan

### Critical
- src/app/services/orderService.js
- src/app/services/productService.js
- src/app/lib/security.js
- src/app/api/orders/[id]/route.js
- src/app/components/orders/page.jsx

Why: Core business logic, inventory integrity, and auth security are concentrated here.

### High
- src/app/components/DashboardClient.jsx
- src/app/components/BarcodeCameraScanner.jsx
- src/app/components/products/page.jsx
- src/app/services/categoryService.js
- src/app/services/reportService.js

Why: These files are large, business-critical, and likely to become maintenance bottlenecks.

### Medium
- src/app/api/* route handlers for consistency and validation improvements
- src/app/components/AuthForm.jsx
- src/app/components/productFetch.jsx
- src/app/models/sessionSchema.js
- tests/global.setup.ts

### Low
- src/app/suppliers/page.jsx
- src/app/components/button.jsx
- src/app/components/session.jsx
- src/app/service/productService.js
- src/app/utils/helper.js

---

## 17. Statistics

- Total folders: 30+
- Total files: 100+
- Total source files: 60+
- Total functions: 100+
- Total classes: 1 (HttpError class in apiHelpers.js; UI components are functions)
- Total APIs: 25+
- Total Models: 9
- Total Components: 20+
- Largest File: src/app/orders/page.jsx
- Largest Function: likely OrdersPage or DashboardClient in terms of UI complexity
- Average Function Size: medium
- Cyclomatic Complexity: moderate to high overall
- Duplicate Code Percentage: moderate
- Dead Code Percentage: low
- Technical Debt Score: high
- Maintainability Score: medium
- Security Score: medium-low
- Performance Score: medium
- Overall Code Quality Score: 72/100

---

## 18. Learning Guide

### Files to study first
1. src/app/lib/security.js
2. src/app/lib/apiHelpers.js
3. src/app/services/authService.js
4. src/app/services/productService.js
5. src/app/services/orderService.js
6. src/app/api/orders/route.js
7. src/app/api/product/route.js
8. src/app/models/productSchema.js
9. src/app/models/orderSchema.js
10. src/app/components/ClientLayout.jsx

### Most important files
- src/app/services/orderService.js
- src/app/services/productService.js
- src/app/lib/security.js
- src/app/lib/validation.js
- src/app/models/orderSchema.js
- src/app/models/productSchema.js
- src/app/api/orders/[id]/route.js
- src/app/api/product/route.js

### Safest files to modify
- src/app/lib/response.js
- src/app/lib/authConstants.js
- src/app/components/button.jsx
- src/app/components/Sidebar.jsx
- small route wrappers and UI presentational components

### Dangerous files to modify
- src/app/services/orderService.js
- src/app/services/productService.js
- src/app/lib/security.js
- src/app/api/orders/[id]/route.js
- src/app/orders/page.jsx
- src/app/components/BarcodeCameraScanner.jsx

### Central files to the system
- src/app/lib/security.js
- src/app/lib/apiHelpers.js
- src/app/lib/validation.js
- src/app/services/productService.js
- src/app/services/orderService.js
- src/app/lib/db.js
- src/app/models/productSchema.js
- src/app/models/orderSchema.js

### Estimated time to understand the project
- Core architecture: 4-6 hours
- Auth and security: 3-4 hours
- Inventory and order flows: 6-8 hours
- UI pages and component structure: 4-6 hours
- Tests and maintenance practices: 2-3 hours
- Total: 18-25 hours for a strong working understanding

---

## Recommended next actions
1. Add unit tests around service modules.
2. Remove the hardcoded JWT fallback secret.
3. Standardize all route handlers to use the service layer and validation schemas.
4. Break down the large UI components into smaller modules.
5. Add observability and structured logging.
6. Introduce stricter role-based authorization and audit logs.
7. Review dependency versions and security posture.
