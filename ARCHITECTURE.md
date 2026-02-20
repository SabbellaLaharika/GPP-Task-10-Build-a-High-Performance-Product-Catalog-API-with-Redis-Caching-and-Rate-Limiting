# Architecture Decisions

## 1. Caching Strategy
**Approach:** "Read-Through" style with eager invalidation.
- Data fetching goes through a `CacheService` first. Upon miss, queried data from MongoDB hydrates the cache with a **60-second TTL**.
- **Keys Pattern:**
  - Individual items: `products:id:{id}`
  - Paginated feeds: `products:all:page:{page}:limit:{limit}`
- **Invalidation Workflow:**
  When a Product is Created, Updated, or Deleted:
  - We execute a Redis wildcard deletion: `KEYS products:all:*` -> `DEL`. This guarantees paginated lists do not serve stale data (e.g. out of date pricing or ghostly deleted items).
  - Specific item caches `products:id:{id}` are actively deleted on `PUT/DELETE` methods.

## 2. Rate Limiter Configuration
**Approach:** Lightweight Redis Counter Algorithm (Fixed/Sliding Window combination implementation).
- Since exact millisecond precision isn't critically enforced, the API relies on Redis `INCR` chained with `EXPIRE` over a 60 second window. 
- A key map of `rate_limit:{IP_Address}` tracks the hits.
- This prevents application-layer DDOS and preserves backend DB connections. Errors inside Redis gracefully fall back (`next()`) to ensure API availability isn't compromised by throttle server downtimes.

## 3. Separation of Concerns Layering
The codebase employs strong boundaries:
- **Routes:** Only handle path mapping.
- **Controllers:** Handle HTTP abstractions (Req/Res/Next, formatting, status codes).
- **Services:** Pure business logic. `ProductService` merges MongoDB querying with Cache validation.
- **Middlewares:** Standalone pure functions targeting Request intercepts (Joi Schema validations, IP mapping).
