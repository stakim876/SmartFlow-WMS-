# 개발 규칙 (Conventions)

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| Backend 파일 | `{domain}.{layer}.ts` | `inventory.service.ts` |
| Backend 폴더 | kebab-case | `purchase-order/` |
| Frontend feature | kebab-case | `purchase-orders/` |
| React 컴포넌트 | PascalCase | `InventoryPage.tsx` |
| API URL | kebab-case, 복수형 | `/purchase-orders` |
| DB 테이블 | snake_case (Prisma @@map) | `inventory_movements` |

## Backend 레이어 책임

```
routes       HTTP 메서드, 경로, 미들웨어만. 로직 금지.
controller   req/res 변환. service 호출.
service      비즈니스 로직, Zod 스키마, 트랜잭션.
repository   Prisma CRUD. 비즈니스 판단 금지.
core/        모든 모듈이 공유하는 인프라.
```

## Frontend 레이어 책임

```
pages/       페이지 조합, 데이터 fetch, 상태 관리.
components/  해당 feature 전용 UI.
api/         API 호출 함수 (axios).
shared/      2개 이상 feature에서 쓰는 것만.
```

## API 응답

```typescript
// 성공
{ success: true, data: T, message?: string }

// 실패
{ success: false, message: string, code?: string }
```

## Git 브랜치 (권장)

```
main          운영
develop       개발 통합
feature/7.3-inbound   기능별 브랜치
fix/inventory-transfer
```

## 커밋 메시지 (권장)

```
feat(inventory): 재고 이동 API 및 화면 추가
fix(auth): 토큰 갱신 실패 처리
docs: 아키텍처 문서 추가
refactor(backend): modules 구조로 재배치
```

## 환경변수

- `backend/.env`: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `frontend/.env`: `VITE_API_URL` (선택, 기본은 Vite proxy)
- `.env.example` 참고, `.env`는 git에 포함하지 않음

## 코드 스타일

- TypeScript strict mode
- `.editorconfig` 준수 (2 spaces, LF)
- CSS Modules (`*.module.css`)로 컴포넌트별 스타일
- 주석은 비즈니스 로직, 복잡한 처리에만
