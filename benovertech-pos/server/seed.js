import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample data...\n');

  try {
    // Clear existing data
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.product.deleteMany();
    await prisma.dailyAnalytics.deleteMany();
    console.log('✅ Cleared existing data');

    // Create sample products
    const products = await prisma.product.createMany({
      data: [
        {
          name: 'iPhone 15 Pro',
          category: 'Smartphones',
          costPrice: 280000,
          sellingPrice: 350000,
          stock: 15,
          barcode: '1001001001',
        },
        {
          name: 'iPhone 15',
          category: 'Smartphones',
          costPrice: 240000,
          sellingPrice: 300000,
          stock: 20,
          barcode: '1001001002',
        },
        {
          name: 'Samsung S24 Ultra',
          category: 'Smartphones',
          costPrice: 300000,
          sellingPrice: 380000,
          stock: 12,
          barcode: '1001001003',
        },
        {
          name: 'Samsung S24',
          category: 'Smartphones',
          costPrice: 260000,
          sellingPrice: 330000,
          stock: 18,
          barcode: '1001001004',
        },
        {
          name: 'iPad Air 6th Gen',
          category: 'Tablets',
          costPrice: 360000,
          sellingPrice: 450000,
          stock: 8,
          barcode: '1002001001',
        },
        {
          name: 'iPad Pro 12.9',
          category: 'Tablets',
          costPrice: 420000,
          sellingPrice: 530000,
          stock: 5,
          barcode: '1002001002',
        },
        {
          name: 'Galaxy Tab S9 Ultra',
          category: 'Tablets',
          costPrice: 380000,
          sellingPrice: 480000,
          stock: 7,
          barcode: '1002001003',
        },
        {
          name: 'MacBook Air M3',
          category: 'Laptops',
          costPrice: 700000,
          sellingPrice: 850000,
          stock: 4,
          barcode: '1003001001',
        },
        {
          name: 'Dell XPS 15',
          category: 'Laptops',
          costPrice: 550000,
          sellingPrice: 680000,
          stock: 6,
          barcode: '1003001002',
        },
        {
          name: 'HP Pavilion 15',
          category: 'Laptops',
          costPrice: 350000,
          sellingPrice: 450000,
          stock: 10,
          barcode: '1003001003',
        },
        {
          name: 'AirPods Pro',
          category: 'Accessories',
          costPrice: 35000,
          sellingPrice: 50000,
          stock: 50,
          barcode: '1004001001',
        },
        {
          name: 'Samsung Galaxy Buds2',
          category: 'Accessories',
          costPrice: 25000,
          sellingPrice: 40000,
          stock: 60,
          barcode: '1004001002',
        },
        {
          name: 'USB-C Cable',
          category: 'Accessories',
          costPrice: 2000,
          sellingPrice: 5000,
          stock: 200,
          barcode: '1004001003',
        },
        {
          name: 'iPhone 15 Screen Protector',
          category: 'Accessories',
          costPrice: 1500,
          sellingPrice: 3500,
          stock: 150,
          barcode: '1004001004',
        },
        {
          name: 'Wireless Charger',
          category: 'Accessories',
          costPrice: 8000,
          sellingPrice: 15000,
          stock: 40,
          barcode: '1004001005',
        },
      ],
    });

    console.log(`✅ Created ${products.count} sample products\n`);

    // Get all products for creating sales
    const allProducts = await prisma.product.findMany();

    // Create sample sales for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sale1 = await prisma.sale.create({
      data: {
        totalAmount: 700000,
        totalProfit: 120000,
        customerName: 'Ahmed Ibrahim',
        customerPhone: '08012345678',
        paymentMethod: 'cash',
        items: {
          create: [
            {
              productId: allProducts[0].id, // iPhone 15 Pro
              quantity: 2,
              price: 350000,
              profit: 70000,
            },
          ],
        },
      },
    });

    const sale2 = await prisma.sale.create({
      data: {
        totalAmount: 530000,
        totalProfit: 110000,
        customerName: 'Chioma Okafor',
        customerPhone: '08098765432',
        paymentMethod: 'card',
        items: {
          create: [
            {
              productId: allProducts[2].id, // Samsung S24 Ultra
              quantity: 1,
              price: 380000,
              profit: 80000,
            },
            {
              productId: allProducts[11].id, // Galaxy Buds2
              quantity: 3,
              price: 40000,
              profit: 15000,
            },
          ],
        },
      },
    });

    const sale3 = await prisma.sale.create({
      data: {
        totalAmount: 1380000,
        totalProfit: 230000,
        customerName: 'Kunle Adeyemi',
        customerPhone: '07065432109',
        paymentMethod: 'transfer',
        items: {
          create: [
            {
              productId: allProducts[4].id, // iPad Air
              quantity: 1,
              price: 450000,
              profit: 90000,
            },
            {
              productId: allProducts[1].id, // iPhone 15
              quantity: 2,
              price: 300000,
              profit: 60000,
            },
            {
              productId: allProducts[10].id, // AirPods Pro
              quantity: 2,
              price: 50000,
              profit: 30000,
            },
          ],
        },
      },
    });

    console.log('✅ Created 3 sample sales with items\n');

    // Update product stock
    await prisma.product.update({
      where: { id: allProducts[0].id },
      data: { stock: 13 },
    });
    await prisma.product.update({
      where: { id: allProducts[1].id },
      data: { stock: 18 },
    });
    await prisma.product.update({
      where: { id: allProducts[2].id },
      data: { stock: 11 },
    });
    await prisma.product.update({
      where: { id: allProducts[4].id },
      data: { stock: 7 },
    });
    await prisma.product.update({
      where: { id: allProducts[10].id },
      data: { stock: 48 },
    });
    await prisma.product.update({
      where: { id: allProducts[11].id },
      data: { stock: 57 },
    });

    console.log('✅ Updated product stock\n');

    // Create daily analytics
    const totalAmount = 700000 + 530000 + 1380000;
    const totalProfit = 120000 + 110000 + 230000;

    await prisma.dailyAnalytics.create({
      data: {
        date: today,
        totalSales: totalAmount,
        totalProfit: totalProfit,
        totalCost: totalAmount - totalProfit,
        itemsSold: 11,
        transactionCount: 3,
      },
    });

    console.log('✅ Created daily analytics\n');

    console.log('='.repeat(50));
    console.log('🌱 Database seeded successfully!');
    console.log('='.repeat(50));
    console.log('\n📊 Sample Data Created:');
    console.log(`  ✓ 15 Products across 5 categories`);
    console.log(`  ✓ 3 Sales transactions (today)`);
    console.log(`  ✓ Daily analytics record`);
    console.log('\n💡 Test the API:');
    console.log('  1. GET  http://localhost:5000/api/products');
    console.log('  2. GET  http://localhost:5000/api/sales');
    console.log('  3. GET  http://localhost:5000/api/analytics');
    console.log('\n');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
