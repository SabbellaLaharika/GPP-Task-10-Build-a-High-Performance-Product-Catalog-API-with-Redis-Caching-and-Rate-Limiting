# High-Performance Product Catalog API

A robust, high-performance structured backend API designed for managing a product catalog. This service prioritizes performance using **Redis caching** and protects its integrity through distributed **Redis rate-limiting**.

## 📑 Table of Contents
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Architecture Details](#-architecture-details)

## ✨ Features
- **Node.js / Express**: Fast, non-blocking asynchronous event-driven core API.
- **MongoDB**: Primary data store, equipped with a seeder script for automatic initialization.
- **Redis Caching**: Advanced caching strategy (60s TTL + Pattern Invalidations) for lightning-fast reads.
- **Redis Rate Limiting**: Distributed Sliding Window limitation (100 req/min/IP).
- **Joi Validation**: Comprehensive middleware handling rigorous data structuring and sanitization.
- **Dockerized**: Fully orchestrated utilizing Docker and Docker Compose for a one-command setup.

## 🛠 Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) and Docker Compose installed.

## 🚀 Getting Started

### 1. Clone & Configure
Clone the repository and prepare your environment variables (defaults match the docker configuration):
```bash
cp .env.example .env
```

### 2. Run with Docker Compose
The application, database, and cache are fully containerized. To spin everything up:
```bash
docker-compose up -d --build
```
The API will be available at `http://localhost:3000`. 
*Note: The MongoDB instance automatically seeds 10 sample products on its very first successful boot.*

## 📖 API Documentation

### Base URL
`http://localhost:3000/api`

### Interactive API Docs (Swagger)
You can view and interact with the OpenAPI specifications directly via the Swagger UI interface:  
👉 **`http://localhost:3000/api-docs`**

### Product Model Fields
- `name` (String, required)
- `description` (String, optional)
- `price` (Number, required, >= 0)
- `category` (String, required)
- `sku` (String, required, unique)
- `stock` (Number, default 0)

### Endpoints Overview

| Method | Endpoint | Description | Query/Params | Responses | Cache Status |
|---|---|---|---|---|---|
| POST | `/products` | Create a new product | Body: Product JSON | 201 Created <br> 400 Bad Request | Invalidates Cache |
| GET | `/products` | Get paginated lists | `?page=1&limit=10` | 200 OK | Cached (60s TTL) |
| GET | `/products/:id` | Get specific product | URL Param: `id` | 200 OK <br> 404 Not Found | Cached (60s TTL) |
| PUT | `/products/:id` | Update product data | Body: Partial JSON | 200 OK <br> 404 Not Found | Invalidates Cache |
| DELETE| `/products/:id` | Remove a product | URL Param: `id` | 204 No Content <br> 404 Not Found | Invalidates Cache |

> **⚠️ Rate Limiting Notice:** All endpoints are globally protected by a Redis Rate Limiter. Exceeding 100 requests per minute per IP will result in a `429 Too Many Requests` response with a `Retry-After` header.

## 🧪 Testing

The repository includes a comprehensive test suite covering unit validation and integration paths.

To run the tests locally (requires Node.js):
```bash
npm install
npm run test
```

## 🏗 Architecture Details

Curious about how the caching invalidation logic works or why specific rate-limiting algorithms were chosen? 

👉 **[Read the Architecture Decisions (`ARCHITECTURE.md`)](ARCHITECTURE.md)** for an in-depth explanation of the system design.
