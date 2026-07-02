/** UI 한글 라벨 (UTF-8 단일 관리) */
export const NAV = {
  dashboard: '대시보드',
  products: '상품관리',
  inventory: '재고관리',
  warehouses: '창고·로케이션',
  inbound: '입고관리',
  outbound: '출고관리',
  partners: '거래처관리',
  purchaseOrders: '발주관리',
  users: '직원관리',
  notices: '공지사항',
  shopIntegration: '쇼핑몰 연동',
  reports: '리포트',
} as const;

export const NAV_SECTIONS = {
  overview: '개요',
  logistics: '물류 운영',
  trade: '거래/발주',
  system: '시스템',
} as const;

export const COMMON = {
  search: '검색',
  filter: '필터',
  cancel: '취소',
  save: '저장',
  delete: '삭제',
  edit: '수정',
  prev: '이전',
  next: '다음',
  loading: '처리 중...',
  loadingLabel: '로딩 중',
  userFallback: '사용자',
  logout: '로그아웃',
  approve: '승인',
  complete: '완료',
  register: '등록',
  transfer: '이동',
  active: '활성',
  inactive: '비활성',
  none: '없음',
  note: '비고',
  status: '상태',
  actions: '작업',
  unit: '단위',
  price: '가격',
  quantity: '수량',
  all: '전체',
  name: '상품명',
  userName: '이름',
  actor: '작업자',
  partnerName: '거래처명',
  partner: '거래처',
  partnerCode: '거래처 코드',
  partnerType: '유형',
  contactName: '담당자',
  phone: '연락처',
  address: '주소',
  orderNo: '전표번호',
  itemCount: '품목수',
  date: '등록일',
  currency: '원',
  description: '설명',
  imageUrl: '이미지 URL',
  email: '이메일',
  password: '비밀번호',
  login: '로그인',
  warehouse: '창고',
  location: '로케이션',
  warehouseCode: '창고 코드',
  locationCode: '로케이션 코드',
  locationName: '로케이션명',
  beforeAfter: '변동 전/후',
} as const;

export const ORDER_STATUS: Record<string, string> = {
  DRAFT: '임시저장',
  PENDING: '승인대기',
  APPROVED: '승인완료',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export const MOVEMENT_TYPE: Record<string, string> = {
  INBOUND: '입고',
  OUTBOUND: '출고',
  ADJUSTMENT: '조정',
  TRANSFER: '이동',
};

export const ERRORS = {
  loadFailed: '데이터를 불러오지 못했습니다.',
  actionFailed: '요청 처리에 실패했습니다.',
  adjustFailed: '재고 수정에 실패했습니다.',
  transferFailed: '재고 이동에 실패했습니다. 수량을 확인해주세요.',
  saveFailed: '저장에 실패했습니다. 입력값을 확인해주세요.',
  completeFailed: '완료 처리에 실패했습니다. 로케이션과 재고를 확인해주세요.',
  loginFailed: '이메일 또는 비밀번호가 올바르지 않습니다.',
  masterLoadFailed: '창고·로케이션 정보를 불러오지 못했습니다.',
} as const;

export const AUTH = {
  tagline: '창고 관리 시스템',
  passwordPlaceholder: '비밀번호 입력',
  testAccount: '테스트 계정: admin@smartflow.com / admin1234',
} as const;

export const PROFILE = {
  title: '내 계정',
  description: '프로필 정보와 비밀번호를 관리합니다.',
  profileSection: '프로필',
  passwordSection: '비밀번호 변경',
  currentPassword: '현재 비밀번호',
  newPassword: '새 비밀번호',
  confirmPassword: '새 비밀번호 확인',
  role: '역할',
  memberSince: '가입일',
  profileSaved: '프로필이 저장되었습니다.',
  passwordSaved: '비밀번호가 변경되었습니다.',
  passwordMismatch: '새 비밀번호가 일치하지 않습니다.',
  passwordTooShort: '새 비밀번호는 8자 이상이어야 합니다.',
  saveProfileFailed: '프로필 저장에 실패했습니다.',
  changePasswordFailed: '비밀번호 변경에 실패했습니다.',
} as const;

export const THEME = {
  darkMode: '다크 모드',
  lightMode: '라이트 모드',
} as const;

export const DASHBOARD = {
  description: '입고·출고·재고 현황을 한눈에 확인합니다.',
  kpi: {
    pendingInbound: '승인대기 입고',
    pendingOutbound: '승인대기 출고',
    totalStock: '총 재고 수량',
    lowStock: (threshold: number) => `재고 주의 (\u2264${threshold})`,
    activeProducts: '활성 상품',
    todayInbound: '오늘 입고 완료',
    todayOutbound: '오늘 출고 완료',
  },
  sections: {
    recentInbound: '최근 입고',
    recentOutbound: '최근 출고',
    lowStock: '재고 부족 상품',
    notices: '고정 공지',
  },
  emptyInbound: '최근 입고 전표가 없습니다.',
  emptyOutbound: '최근 출고 전표가 없습니다.',
  emptyLowStock: '재고 부족 상품이 없습니다.',
  emptyNotices: '고정된 공지가 없습니다.',
  viewAll: '전체 보기',
} as const;

export const PRODUCTS = {
  description: (total: number) => `총 ${total}개 상품`,
  add: '상품 등록',
  searchPlaceholder: 'SKU 또는 상품명 검색',
  empty: '등록된 상품이 없습니다.',
  deleteConfirm: (name: string) => `"${name}" 상품을 삭제하시겠습니까?`,
  editTitle: '상품 수정',
  addTitle: '상품 등록',
} as const;

export const INVENTORY = {
  stockDescription: (total: number) => `총 ${total}건의 재고 현황`,
  movementDescription: (total: number) => `총 ${total}건의 이동 이력`,
  tabStock: '재고 현황',
  tabMovements: '이동 이력',
  searchPlaceholder: 'SKU 또는 상품명 검색',
  allWarehouses: '전체 창고',
  allTypes: '전체 유형',
  emptyStock: '조회된 재고가 없습니다.',
  emptyMovements: '이력이 없습니다.',
  adjust: '수량 조정',
  transfer: '재고 이동',
  adjustTitle: '재고 조정',
  currentQty: '현재 수량',
  newQty: '변경 수량',
  noteOptional: '조정 사유 (선택)',
  transferTitle: '재고 이동',
  fromLocation: '출발 로케이션',
  toLocation: '도착 로케이션',
  transferQty: '이동 수량',
  transferNoteOptional: '이동 사유 (선택)',
  noTransferTarget: '이동 가능한 다른 로케이션이 없습니다.',
  colUpdatedAt: '최종 변경',
  fromLabel: '출발',
  stockLabel: '재고',
} as const;

export const INBOUND = {
  description: '입고 등록, 승인, 완료',
  register: '입고 등록',
  empty: '등록된 입고 전표가 없습니다.',
  formTitle: '입고 등록',
  completeTitle: '입고 완료',
  completeAction: '완료 처리',
  partnerOptional: '거래처 (선택)',
  items: '품목',
  addItem: '+ 품목 추가',
  selectProduct: '상품 선택',
  locationOnComplete: '로케이션 (완료 시 지정 가능)',
  selectLocation: '로케이션 선택',
  locationAssigned: '로케이션 지정됨',
  saveFailed: '입고 등록에 실패했습니다.',
  allStatuses: '전체 상태',
} as const;

export const OUTBOUND = {
  description: '출고 등록, 승인, 완료',
  register: '출고 등록',
  empty: '등록된 출고 전표가 없습니다.',
  formTitle: '출고 등록',
  completeTitle: '출고 완료',
  completeAction: '완료 처리',
  partnerOptional: '거래처 (선택)',
  items: '품목',
  addItem: '+ 품목 추가',
  selectProduct: '상품 선택',
  locationOnComplete: '출고 로케이션 (완료 시 지정 가능)',
  selectLocation: '출고 로케이션 선택',
  locationAssigned: '로케이션 지정됨',
  saveFailed: '출고 등록에 실패했습니다.',
  allStatuses: '전체 상태',
} as const;

export const PARTNER_TYPE: Record<string, string> = {
  SUPPLIER: '공급사',
  CUSTOMER: '고객사',
  BOTH: '공급/고객',
};

export const WAREHOUSES = {
  description: '창고와 보관 로케이션을 등록·관리합니다.',
  warehouseSection: '창고 목록',
  locationSection: (name: string) => `${name} 로케이션`,
  locationsTitle: '로케이션',
  addWarehouse: '창고 등록',
  addLocation: '로케이션 등록',
  searchPlaceholder: '코드 또는 창고명 검색',
  empty: '등록된 창고가 없습니다.',
  locationsEmpty: '등록된 로케이션이 없습니다.',
  selectWarehouse: '창고를 선택하면 로케이션을 관리할 수 있습니다.',
  deleteWarehouseConfirm: (name: string) => `"${name}" 창고를 비활성화하시겠습니까?`,
  deleteLocationConfirm: (code: string) => `"${code}" 로케이션을 삭제하시겠습니까?`,
  editWarehouseTitle: '창고 수정',
  addWarehouseTitle: '창고 등록',
  editLocationTitle: '로케이션 수정',
  addLocationTitle: '로케이션 등록',
  locationCount: '로케이션 수',
  inventoryLinked: '재고 연결',
} as const;

export const PARTNERS = {
  description: (total: number) => `총 ${total}개 거래처`,
  add: '거래처 등록',
  searchPlaceholder: '코드 또는 거래처명 검색',
  allTypes: '전체 유형',
  empty: '등록된 거래처가 없습니다.',
  deleteConfirm: (name: string) => `"${name}" 거래처를 삭제하시겠습니까?`,
  editTitle: '거래처 수정',
  addTitle: '거래처 등록',
} as const;

export const PURCHASE_ORDERS = {
  description: '발주 등록, 승인, 입고 전환',
  register: '발주 등록',
  empty: '등록된 발주 전표가 없습니다.',
  formTitle: '발주 등록',
  partnerRequired: '거래처',
  selectPartner: '거래처 선택',
  items: '품목',
  addItem: '+ 품목 추가',
  selectProduct: '상품 선택',
  unitPrice: '단가',
  totalAmount: '발주 금액',
  saveFailed: '발주 등록에 실패했습니다.',
  convertToInbound: '입고 전환',
  inboundOrder: '입고 전표',
  allStatuses: '전체 상태',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  STAFF: '직원',
  VIEWER: '조회 전용',
};

export const REPORTS = {
  description: '기간별 입고·출고·재고 이력을 Excel로 내려받습니다.',
  period: '조회 기간',
  from: '시작일',
  to: '종료일',
  inbound: '입고 내역 Excel',
  outbound: '출고 내역 Excel',
  movements: '재고 이력 Excel',
  inventory: '재고 현황 Excel',
  hint: '기간을 비우면 전체 데이터를 내려받습니다.',
} as const;

export const USERS = {
  description: (total: number) => `총 ${total}명의 직원`,
  add: '직원 등록',
  searchPlaceholder: '이메일 또는 이름 검색',
  allRoles: '전체 역할',
  empty: '등록된 직원이 없습니다.',
  deleteConfirm: (name: string) => `"${name}" 직원을 삭제하시겠습니까?`,
  editTitle: '직원 수정',
  addTitle: '직원 등록',
  resetPassword: '비밀번호 변경',
  resetPasswordTitle: '비밀번호 재설정',
  newPassword: '새 비밀번호',
  role: '역할',
  adminOnly: '직원 관리는 관리자만 이용할 수 있습니다.',
  saveFailed: '직원 저장에 실패했습니다.',
} as const;

export const NOTICES = {
  description: (total: number) => `총 ${total}개 공지`,
  add: '공지 등록',
  searchPlaceholder: '제목 또는 내용 검색',
  empty: '등록된 공지사항이 없습니다.',
  deleteConfirm: (title: string) => `"${title}" 공지를 삭제하시겠습니까?`,
  editTitle: '공지 수정',
  addTitle: '공지 등록',
  title: '제목',
  content: '내용',
  pinned: '상단 고정',
  pinnedBadge: '고정',
  author: '작성자',
  pin: '고정',
  unpin: '고정 해제',
  viewTitle: '공지 상세',
} as const;

export const FORMAT = {
  skuName: (sku: string, name: string) => `${sku} / ${name}`,
  codeName: (code: string, name: string) => `${code} / ${name}`,
  beforeAfter: (before: number | null | undefined, after: number | null | undefined) =>
    `${before ?? '-'} / ${after ?? '-'}`,
} as const;

export const ADVANCED = {
  sortBy: '정렬',
  sortNewest: '최신순',
  sortSku: 'SKU순',
  sortName: '이름순',
  sortPrice: '가격순',
  asc: '오름차순',
  desc: '내림차순',
  exportExcel: 'Excel보내기',
  importExcel: 'Excel 가져오기',
  importTitle: '상품 Excel 가져오기',
  importHint: 'SKU, 상품명, 단위, 가격, 설명 열을 포함한 xlsx/csv 파일',
  importSelect: '파일 선택',
  importResult: (created: number, skipped: number) =>
    `등록 ${created}건, 건너뜀 ${skipped}건`,
  uploadImage: '이미지 업로드',
  notifications: '알림',
  markAllRead: '모두 읽음',
  noNotifications: '새 알림이 없습니다.',
  exportInventory: '재고보내기',
  exportInventoryPdf: 'PDF보내기',
  exportMovements: '이력보내기',
} as const;

export const SHOP_INTEGRATION = {
  title: 'my-shop 연동',
  subtitle: '쇼핑몰 상품·재고·주문을 WMS와 동기화합니다.',
  status: '연동 상태',
  configured: '설정됨',
  notConfigured: '미설정',
  connected: '연결됨',
  disconnected: '연결 실패',
  shopUrl: '쇼핑몰 API',
  mappingCount: '매핑 상품',
  orderSyncCount: '동기화 주문',
  syncProducts: '상품 매핑 동기화',
  pushStock: '재고 푸시',
  pullOrders: '주문 가져오기',
  mappings: '상품 매핑',
  orders: '주문 동기화',
  shopProductId: '몰 상품 ID',
  shopSku: '몰 SKU',
  shopName: '몰 상품명',
  wmsSku: 'WMS SKU',
  wmsName: 'WMS 상품명',
  lastStockPush: '마지막 재고 푸시',
  shopOrderId: '몰 주문 ID',
  outboundOrderNo: '출고 전표',
  fulfill: '배송 처리',
  carrierCode: '택배사 코드',
  trackingNumber: '송장번호',
  fulfillSubmit: '쇼핑몰에 배송 정보 전송',
  syncResult: (mapped: number, skipped: number) =>
    `매핑 ${mapped}건, 건너뜀 ${skipped}건`,
  stockResult: (count: number) => `재고 ${count}건 푸시 완료`,
  orderResult: (created: number, skipped: number) =>
    `출고 생성 ${created}건, 건너뜀 ${skipped}건`,
  noMappings: '매핑된 상품이 없습니다. SKU를 맞춘 뒤 상품 매핑을 실행하세요.',
  noOrders: '동기화된 주문이 없습니다.',
  configHint:
    'backend .env에 SHOP_API_URL, SHOP_API_KEY를 설정하고 my-shop에 WMS_INTEGRATION_API_KEY를 동일하게 설정하세요.',
} as const;
