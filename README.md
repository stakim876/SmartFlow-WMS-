# SmartFlow WMS

창고 관리 시스템(Warehouse Management System) — React + Express 풀스택 모노레포

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend (메인 UI)** | React 19, TypeScript, Vite, React Router, Zustand, Axios |
| **Backend (API)** | Node.js, Express, TypeScript, Prisma |
| **Database** | MySQL 8.0 (Docker) |
| **인증** | JWT + Refresh Token |

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. DB 실행
npm run db:up

# 3. DB 스키마 + 시드
cd backend
npx prisma db push
npm run db:seed
cd ..

# 4. 개발 서버 (React + API 동시 실행)
npm run dev
```

| 서비스 | URL |
|--------|-----|
| **React (메인)** | http://localhost:5173 |
| **API** | http://localhost:4000/api |
| **Swagger** | http://localhost:4000/api-docs |

**기본 계정:** `admin@smartflow.com` / `admin1234`

## 프로젝트 구조

```
SmartFlow WMS/
├── docs/                  # 아키텍처·규칙 문서
├── backend/               # Express API 서버
│   ├── prisma/            # DB 스키마, 시드
│   └── src/
│       ├── app.ts         # Express 앱
│       ├── server.ts      # 진입점
│       ├── routes.ts      # API 라우터 통합
│       ├── core/          # 공통 인프라
│       └── modules/       # 도메인별 모듈
└── frontend/              # React 앱 (사용자 메인)
    └── src/
        ├── main.tsx       # React 진입점
        ├── app/           # 라우팅, App
        ├── features/      # 기능별 UI (auth, products, inventory…)
        └── shared/        # 공통 컴포넌트, API 클라이언트
```

상세 구조는 [docs/architecture.md](docs/architecture.md) 참고.

## 구현 현황

| 모듈 | Backend | Frontend |
|------|---------|----------|
| 인증 | ✅ | ✅ |
| 상품관리 | ✅ | ✅ |
| 재고관리 (조회·수정·이동·이력) | ✅ | ✅ |
| 입고관리 | ✅ | ✅ |
| 출고관리 | ✅ | ✅ |
| 거래처관리 | ✅ | ✅ |
| 발주관리 | ✅ | ✅ |
| 직원관리 | ✅ | ✅ |
| 공지/대시보드 | ✅ | ✅ |
| my-shop 연동 | ✅ | ✅ |

## 테스트

```bash
npm test                 # backend + frontend
npm run test -w backend
npm run test -w frontend
```

- Backend: JWT 유틸, 인증 서비스, Health API
- Frontend: 인증 스토어, 다크모드 훅

## 스크립트

```bash
npm run dev              # Frontend + Backend
npm run dev:frontend     # React만
npm run dev:backend      # API만
npm run build            # 전체 빌드
npm run db:up            # MySQL Docker
npm run db:down          # MySQL 중지
```

## 문서

- [아키텍처 & 구조도](docs/architecture.md)
- [폴더 구조 가이드](docs/folder-structure.md)
- [개발 규칙](docs/conventions.md)
