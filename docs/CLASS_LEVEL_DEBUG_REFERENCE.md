# Class-Level Debugging Reference

This document provides class-level documentation for every service in the OrderManager microservices architecture. It is designed to help developers quickly locate, understand, and debug issues across the system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Gateway](#api-gateway)
3. [Product Service](#product-service)
4. [Customer Service](#customer-service)
5. [Inventory Service](#inventory-service)
6. [Order Service](#order-service)
7. [Web Frontend (Angular)](#web-frontend-angular)
8. [Cross-Service Debugging Playbook](#cross-service-debugging-playbook)

---

## Architecture Overview

```
                        +------------------+
                        |   Web Frontend   |  (Angular 17 / nginx)
                        |   Port: 8080     |
                        +--------+---------+
                                 |
                           /api/* proxy
                                 |
                        +--------v---------+
                        |   API Gateway    |  (YARP Reverse Proxy)
                        |   Port: 8080     |
                        +--+----+----+--+--+
                           |    |    |  |
           +---------------+    |    |  +---------------+
           |                    |    |                  |
  +--------v-------+  +--------v--+ +--v--------+ +----v-----------+
  | Customer Svc   |  | Product   | | Inventory | | Order Service  |
  | Port: 8080     |  | Service   | | Service   | | Port: 8080     |
  | DB: PostgreSQL |  | Port:8080 | | Port:8080 | | DB: PostgreSQL |
  +----------------+  | DB: PgSQL | | DB: PgSQL | +----------------+
                       +-----------+ +-----------+
```

**Technology Stack (all backend services):**
- .NET 8.0 / ASP.NET Core
- Entity Framework Core 8.0 with PostgreSQL (Npgsql)
- Prometheus metrics (`prometheus-net.AspNetCore`)
- Swagger/OpenAPI (`Swashbuckle.AspNetCore`)
- Docker: `mcr.microsoft.com/dotnet/aspnet:8.0-alpine`
- All services listen on port **8080** inside containers

**Request Flow:**
1. Browser -> Web Frontend (nginx) -> `/api/*` proxied to API Gateway
2. API Gateway (YARP) routes to the appropriate backend service by path prefix
3. Backend service processes request via Controller -> Service -> DbContext -> PostgreSQL

---

## API Gateway

**Branch:** `devin/api-gateway`
**Project:** `src/ApiGateway/`

### `Program` (Program.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Application entry point. Configures YARP reverse proxy to route API traffic to downstream microservices. |
| **Framework** | ASP.NET Core Minimal Hosting + YARP (`Yarp.ReverseProxy` v2.2.0) |
| **Routing Config** | Loaded from `appsettings.json` section `ReverseProxy`. Route-to-cluster mapping defined declaratively. |
| **Env Var Overrides** | `CUSTOMER_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `INVENTORY_SERVICE_URL`, `ORDER_SERVICE_URL` override cluster destination addresses at startup. Falls back to Kubernetes DNS names (e.g. `http://customer-service:8080`). |
| **Endpoints** | `/health` (inline health check), `/metrics` (Prometheus), YARP proxy routes |
| **CORS** | Allows all origins, methods, headers |

**Route Table (appsettings.json):**

| Route ID | Path Pattern | Target Cluster |
|---|---|---|
| `customers-route` | `/api/customers/{**catch-all}` | `customer-service` |
| `products-route` | `/api/products/{**catch-all}` | `product-service` |
| `inventory-route` | `/api/inventory/{**catch-all}` | `inventory-service` |
| `orders-route` | `/api/orders/{**catch-all}` | `order-service` |

**Debugging Tips:**
- If a specific API path returns 502/503: Check that the target service is running and reachable at the configured URL. Verify the env var (e.g. `CUSTOMER_SERVICE_URL`) is set correctly.
- If all routes fail: The gateway itself may not be starting. Check `app.MapReverseProxy()` and YARP config loading.
- YARP does not retry by default. A single downstream timeout will surface as a gateway error.
- Swagger UI is enabled but will only show gateway-level endpoints (the `/health` endpoint). It does not aggregate downstream service specs.

---

## Product Service

**Branch:** `devin/product-service`
**Project:** `src/ProductService/`

### `Product` (Models/Product.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | EF Core entity representing a catalog product. Maps to the `Products` table. |
| **Key Fields** | `Id` (PK, auto-increment), `Name`, `Description`, `Category`, `Price` (decimal), `Sku` (unique), `CreatedAt` (UTC) |
| **Defaults** | All string fields default to `string.Empty`. `CreatedAt` defaults to `DateTime.UtcNow`. |

**Debugging Tips:**
- If `Price` shows unexpected rounding: Column type is `decimal(18,2)`. Values beyond 2 decimal places are truncated at the DB level.
- Duplicate SKU inserts will throw a `DbUpdateException` due to the unique index.

---

### `ProductDbContext` (Data/ProductDbContext.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | EF Core `DbContext` for the Product Service database. |
| **DbSet** | `Products` (type `DbSet<Product>`) |
| **Constraints** | `Name` required, max 200 chars. `Sku` required, max 50 chars, unique index. `Price` column type `decimal(18,2)`. |
| **Connection** | PostgreSQL via `Npgsql`, connection string from `ConnectionStrings:DefaultConnection` in config. |

**Debugging Tips:**
- If `EnsureCreated()` silently succeeds but tables are missing: Check that the connection string points to the correct database.
- Schema changes require manual migration or a fresh `EnsureCreated()`. There are no EF migrations in this project.
- If you see `Npgsql.NpgsqlException`: Verify PostgreSQL is running and the connection string is valid (host, port, credentials).

---

### `SeedData` (Data/SeedData.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Static class that seeds 5 demo products on first startup if the `Products` table is empty. |
| **Method** | `InitializeAsync(ProductDbContext context)` - async, called from `Program.cs` during app startup. |
| **Guard** | Checks `context.Products.Any()` first. Skips seeding if any product exists. |
| **Seed Data** | Widget A (WGT-001), Widget B (WGT-002), Gadget X (GDG-001), Gadget Y (GDG-002), Thingamajig (THG-001) |

**Debugging Tips:**
- If seed data appears duplicated: The `Any()` check can race if multiple instances start simultaneously against the same DB. The unique `Sku` index will cause a `DbUpdateException` in the losing instance.
- If seed data never appears: Ensure `EnsureCreated()` runs before `InitializeAsync()`. Check startup logs for exceptions.

---

### `ProductSvc` (Services/ProductService.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Business logic layer for product CRUD operations. Registered as `Scoped` in DI. |
| **Dependencies** | `ProductDbContext` (constructor-injected) |
| **Methods** | |
| `GetAllProductsAsync()` | Returns all products. No pagination, no sorting. |
| `GetProductByIdAsync(int id)` | Returns single product or `null` if not found. Uses `FirstOrDefaultAsync`. |
| `CreateProductAsync(Product product)` | Adds product to context and saves. Returns the created entity with DB-generated `Id`. |
| `GetProductsByCategoryAsync(string category)` | Filters by exact `Category` match (case-sensitive). |

**Debugging Tips:**
- `CreateProductAsync` does NOT null out the `Id` before saving. If a client sends `Id: 5` in the body, EF will attempt an upsert (merge), potentially overwriting an existing record. This differs from the monolith which explicitly nulls the Id.
- Category filtering is case-sensitive. `"Widgets"` != `"widgets"`. This can cause empty results if the client sends a different casing.
- No input validation is performed at the service level (no null checks, no price validation). Invalid data will propagate to the DB and may throw `DbUpdateException`.

---

### `ProductsController` (Controllers/ProductsController.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | REST API controller for product endpoints. Route prefix: `/api/products`. |
| **Dependencies** | `ProductSvc` (constructor-injected) |
| **Endpoints** | |
| `GET /api/products` | Returns 200 with all products. |
| `GET /api/products/{id}` | Returns 200 with product, or 404 if not found. |
| `GET /api/products/category/{category}` | Returns 200 with filtered list (may be empty). |
| `POST /api/products` | Creates product. Returns 201 with `Location` header. Body: `Product` JSON. |

**Debugging Tips:**
- No model validation attributes (`[Required]`, etc.) on the `Product` model. ASP.NET model binding will accept partial/empty JSON bodies without error.
- `POST` returns `CreatedAtAction` with a `Location` header pointing to `GetById`. If the response `Location` header has an incorrect URL, check route registration.
- No error handling middleware. Unhandled exceptions return a generic 500 with stack trace in Development mode.

---

### `Program.cs` (Entry Point)

| Aspect | Detail |
|---|---|
| **Startup Sequence** | 1. Register services (controllers, EF Core, Swagger, CORS, health checks, Prometheus) -> 2. Build app -> 3. Create scope, `EnsureCreated()`, seed data -> 4. Configure middleware -> 5. Run |
| **JSON Config** | `ReferenceHandler.IgnoreCycles` to prevent circular serialization |
| **Observability** | `/health` (health check), `/metrics` (Prometheus via `UseHttpMetrics()` + `MapMetrics()`) |
| **Swagger** | Only enabled in Development environment |

**Debugging Tips:**
- If the service starts but returns no data: Check that `EnsureCreated()` + `SeedData.InitializeAsync()` ran without exceptions. Look at startup logs.
- If `/metrics` returns 404: Ensure `app.UseHttpMetrics()` is called before `app.MapMetrics()`.
- CORS is set to allow all. If CORS errors still occur, it might be a browser preflight issue or the gateway is not forwarding CORS headers.

---

## Customer Service

**Branch:** `devin/customer-service`
**Project:** `src/CustomerService/`

### `Customer` (Models/Customer.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | EF Core entity representing a customer. Maps to the `Customers` table. |
| **Key Fields** | `Id` (PK), `Name`, `Email` (unique), `Phone`, `Address`, `City`, `State`, `ZipCode`, `CreatedAt` (UTC) |
| **Defaults** | All string fields default to `string.Empty`. `CreatedAt` defaults to `DateTime.UtcNow`. |

**Debugging Tips:**
- Duplicate `Email` inserts will throw `DbUpdateException` due to the unique index.
- No validation attributes. Empty strings are valid for all fields.

---

### `CustomerDbContext` (Data/CustomerDbContext.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | EF Core `DbContext` for the Customer Service database. |
| **DbSet** | `Customers` |
| **Constraints** | `Name` required, max 200 chars. `Email` required, max 200 chars, unique index. |
| **Connection** | PostgreSQL via `Npgsql`. |

**Debugging Tips:**
- Same pattern as ProductDbContext. No migrations, uses `EnsureCreated()`.
- If the `Email` unique constraint is violated, the exception message will reference the index name, not the column name. Look for `IX_Customers_Email` in the error.

---

### `SeedData` (Data/SeedData.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Seeds 3 demo customers on first startup. |
| **Method** | `Initialize(CustomerDbContext context)` - **synchronous** (unlike ProductService which is async). Also calls `EnsureCreated()` internally. |
| **Guard** | `context.Customers.Any()` |
| **Seed Data** | Acme Corp, Globex Inc, Initech LLC |

**Debugging Tips:**
- This SeedData class calls `context.Database.EnsureCreated()` itself, in addition to the `Program.cs` startup. This is redundant but harmless.
- The method is synchronous (`SaveChanges()` not `SaveChangesAsync()`). This blocks the startup thread briefly but is not a problem for small seed datasets.

---

### `CustomerSvc` (Services/CustomerSvc.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Business logic for customer CRUD. Registered as `Scoped`. |
| **Dependencies** | `CustomerDbContext` |
| **Methods** | |
| `GetAllCustomersAsync()` | Returns all customers, no pagination. |
| `GetCustomerByIdAsync(int id)` | Returns customer or `null`. |
| `CreateCustomerAsync(Customer customer)` | Adds and saves. No Id nulling. |

**Debugging Tips:**
- Same Id-merge risk as ProductSvc: if client sends an existing Id, it will update rather than insert.
- No email format validation. The service will accept any string as an email.

---

### `CustomersController` (Controllers/CustomersController.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | REST controller for `/api/customers`. |
| **Endpoints** | |
| `GET /api/customers` | Returns 200 with all customers. |
| `GET /api/customers/{id}` | Returns 200 or 404. |
| `POST /api/customers` | Creates customer. Returns 201 with `Location` header. |

**Debugging Tips:**
- No `[FromBody]` validation. Missing or malformed JSON may result in a `null` customer parameter, causing a `NullReferenceException` in the service layer.
- Error responses are not standardized. Unhandled exceptions return raw stack traces in Development.

---

### `Program.cs` (Entry Point)

| Aspect | Detail |
|---|---|
| **Startup Sequence** | Register services -> Build -> Seed data (sync, includes `EnsureCreated()`) -> Middleware -> Run |
| **Swagger** | Enabled unconditionally (not gated behind `IsDevelopment()` like Product Service). |
| **Observability** | `/health`, `/metrics` |

**Debugging Tips:**
- Swagger is always on, including production. This is a deviation from the Product Service pattern.
- `UseHttpMetrics()` is called but `UseRouting()` is NOT explicitly called. ASP.NET Core adds it implicitly, but if custom middleware ordering issues arise, adding `app.UseRouting()` explicitly may help.

---

## Inventory Service

**Branch:** `devin/inventory-service`
**Project:** `src/InventoryService/`

> **Note:** An alternate version exists on the `Infosys-Workshop` branch under `inventory-service/src/InventoryService.Api/` using SQLite instead of PostgreSQL, with additional fields (`ProductName`, `ProductSku`) and a `HealthController`. The documentation below covers the primary PostgreSQL-based decomposition.

### `InventoryItem` (Models/InventoryItem.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | EF Core entity for inventory stock levels. |
| **Key Fields** | `Id` (PK), `ProductId`, `QuantityOnHand`, `ReorderLevel` (default 10), `WarehouseLocation`, `LastRestocked` (UTC) |
| **No FK Relationship** | `ProductId` is a plain integer, NOT a navigation property. There is no foreign key constraint to the Product Service database. Cross-service data integrity relies on the Order Service validating product existence via HTTP. |

**Debugging Tips:**
- `ProductId` has no uniqueness constraint in this branch (unlike the `Infosys-Workshop` variant which enforces `HasIndex(e => e.ProductId).IsUnique()`). Multiple inventory records for the same product could be inserted.
- `ReorderLevel` defaults to 10 in code. If a different value is expected, check seed data or the API request.

---

### `InventoryDbContext` (Data/InventoryDbContext.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | EF Core `DbContext` for inventory data. |
| **DbSet** | `InventoryItems` |
| **Constraints** | Only `Id` as primary key. No other constraints configured (unlike the `Infosys-Workshop` variant). |

**Debugging Tips:**
- Minimal constraints mean the DB will accept duplicate `ProductId` values, empty `WarehouseLocation`, etc.
- Connection string from `ConnectionStrings:DefaultConnection`.

---

### `SeedData` (Data/SeedData.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Seeds 5 inventory items (product IDs 1-5) on first startup. |
| **Method** | `Initialize(InventoryDbContext context)` - synchronous. Calls `EnsureCreated()`. |
| **Seed Quantities** | Product 1: 50, Product 2: 100, Product 3: 150, Product 4: 200, Product 5: 250 |

**Debugging Tips:**
- Seed data `ProductId` values (1-5) must align with the Product Service's seed data. If the Product Service seeds different IDs, inventory lookups by `ProductId` will return mismatched or null results.
- Warehouse locations follow pattern `A-01` through `A-05`.

---

### `InventorySvc` (Services/InventoryService.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Business logic for inventory management. Registered as `Scoped` (via `AddHttpClient<InventorySvc>`). |
| **Dependencies** | `InventoryDbContext`, `HttpClient` (typed client for Product Service, base URL from `PRODUCT_SERVICE_URL` env var) |
| **Methods** | |
| `GetAllInventoryAsync()` | Returns all inventory items. No joins to product data. |
| `GetInventoryByProductIdAsync(int productId)` | Returns item by `ProductId` or `null`. |
| `RestockAsync(int productId, int quantity)` | Finds item by `ProductId`, increments `QuantityOnHand`, updates `LastRestocked`. Throws `ArgumentException` if no inventory record exists. |
| `GetLowStockItemsAsync()` | Returns items where `QuantityOnHand <= ReorderLevel`. |
| `ReserveStockAsync(int productId, int quantity)` | Deducts stock. Throws `ArgumentException` if product not found, `InvalidOperationException` if insufficient stock. |

**Debugging Tips:**
- `RestockAsync` and `ReserveStockAsync` are NOT atomic at the DB level (no explicit transaction or row locking). Concurrent restocks/reserves on the same product can cause race conditions (lost updates). In high-concurrency scenarios, add optimistic concurrency (`[ConcurrencyCheck]` or row versioning) or pessimistic locking.
- `ReserveStockAsync` checks `QuantityOnHand < quantity` (strict less-than). Reserving exactly the remaining stock succeeds (quantity becomes 0). This is intentional.
- The injected `HttpClient` for the Product Service is available but NOT used by any method. It exists for potential future use (e.g., validating product existence before restock).
- `GetLowStockItemsAsync` uses `<=` comparison. An item exactly at its reorder level IS considered low stock.

---

### `InventoryController` (Controllers/InventoryController.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | REST controller for `/api/inventory`. |
| **Endpoints** | |
| `GET /api/inventory` | Returns 200 with all inventory items. |
| `GET /api/inventory/product/{productId}` | Returns 200 or 404. |
| `POST /api/inventory/product/{productId}/restock` | Body: `RestockRequest(int Quantity)`. Returns 200. |
| `GET /api/inventory/low-stock` | Returns 200 with low-stock items. |
| `POST /api/inventory/product/{productId}/reserve` | Body: `ReserveRequest(int Quantity)`. Returns 200, 400 (insufficient stock), or 404 (product not found). |

**Request/Response Records:**
- `RestockRequest(int Quantity)` - defined inline in the controller file.
- `ReserveRequest(int Quantity)` - defined inline in the controller file.

**Debugging Tips:**
- The `Reserve` endpoint catches `ArgumentException` (-> 404) and `InvalidOperationException` (-> 400) from the service. All other exceptions are unhandled and return 500.
- The `Restock` endpoint does NOT catch exceptions. An `ArgumentException` from the service (product not found) will result in an unhandled 500, not a 404. This is an inconsistency with the Reserve endpoint.
- `RestockRequest` and `ReserveRequest` are C# records defined in the same file as the controller, not in a separate DTO folder.

---

### `Program.cs` (Entry Point)

| Aspect | Detail |
|---|---|
| **Startup Sequence** | Register services (including `AddHttpClient<InventorySvc>`) -> Build -> Seed data -> Middleware -> Run |
| **HttpClient** | Typed `HttpClient` for `InventorySvc` with base address from `PRODUCT_SERVICE_URL` (default: `http://localhost:5002`). |
| **Swagger** | Only in Development. |
| **Observability** | `/health`, `/metrics` |

**Debugging Tips:**
- The default `PRODUCT_SERVICE_URL` is `http://localhost:5002`, which assumes local development. In Kubernetes, this must be overridden to the Product Service's cluster DNS.
- `InventorySvc` is registered via `AddHttpClient<InventorySvc>`, which means it is a typed HTTP client. The DI container creates both the `HttpClient` and the `InventorySvc` per scope.

---

## Order Service

**Branch:** `devin/order-service`
**Project:** `src/OrderService/`

### `Order` (Models/Order.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | EF Core entity for customer orders. |
| **Key Fields** | `Id` (PK), `CustomerId` (int, no FK), `OrderDate` (UTC), `Status` (default "Pending"), `TotalAmount` (decimal), `ShippingAddress` |
| **Navigation** | `Items` (ICollection<OrderItem>) - one-to-many with cascade. |

**Debugging Tips:**
- `CustomerId` is a plain integer, not a foreign key to the Customer Service. If the customer is deleted in the Customer Service, orders referencing that customer will have a dangling `CustomerId`.
- `Status` is a free-form string. There is no enum or validation. Any string is accepted (e.g., "Pending", "Shipped", "typo").
- `TotalAmount` is calculated in `OrderSvc.CreateOrderAsync()` and stored. It is NOT recalculated on read. If order items are modified directly in the DB, `TotalAmount` will be stale.

---

### `OrderItem` (Models/OrderItem.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | EF Core entity for line items within an order. |
| **Key Fields** | `Id` (PK), `OrderId` (FK to Order), `ProductId` (int, no FK to Product Service), `Quantity`, `UnitPrice` (decimal) |
| **Computed** | `LineTotal` (get-only property: `Quantity * UnitPrice`). This is NOT stored in the DB, NOT marked `[NotMapped]` or `@Transient`. EF Core will attempt to map it. |
| **Navigation** | `Order` (back-reference to parent Order) |

**Debugging Tips:**
- `LineTotal` is a computed property with only a getter. EF Core may attempt to create a column for it. If you see a `LineTotal` column in the DB or migration errors, add `[NotMapped]` attribute or configure it in `OnModelCreating` with `.Ignore(e => e.LineTotal)`.
- `UnitPrice` is captured at order creation time (snapshot). It does NOT update if the product price changes later. This is correct business logic for order history.

---

### `OrderDbContext` (Data/OrderDbContext.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | EF Core `DbContext` for order data. |
| **DbSets** | `Orders`, `OrderItems` |
| **Relationships** | `OrderItem.Order` -> `Order.Items` via `OrderId` FK. |
| **Column Types** | `Order.TotalAmount`: `decimal(18,2)`. `OrderItem.UnitPrice`: `decimal(18,2)`. |

**Debugging Tips:**
- The `OrderItem` -> `Order` relationship is configured with `HasOne`/`WithMany`/`HasForeignKey`. Cascade delete is EF Core's default (cascade). Deleting an Order will cascade-delete its OrderItems.
- No explicit configuration for `OrderItem.LineTotal`. Depending on EF Core conventions and the DB provider, this may or may not cause issues.

---

### `CustomerClient` (Clients/CustomerClient.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Typed HTTP client for calling the Customer Service API. |
| **Dependencies** | `HttpClient` (base URL from `CUSTOMER_SERVICE_URL`, default `http://customer-service:8080`) |
| **Method** | `GetCustomerAsync(int id)` - calls `GET /api/customers/{id}`. Returns `CustomerDto?`. Returns `null` on non-success status code. |
| **DTO** | `CustomerDto` - mirrors Customer model fields (Id, Name, Email, Address, City, State, ZipCode). Defined in the same file. |
| **Virtual** | Method is `virtual` to allow mocking in unit tests. |

**Debugging Tips:**
- Returns `null` on ANY non-success status (400, 404, 500, timeout). The caller cannot distinguish between "customer not found" (404) and "customer service is down" (500/timeout). Both result in `ArgumentException("Customer {id} not found")` in `OrderSvc`.
- No retry policy, no circuit breaker. A slow or failing Customer Service will block order creation indefinitely (until `HttpClient` timeout, default 100 seconds).
- No logging. Failed HTTP calls are silently swallowed. Add logging around the `GetAsync` call for production debugging.

---

### `ProductClient` (Clients/ProductClient.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Typed HTTP client for calling the Product Service API. |
| **Method** | `GetProductAsync(int id)` - calls `GET /api/products/{id}`. Returns `ProductDto?`. |
| **DTO** | `ProductDto` - minimal fields: Id, Name, Price. |
| **Virtual** | For test mocking. |

**Debugging Tips:**
- Same null-on-failure pattern as `CustomerClient`. Cannot distinguish 404 from 500.
- `ProductDto` only contains `Id`, `Name`, `Price`. Other product fields (SKU, Category, Description) are not available to the Order Service.

---

### `InventoryClient` (Clients/InventoryClient.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Typed HTTP client for calling the Inventory Service's reserve endpoint. |
| **Method** | `ReserveStockAsync(int productId, int quantity)` - calls `POST /api/inventory/product/{productId}/reserve`. Returns `ReserveResult?`. |
| **DTO** | `ReserveResult` - fields: Id, ProductId, QuantityOnHand (remaining after reservation). |
| **Virtual** | For test mocking. |

**Debugging Tips:**
- Returns `null` when the Inventory Service responds with a non-success status. In `OrderSvc.CreateOrderAsync`, a `null` result is interpreted as "insufficient stock" and throws `InvalidOperationException`. However, the actual cause might be that the Inventory Service is unreachable (network issue, service down), not that stock is insufficient.
- The request body is `new { quantity }` (lowercase). The Inventory Service expects `ReserveRequest(int Quantity)` (PascalCase). ASP.NET Core's JSON deserialization is case-insensitive by default, so this works. But if case-sensitive deserialization is ever enabled, this will break silently (quantity = 0).

---

### `OrderSvc` (Services/OrderService.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Orchestrates order creation across Customer, Product, and Inventory services. Registered as `Scoped`. |
| **Dependencies** | `OrderDbContext`, `CustomerClient`, `ProductClient`, `InventoryClient` |
| **Methods** | |
| `GetAllOrdersAsync()` | Returns all orders with `.Include(o => o.Items)`, sorted by `OrderDate` descending. |
| `GetOrderByIdAsync(int id)` | Returns order with items, or `null`. |
| `CreateOrderAsync(int customerId, List<(int ProductId, int Quantity)> items)` | Full order creation workflow (see below). |
| `UpdateOrderStatusAsync(int orderId, string status)` | Updates status string. Throws `ArgumentException` if order not found. |

**`CreateOrderAsync` Workflow (Critical Path):**

```
1. GET customer from Customer Service (via CustomerClient)
   -> Throws ArgumentException if null

2. For EACH item in the order:
   a. GET product from Product Service (via ProductClient)
      -> Throws ArgumentException if null
   b. POST reserve stock to Inventory Service (via InventoryClient)
      -> Throws InvalidOperationException if null (insufficient stock / service error)
   c. Add OrderItem to order (with snapshot of UnitPrice)

3. Calculate TotalAmount = sum of (Quantity * UnitPrice) for all items

4. Save order + items to local DB

5. Return created order
```

**Debugging Tips:**
- **No distributed transaction / saga.** If step 2b succeeds (stock reserved) but a later item fails or the DB save (step 4) fails, the already-reserved stock is NOT rolled back. This causes inventory leaks (phantom reservations).
- **Sequential item processing.** Items are processed one at a time in a loop. For an order with many items, this results in N sequential HTTP calls to Product Service + N calls to Inventory Service. Latency scales linearly with item count.
- **No idempotency.** Retrying a failed `CreateOrderAsync` can reserve inventory twice.
- **Customer address snapshot.** `ShippingAddress` is constructed as `"{Address}, {City}, {State} {ZipCode}"` from the customer's current address. If the customer updates their address later, existing orders retain the old address (correct behavior).
- `UpdateOrderStatusAsync` uses `FindAsync` (by PK) which does NOT include `Items`. The returned order object will have an empty `Items` collection.

---

### `OrdersController` (Controllers/OrdersController.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | REST controller for `/api/orders`. |
| **Endpoints** | |
| `GET /api/orders` | Returns 200 with all orders (newest first, includes items). |
| `GET /api/orders/{id}` | Returns 200 or 404. |
| `POST /api/orders` | Body: `CreateOrderRequest`. Returns 201. |
| `PATCH /api/orders/{id}/status` | Body: `UpdateStatusRequest`. Returns 200. |

**Request/Response Records (defined inline):**
- `CreateOrderRequest(int CustomerId, List<OrderItemRequest> Items)`
- `OrderItemRequest(int ProductId, int Quantity)`
- `UpdateStatusRequest(string Status)`

**Debugging Tips:**
- No exception handling in the controller. `ArgumentException` (customer/product not found) and `InvalidOperationException` (insufficient stock) from `OrderSvc` will bubble up as unhandled 500 errors with stack traces.
- `PATCH /api/orders/{id}/status` accepts any string. There is no validation of allowed status transitions (e.g., you can set status from "Shipped" back to "Pending").
- The `Create` endpoint converts `OrderItemRequest` list to a list of tuples: `.Select(i => (i.ProductId, i.Quantity)).ToList()`. If `Items` is null in the request, this throws `NullReferenceException`.

---

### `Program.cs` (Entry Point)

| Aspect | Detail |
|---|---|
| **HTTP Clients** | Three typed clients registered: `CustomerClient`, `ProductClient`, `InventoryClient`. Each configured with base URL from env vars (`CUSTOMER_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `INVENTORY_SERVICE_URL`), defaulting to Kubernetes DNS names. |
| **Swagger** | Enabled unconditionally. |
| **No Seed Data** | Order Service has no seed data. The `Orders` table starts empty. |
| **No EnsureCreated** | The DbContext relies on the PostgreSQL database being available. If the database/tables don't exist, the first query will fail. |

**Debugging Tips:**
- If the Order Service starts but all endpoints return 500: Check that the PostgreSQL database exists and has the required tables. Unlike other services, there is no `EnsureCreated()` in the startup.
- If orders consistently fail to create: Check that all three downstream services (Customer, Product, Inventory) are reachable at their configured URLs. The order creation makes HTTP calls to all three.
- Default service URLs use Kubernetes DNS names (e.g., `http://customer-service:8080`). For local development, these must be overridden via env vars.

---

### `OrderServiceTests` (tests/OrderService.Tests/OrderServiceTests.cs)

| Aspect | Detail |
|---|---|
| **Purpose** | Unit tests for `OrderSvc` using in-memory EF Core database and Moq mocks. |
| **Test Framework** | xUnit 2.9.2 + Moq 4.20.72 |
| **Tests** | |
| `GetAllOrders_ReturnsEmptyList_WhenNoOrders` | Verifies empty DB returns empty list. |
| `CreateOrder_Success` | Mocks all three clients. Verifies order total, shipping address, item count, and DB persistence. |
| `CreateOrder_ThrowsOnInsufficientStock` | Mocks InventoryClient to return null. Verifies `InvalidOperationException`. |

**Debugging Tips:**
- Mocks use `MockBehavior.Strict`. Any unexpected call to a mocked client will throw `MockException` with a clear message about which method was called unexpectedly.
- The `HttpClient` passed to mock constructors (`new HttpClient()`) is a dummy. The mocked virtual methods bypass actual HTTP calls.
- Tests use `Guid.NewGuid().ToString()` as the in-memory database name to ensure test isolation.

---

## Web Frontend (Angular)

**Branch:** `devin/web-frontend`
**Project:** `src/WebFrontend/`

### `AppComponent` (src/app/app.component.ts)

| Aspect | Detail |
|---|---|
| **Purpose** | Root component providing navigation and router outlet. |
| **Standalone** | Yes (Angular 17 standalone component) |
| **Navigation** | Links to `/orders`, `/products`, `/customers`, `/inventory` |

---

### `routes` (src/app/app.routes.ts)

| Aspect | Detail |
|---|---|
| **Purpose** | Application route definitions with lazy-loaded components. |
| **Default** | `''` redirects to `/orders` |
| **Routes** | `/orders` -> `OrderListComponent`, `/products` -> `ProductListComponent`, `/customers` -> `CustomerListComponent`, `/inventory` -> `InventoryListComponent` |

**Debugging Tips:**
- All routes use `loadComponent` for lazy loading. If a component fails to load, check the browser console for chunk loading errors (network issues, incorrect build output path).
- No wildcard/404 route defined. Unknown paths will show a blank page with just the nav bar.

---

### `OrderListComponent` (src/app/modules/orders/order-list.component.ts)

| Aspect | Detail |
|---|---|
| **Purpose** | Displays all orders in a table. |
| **API Call** | `GET ${environment.apiBaseUrl}/api/orders` on `ngOnInit` |
| **Displayed Fields** | `id`, `customer?.name`, `orderDate` (date pipe), `status`, `totalAmount` (currency pipe) |

**Debugging Tips:**
- Uses `any[]` type for `orders`. No type safety. Runtime errors from missing fields will not be caught at compile time.
- `customer?.name` relies on the API returning a nested `customer` object. In the microservices architecture, the Order Service does NOT return customer details (it only stores `customerId`). This field will always show blank/undefined unless the API gateway or a BFF layer enriches the response.
- No error handling on the HTTP subscription. If the API call fails, the component silently shows "No orders yet."
- No loading state indicator.

---

### `ProductListComponent` (src/app/modules/products/product-list.component.ts)

| Aspect | Detail |
|---|---|
| **Purpose** | Displays all products in a table. |
| **API Call** | `GET ${environment.apiBaseUrl}/api/products` on `ngOnInit` |
| **Displayed Fields** | `sku`, `name`, `category`, `price` (currency), `inventory?.quantityOnHand` (with `'N/A'` fallback) |

**Debugging Tips:**
- `inventory?.quantityOnHand` expects a nested `inventory` object on the product. The Product Service does NOT include inventory data. This field will always show "N/A" unless enriched by a gateway/BFF.
- No error handling, no loading state.

---

### `CustomerListComponent` (src/app/modules/customers/customer-list.component.ts)

| Aspect | Detail |
|---|---|
| **Purpose** | Displays all customers in a table. |
| **API Call** | `GET ${environment.apiBaseUrl}/api/customers` on `ngOnInit` |
| **Displayed Fields** | `name`, `email`, `phone`, `city, state` |

**Debugging Tips:**
- Simplest component. Customer Service returns flat data that matches what the template expects. Least likely to have data mismatch issues.
- No error handling, no loading state.

---

### `InventoryListComponent` (src/app/modules/inventory/inventory-list.component.ts)

| Aspect | Detail |
|---|---|
| **Purpose** | Displays inventory items with low-stock highlighting. |
| **API Call** | `GET ${environment.apiBaseUrl}/api/inventory` on `ngOnInit` |
| **Displayed Fields** | `product?.name`, `quantityOnHand`, `reorderLevel`, `warehouseLocation`, `lastRestocked` (date pipe) |
| **Styling** | CSS class `low-stock` applied when `quantityOnHand <= reorderLevel` |

**Debugging Tips:**
- `product?.name` expects a nested `product` object. The Inventory Service (`devin/inventory-service` branch) does NOT return product details. This field will show blank. The `Infosys-Workshop` variant includes `ProductName` directly on the `InventoryItem` model, but uses a different field name.
- Low-stock CSS class is applied but no CSS styles are defined in this component. You need to add styles in a global stylesheet or the component's `styles` array for visual highlighting.

---

### Environment Configuration

| File | `apiBaseUrl` |
|---|---|
| `environment.ts` (dev) | `http://localhost:8080` |
| `environment.prod.ts` | `''` (empty - relative URLs, assumes same-origin) |

**Debugging Tips:**
- In production, the empty `apiBaseUrl` means API calls go to the same host/port as the frontend. This requires nginx to proxy `/api/*` to the API Gateway.
- In development, `http://localhost:8080` assumes the API Gateway runs locally on port 8080. If using a different port, update this file.

---

### nginx.conf

| Aspect | Detail |
|---|---|
| **Port** | 8080 |
| **SPA Fallback** | `try_files $uri $uri/ /index.html` |
| **API Proxy** | `location /api/` proxied to `${API_GATEWAY_URL}` (env var substituted at container start) |

**Debugging Tips:**
- `${API_GATEWAY_URL}` must be set as an environment variable. If missing, nginx will fail to start or proxy to a literal string. Use `envsubst` in the Docker entrypoint to substitute this variable.
- The `proxy_pass` directive requires a trailing slash match. Verify that `API_GATEWAY_URL` includes or excludes the trailing slash consistently.

---

## Cross-Service Debugging Playbook

### Symptom: Order creation returns 500

```
1. Check Order Service logs for the exception type:
   - ArgumentException("Customer X not found")
     -> Customer Service is down or customer doesn't exist
     -> Verify: curl http://<customer-svc>/api/customers/{id}
   
   - ArgumentException("Product X not found")
     -> Product Service is down or product doesn't exist
     -> Verify: curl http://<product-svc>/api/products/{id}
   
   - InvalidOperationException("Insufficient stock for ...")
     -> Inventory Service returned null (could be actual insufficient stock OR service down)
     -> Verify: curl http://<inventory-svc>/api/inventory/product/{id}
   
   - NullReferenceException
     -> Request body is malformed. Check that "items" array is not null.

2. If the downstream service is reachable but the Order Service still fails:
   - Check env vars: CUSTOMER_SERVICE_URL, PRODUCT_SERVICE_URL, INVENTORY_SERVICE_URL
   - Check that the Order Service can resolve the DNS name (Kubernetes service discovery)
   - Check for HttpClient timeout (default 100s)
```

### Symptom: Data appears in API but not in frontend

```
1. Check browser DevTools Network tab for the API response body
2. Compare response field names with template bindings:
   - Orders: template expects "customer.name" but API returns "customerId" (integer)
   - Products: template expects "inventory.quantityOnHand" but API returns no inventory data
   - Inventory: template expects "product.name" but API returns "productId" (integer)
3. These are known data shape mismatches from the monolith-to-microservices decomposition.
   Resolution: Add a BFF (Backend-For-Frontend) layer or enrich responses in the API Gateway.
```

### Symptom: Inventory quantity goes negative or becomes inconsistent

```
1. Check for concurrent requests to /api/inventory/product/{id}/reserve
2. No row-level locking or optimistic concurrency is implemented
3. Two simultaneous reserves can both read the same QuantityOnHand,
   both pass the check, and both deduct - resulting in negative stock
4. Mitigation: Add [ConcurrencyCheck] on QuantityOnHand or use
   SQL-level UPDATE with WHERE QuantityOnHand >= @quantity
```

### Symptom: Reserved inventory not released after failed order

```
1. OrderSvc.CreateOrderAsync processes items sequentially
2. If item 2 fails (product not found, insufficient stock), item 1's
   inventory reservation is NOT rolled back
3. This is a known limitation - no saga/compensation pattern implemented
4. Manual fix: Call POST /api/inventory/product/{id}/restock with the
   reserved quantity to restore stock
```

### Symptom: Service starts but no data / tables missing

```
1. Product Service, Customer Service, Inventory Service: Check that
   EnsureCreated() + SeedData ran at startup (look at startup logs)
2. Order Service: Does NOT call EnsureCreated(). Manually ensure the
   PostgreSQL database and tables exist before starting.
3. Check PostgreSQL connection string in config or env var
   (ConnectionStrings__DefaultConnection)
```

### Health Check & Metrics Endpoints

| Service | Health | Metrics |
|---|---|---|
| API Gateway | `GET /health` | `GET /metrics` |
| Product Service | `GET /health` | `GET /metrics` |
| Customer Service | `GET /health` | `GET /metrics` |
| Inventory Service | `GET /health` | `GET /metrics` |
| Order Service | `GET /health` | `GET /metrics` |

All health endpoints return 200 with `{"status": "Healthy"}` when the service is running. They do NOT check database connectivity or downstream service availability.
