# Product Catalog API

A robust, high-performance structured backend API designed for managing a product catalog. This service prioritizes performance using **Redis caching** and protects its integrity through distributed **Redis rate-limiting**.

## Architecture & Features
- **Node.js / Express**: Fast, non-blocking asynchronous event-driven core API.
- **MongoDB**: Used as the primary data store, equipped with a script to seed initial datasets automatically.
- **Redis (Cache & Throttling)**: Implementations for query caching (60s TTL + Invalidations) and Rate Limiting (100 req/min/IP sliding window natively utilizing `INCR`/`EXPIRE`).
- **Joi Validation**: Comprehensive middleware handling of rigorous data structuring and sanitization.
- **Dockerized**: Fully orchestrated utilizing `Docker` and `Docker Compose`.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (if running locally without Docker)

### Setup & Run (Docker)
1. Clone the repository and navigate into the folder.
2. Edit the environment files if needed (A `.env.example` exists; defaults are ready for docker).
3. Run the orchestration command:
```bash
docker-compose up -d --build
```
4. The API will be available at `http://localhost:3000`. MongoDB and Redis will be configured automatically.
*Note: The database seeds 10 sample items on its first successful boot.*

### Running Tests
To run the automated test suite locally:
```bash
npm install
npm run test
```

## API Documentation

### Models
**Product Schema:**
- `name` (String, required)
- `description` (String, optional)
- `price` (Number, required, >= 0)
- `category` (String, required)
- `sku` (String, required, unique)
- `stock` (Number, default 0)

### Endpoints

| Method | Endpoint | Description | Query/Params | Responses | Cache/Throttled |
|---|---|---|---|---|---|
| POST | `/api/products` | Create a product | Body: Product JSON | 201 Created / 400 Bad Request | Invalidates Cache |
| GET | `/api/products` | Get paginated products | `page`, `limit` | 200 OK | Cached 60s |
| GET | `/api/products/:id` | Get specific product | URL Param: `id` | 200 OK / 404 Not Found | Cached 60s |
| PUT | `/api/products/:id` | Modify product data | Body: Partial JSON | 200 OK / 404 Not Found | Invalidates Cache |
| DELETE| `/api/products/:id` | Remove a product | URL Param: `id` | 204 No Content / 404 Not Found | Invalidates Cache |

*Note: All endpoints are globally protected by the Redis Rate Limiter. Exceeding limit yields `429 Too Many Requests`.*

## Architecture Decisions

Please read the enclosed `ARCHITECTURE.md` for in-depth technical decisions.
