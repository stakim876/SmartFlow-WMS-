# 폴더 구조 가이드

## 루트

```
SmartFlow WMS/
├── README.md
├── package.json              # npm workspaces (backend + frontend)
├── docker-compose.yml        # MySQL
├── .editorconfig
├── docs/                     # 프로젝트 문서
├── backend/
└── frontend/
```

## Backend (`backend/src/`)

```
backend/src/
├── app.ts                    # Express 앱 설정
├── server.ts                 # 서버 시작
├── routes.ts                 # 전체 API 라우터 등록
│
├── core/                     # 공통 인프라 (도메인 무관)
│   ├── config/
│   │   ├── env.ts            # 환경변수
│   │   ├── database.ts       # Prisma Client
│   │   └── swagger.ts        # API 문서
│   ├── middleware/
│   │   ├── auth.ts           # JWT 인증, 권한
│   │   ├── validate.ts       # Zod 검증
│   │   └── errorHandler.ts   # 전역 에러
│   ├── utils/
│   │   ├── asyncHandler.ts
│   │   ├── jwt.ts
│   │   ├── pagination.ts
│   │   ├── response.ts
│   │   └── orderNo.ts
│   └── types/
│       └── common.ts         # Pagination 등 공통 타입
│
└── modules/                  # 도메인별 모듈
    ├── auth/
    ├── product/
    ├── inventory/
    ├── warehouse/
    ├── inbound/
    ├── outbound/
    ├── partner/
    ├── purchase-order/
    ├── user/
    ├── notice/
    ├── dashboard/
    ├── export/
    ├── import/
    ├── upload/
    ├── notification/
    ├── shop-integration/
    └── health/
```

### 새 API 모듈 추가 방법

1. `modules/{domain}/` 폴더 생성
2. routes, controller, service, repository 순으로 작성
3. `routes.ts`에 `router.use('/{path}', {domain}Routes)` 등록

## Frontend (`frontend/src/`)

```
frontend/src/
├── main.tsx                  # React 진입점
│
├── app/                      # 앱 설정
│   ├── App.tsx
│   └── routes.tsx            # React Router
│
├── features/                 # 기능별 UI (메인 작업 위치)
│   ├── auth/
│   ├── products/
│   ├── inventory/
│   ├── warehouses/
│   ├── inbound/
│   ├── outbound/
│   ├── partners/
│   ├── purchase-orders/
│   ├── users/
│   ├── notices/
│   ├── dashboard/
│   ├── reports/
│   └── shop-integration/
│
└── shared/                   # 공통 (기능 간 재사용)
    ├── api/
    │   ├── client.ts         # Axios + 토큰 갱신
    │   └── health.ts
    ├── components/
    │   ├── common/           # Button, PageHeader, LoadingSpinner
    │   └── layout/           # Header, Sidebar
    ├── layouts/              # MainLayout, AuthLayout
    ├── hooks/
    ├── styles/global.css
    ├── types/index.ts
    └── utils/
```

### 새 화면 추가 방법

1. `features/{name}/pages/{Name}Page.tsx` 생성
2. 필요 시 `features/{name}/api/`, `components/` 추가
3. `app/routes.tsx`에 라우트 등록
4. `shared/components/layout/Sidebar.tsx` navItems에 메뉴 추가

## Import 규칙

| 위치 | import 패턴 |
|------|-------------|
| Frontend | `@/features/...`, `@/shared/...`, `@/app/...` |
| Backend | 상대 경로 (`../../core/...`, `./auth.service`) |

## DB (`backend/prisma/`)

```
prisma/
├── schema.prisma             # ERD / 모델 정의
└── seed.ts                   # 초기 데이터 (역할, 관리자, 샘플)
```
