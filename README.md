# StickerStore

A full-stack e-commerce application for buying stickers, built with **Spring Boot** (backend) and **React + Vite** (frontend).

## Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- Spring Security with JWT authentication
- Spring Data JPA with H2 in-memory database
- Maven build system

### Frontend
- **React 18** + **TypeScript**
- **Vite** build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for HTTP requests
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Prerequisites

- Java 17+
- Node.js 18+
- npm 9+

## Getting Started

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API server will start at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start at `http://localhost:5173`.

## Default Credentials

| Username | Password  | Role       |
|----------|-----------|------------|
| admin    | admin123  | ROLE_ADMIN |
| user     | user123   | ROLE_USER  |

## API Endpoints

### Authentication
| Method | Endpoint            | Description         | Auth Required |
|--------|---------------------|---------------------|---------------|
| POST   | `/api/auth/register`| Register new user   | No            |
| POST   | `/api/auth/login`   | Login & get JWT     | No            |

### Products
| Method | Endpoint                      | Description           | Auth Required |
|--------|-------------------------------|-----------------------|---------------|
| GET    | `/api/products`               | List all products     | No            |
| GET    | `/api/products/{id}`          | Get product by ID     | No            |
| GET    | `/api/products/category/{cat}`| Filter by category    | No            |
| GET    | `/api/products/search?q=`     | Search products       | No            |

### Cart
| Method | Endpoint               | Description         | Auth Required |
|--------|------------------------|---------------------|---------------|
| GET    | `/api/cart`            | Get current cart     | Yes           |
| POST   | `/api/cart/items`      | Add item to cart     | Yes           |
| PUT    | `/api/cart/items/{id}` | Update item quantity | Yes           |
| DELETE | `/api/cart/items/{id}` | Remove item          | Yes           |

### Orders
| Method | Endpoint              | Description         | Auth Required |
|--------|-----------------------|---------------------|---------------|
| POST   | `/api/orders/checkout`| Create order (checkout) | Yes       |
| GET    | `/api/orders`         | List user's orders  | Yes           |
| GET    | `/api/orders/{id}`    | Get order details   | Yes           |

## Project Structure

```
├── backend/                  # Spring Boot API
│   ├── src/main/java/com/stickerstore/
│   │   ├── config/           # Data seeder
│   │   ├── controller/       # REST controllers
│   │   ├── dto/              # Request/Response DTOs
│   │   ├── exception/        # Global exception handling
│   │   ├── model/            # JPA entities
│   │   ├── repository/       # Spring Data repositories
│   │   ├── security/         # JWT & Spring Security
│   │   └── service/          # Business logic
│   └── src/main/resources/
│       └── application.yml   # App configuration
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React contexts (Auth, Cart)
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript types
│   │   ├── api.ts            # Axios instance
│   │   ├── App.tsx           # Root component with routing
│   │   └── main.tsx          # Entry point
│   └── index.html
└── README.md
```
