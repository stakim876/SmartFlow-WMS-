import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: '시스템 관리자' },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: { name: 'STAFF', description: '일반 직원' },
  });

  const adminPassword = await bcrypt.hash('admin1234', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smartflow.com' },
    update: { name: '관리자' },
    create: {
      email: 'admin@smartflow.com',
      password: adminPassword,
      name: '관리자',
      roleId: adminRole.id,
    },
  });

  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-001' },
    update: {},
    create: {
      code: 'WH-001',
      name: '본사 창고',
      address: '서울특별시',
    },
  });

  const location = await prisma.location.upsert({
    where: {
      warehouseId_code: {
        warehouseId: warehouse.id,
        code: 'A-01-01',
      },
    },
    update: {},
    create: {
      warehouseId: warehouse.id,
      code: 'A-01-01',
      name: 'A구역 1열 1단',
    },
  });

  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'SKU-001' },
      update: {},
      create: {
        sku: 'SKU-001',
        name: '무선 마우스',
        description: '블루투스 무선 마우스',
        unit: 'EA',
        price: 29000,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'SKU-002' },
      update: {},
      create: {
        sku: 'SKU-002',
        name: '기계식 키보드',
        description: '청축 기계식 키보드',
        unit: 'EA',
        price: 89000,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'SKU-003' },
      update: {},
      create: {
        sku: 'SKU-003',
        name: 'USB-C 허브',
        description: '7in1 USB-C 멀티허브',
        unit: 'EA',
        price: 45000,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'SHOP-001' },
      update: { name: '아이폰 15' },
      create: {
        sku: 'SHOP-001',
        name: '아이폰 15',
        description: 'my-shop 연동 데모 상품',
        unit: 'EA',
        price: 1500000,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'SHOP-002' },
      update: { name: '맥북 프로' },
      create: {
        sku: 'SHOP-002',
        name: '맥북 프로',
        description: 'my-shop 연동 데모 상품',
        unit: 'EA',
        price: 2800000,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'SHOP-003' },
      update: { name: '에어팟 프로' },
      create: {
        sku: 'SHOP-003',
        name: '에어팟 프로',
        description: 'my-shop 연동 데모 상품',
        unit: 'EA',
        price: 350000,
      },
    }),
  ]);

  for (const product of products) {
    await prisma.inventory.upsert({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: location.id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        locationId: location.id,
        quantity: 100,
      },
    });
  }

  await prisma.partner.upsert({
    where: { code: 'PT-001' },
    update: {},
    create: {
      code: 'PT-001',
      name: '스마트플로우 공급사',
      type: 'SUPPLIER',
      contactName: '김담당',
      phone: '02-1234-5678',
      email: 'supplier@example.com',
    },
  });

  await prisma.partner.upsert({
    where: { code: 'MY-SHOP' },
    update: {},
    create: {
      code: 'MY-SHOP',
      name: 'my-shop 온라인몰',
      type: 'CUSTOMER',
    },
  });

  const existingNotices = await prisma.notice.count();
  if (existingNotices === 0) {
    await prisma.notice.createMany({
      data: [
        {
          title: 'SmartFlow WMS 오픈 안내',
          content:
            'SmartFlow WMS가 정식 오픈되었습니다.\n입고·출고·재고 관리 기능을 이용해 주세요.\n문의사항은 관리자에게 연락 바랍니다.',
          isPinned: true,
          authorId: adminUser.id,
        },
        {
          title: '재고 실사 일정 안내',
          content: '매월 마지막 주 금요일에 재고 실사를 진행합니다. 해당 일정에 맞춰 재고를 정리해 주세요.',
          isPinned: false,
          authorId: adminUser.id,
        },
      ],
    });
  }

  console.log('Seed completed:', {
    adminUser: adminUser.email,
    roles: [adminRole.name, staffRole.name],
    warehouse: warehouse.code,
    products: products.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
