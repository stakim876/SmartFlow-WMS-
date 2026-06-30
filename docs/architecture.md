# SmartFlow WMS — 아키텍처

## 시스템 개요

SmartFlow WMS는 **React SPA(메인 UI)** + **Express REST API** + **MySQL** 3-tier 구조입니다.

```mermaid
flowchart TB
    subgraph Client["클라이언트"]
        Browser["브라우저\nReact SPA :5173"]
    end

    subgraph Server["서버"]
        API["Express API :4000\n/api/*"]
    end

    subgraph Data["데이터"]
        DB[("MySQL 8.0\nDocker :3306")]
    end

    Browser -->|"HTTP /api (Vite Proxy)"| API
    API -->|"Prisma ORM"| DB
```

## 레이어 구조 (Backend)

도메인별 **Module 패턴** — 각 기능이 routes → controller → service → repository 로 분리됩니다.

```mermaid
flowchart LR
    subgraph Module["modules/inventory/"]
        R[inventory.routes]
        C[inventory.controller]
        S[inventory.service]
        Repo[inventory.repository]
    end

    subgraph Core["core/"]
        MW[middleware]
        CFG[config]
        UTIL[utils]
    end

    Client2["HTTP Request"] --> R
    R --> C
    C --> S
    S --> Repo
    Repo --> Prisma["Prisma Client"]
    R --> MW
    S --> MW
```

| 레이어 | 역할 | 예시 |
|--------|------|------|
| **routes** | URL 매핑, 미들웨어 적용 | `GET /inventory` |
| **controller** | req/res 처리, HTTP 상태코드 | `inventoryController.list` |
| **service** | 비즈니스 로직, 검증(Zod) | 재고 이동 트랜잭션 |
| **repository** | DB 접근 (Prisma) | `inventoryRepository.findMany` |
| **core** | 공통 인프라 | 인증, 에러, 페이지네이션 |

## 레이어 구조 (Frontend)

**Feature-based** — 기능 단위로 API·컴포넌트·페이지를 묶습니다.

```mermaid
flowchart TB
    subgraph App["app/"]
        Routes["routes.tsx"]
    end

    subgraph Features["features/"]
        Auth["auth/"]
        Products["products/"]
        Inventory["inventory/"]
    end

    subgraph Shared["shared/"]
        Common["components/common"]
        Layout["layouts + layout"]
        Client["api/client.ts"]
    end

    Routes --> Auth
    Routes --> Products
    Routes --> Inventory
    Auth --> Client
    Products --> Client
    Inventory --> Client
    Auth --> Common
    Products --> Layout
```

| 레이어 | 역할 |
|--------|------|
| **app/** | 라우팅, App 진입 |
| **features/** | 도메인별 pages, components, api, stores |
| **shared/** | 재사용 UI, API 클라이언트, 전역 스타일 |

## 인증 흐름

```mermaid
sequenceDiagram
    participant U as 사용자
    participant R as React
    participant A as API
    participant D as DB

    U->>R: 로그인
    R->>A: POST /auth/login
    A->>D: 사용자 조회
    A-->>R: accessToken + refreshToken
    R->>R: Zustand 저장
    R->>A: GET /products (Bearer Token)
    A-->>R: 데이터
```

## 데이터 모델 (핵심)

```mermaid
erDiagram
    Product ||--o{ Inventory : has
    Location ||--o{ Inventory : stores
    Warehouse ||--o{ Location : contains
    Product ||--o{ InventoryMovement : tracks
    Partner ||--o{ InboundOrder : supplies
    Partner ||--o{ OutboundOrder : receives
```

## API 규칙

- Base URL: `/api`
- 응답 형식: `{ success, message?, data? }`
- 인증: `Authorization: Bearer <accessToken>`
- 역할: `ADMIN`, `STAFF` (`authorize` 미들웨어)

## 배포 관점

| 구분 | 개발 | 운영 (권장) |
|------|------|-------------|
| Frontend | Vite dev server | Nginx / CDN (static) |
| Backend | tsx watch | Node.js + PM2 |
| DB | Docker Compose | Managed MySQL |
