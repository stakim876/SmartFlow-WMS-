# SmartFlow WMS

창고 입출고·재고·발주를 한곳에서 관리하는 WMS입니다.  
React 프론트와 Express API를 npm workspaces로 묶은 모노레포 구조입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, Vite, React Router, Zustand |
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | MySQL 8.0 (Docker) |
| 인증 | JWT + Refresh Token |

## 시작하기

### 1. 환경 준비

```bash
npm install
```

`backend/.env`는 `backend/.env.example`을 복사해서 쓰면 됩니다.  
로컬 MySQL은 Docker로 띄웁니다.

```bash
npm run db:up
```

### 2. DB 초기화

```bash
cd backend
npx prisma db push
npm run db:seed
cd ..
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저가 `http://localhost:5175/login` 으로 열립니다.  
(5173 포트를 다른 앱이 쓰는 경우가 있어 5175를 사용합니다.)

| 서비스 | 주소 |
|--------|------|
| 웹 UI | http://localhost:5175 |
| API | http://localhost:4000/api |
| Swagger | http://localhost:4000/api-docs |

**시드 계정:** `admin@smartflow.com` / `admin1234`

## 역할

| 역할 | 설명 |
|------|------|
| ADMIN | 전체 관리, 승인, 직원·창고 설정 |
| STAFF | 입출고·재고·발주 등 일상 운영 |
| VIEWER | 조회와 Excel 다운로드만 가능 |

직원 등록 화면에서 역할을 지정할 수 있습니다.

## 주요 기능

- **상품·재고** — 창고/로케이션별 재고 조회, 수량 조정, 로케이션 간 이동, 이력에 작업자 기록
- **입고·출고** — 전표 등록 → 승인 → 완료 흐름, 상태별 목록 필터
- **발주** — 발주 승인 후 **입고 전환**으로 입고 전표 생성, 입고 완료 시 발주도 자동 완료
- **창고·로케이션** — 창고와 보관 위치 마스터 관리
- **거래처·직원·공지** — 거래처 CRUD, 직원/역할 관리, 공지사항
- **대시보드** — 승인 대기 건수, 재고 부족, 최근 입출고 요약
- **리포트** — 기간별 입고·출고·재고 이력 Excel 다운로드
- **my-shop 연동** — 쇼핑몰 상품·재고·주문 수동 동기화 (API 키 설정 시)
- **내 계정** — 프로필 수정, 비밀번호 변경

## 발주 → 입고 흐름

1. 발주 등록 후 관리자가 **승인**
2. 승인된 발주에서 **입고 전환** 클릭
3. 입고 관리에서 승인 → 로케이션 지정 후 **완료**
4. 재고 반영과 함께 발주 상태가 **완료**로 바뀜

## 테스트

```bash
npm test
```

Vitest로 backend·frontend 단위 테스트를 돌립니다.

- Backend: JWT, 인증 서비스
- Frontend: 인증 스토어, 다크모드 훅

## 자주 쓰는 명령

```bash
npm run dev              # API + 웹 동시 실행
npm run dev:frontend     # 웹만
npm run dev:backend      # API만
npm run build            # 전체 빌드
npm run db:up            # MySQL 컨테이너 시작
npm run db:down          # MySQL 컨테이너 중지
```

## 프로젝트 구조

```
SmartFlow WMS/
├── backend/          # Express API, Prisma
├── frontend/         # React SPA
└── docs/             # 아키텍처·규칙 문서
```

자세한 구조와 API 패턴은 [docs/architecture.md](docs/architecture.md), [docs/folder-structure.md](docs/folder-structure.md)를 참고하세요.

## 문서

- [아키텍처](docs/architecture.md)
- [폴더 구조](docs/folder-structure.md)
- [개발 규칙](docs/conventions.md)
