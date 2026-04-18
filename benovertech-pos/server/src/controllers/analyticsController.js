import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get overall analytics/dashboard data
 */
export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};

    if (startDate || endDate) {
      dateFilter = {
        createdAt: {},
      };
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = end;
      }
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      dateFilter = {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      };
    }

    // Get today's sales data
    const sales = await prisma.sale.findMany({
      where: dateFilter,
      include: {
        items: true,
      },
    });

    // Calculate metrics
    const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.totalProfit, 0);
    const totalCost = sales.reduce((sum, sale) => {
      const saleCost = sale.items.reduce((itemSum, item) => {
        // This will be calculated from database
        return itemSum;
      }, 0);
      return sum + saleCost;
    }, 0);

    const totalItems = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const transactionCount = sales.length;
    const averageTransaction = transactionCount > 0 ? totalSalesAmount / transactionCount : 0;

    // Get payment method breakdown
    const paymentMethods = {};
    sales.forEach(sale => {
      const method = sale.paymentMethod;
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, amount: 0 };
      }
      paymentMethods[method].count += 1;
      paymentMethods[method].amount += sale.totalAmount;
    });

    // Get top products (most sold)
    const topProducts = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!topProducts[item.productId]) {
          topProducts[item.productId] = {
            productId: item.productId,
            quantity: 0,
            revenue: 0,
            profit: 0,
          };
        }
        topProducts[item.productId].quantity += item.quantity;
        topProducts[item.productId].revenue += item.price * item.quantity;
        topProducts[item.productId].profit += item.profit * item.quantity;
      });
    });

    // Convert to array and sort
    const topProductsArray = Object.values(topProducts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Enrich with product details
    const topProductsWithDetails = await Promise.all(
      topProductsArray.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, category: true },
        });
        return {
          ...item,
          product,
        };
      })
    );

    // Calculate profit margin
    const profitMargin = totalSalesAmount > 0 ? (totalProfit / totalSalesAmount) * 100 : 0;

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 10,
        },
      },
      orderBy: { stock: 'asc' },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        period: {
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0],
        },
        summary: {
          totalSalesAmount,
          totalProfit,
          totalCost,
          totalItems,
          transactionCount,
          averageTransaction,
          profitMargin: profitMargin.toFixed(2),
        },
        paymentMethods,
        topProducts: topProductsWithDetails,
        lowStockProducts,
        rawSalesCount: sales.length,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};

/**
 * Get monthly analytics
 */
export const getMonthlyAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
      },
    });

    // Get daily breakdown
    const dailyData = {};
    sales.forEach(sale => {
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          totalSales: 0,
          totalProfit: 0,
          transactions: 0,
          items: 0,
        };
      }
      dailyData[dateKey].totalSales += sale.totalAmount;
      dailyData[dateKey].totalProfit += sale.totalProfit;
      dailyData[dateKey].transactions += 1;
      dailyData[dateKey].items += sale.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    const dailyArray = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.totalProfit, 0);
    const totalItems = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    res.json({
      success: true,
      data: {
        month,
        year,
        summary: {
          totalSalesAmount,
          totalProfit,
          totalItems,
          transactionCount: sales.length,
          averageDaily: sales.length > 0 ? totalSalesAmount / Object.keys(dailyData).length : 0,
        },
        daily: dailyArray,
      },
    });
  } catch (error) {
    console.error('Error fetching monthly analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly analytics',
      error: error.message,
    });
  }
};

/**
 * Get inventory report
 */
export const getInventoryReport = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { category: 'asc' },
    });

    // Calculate metrics
    const totalStockValue = products.reduce(
      (sum, product) => sum + product.stock * product.sellingPrice,
      0
    );

    const totalCostValue = products.reduce(
      (sum, product) => sum + product.stock * product.costPrice,
      0
    );

    const totalProfit = products.reduce(
      (sum, product) => sum + product.stock * (product.sellingPrice - product.costPrice),
      0
    );

    // Group by category
    const byCategory = {};
    products.forEach(product => {
      if (!byCategory[product.category]) {
        byCategory[product.category] = {
          category: product.category,
          items: 0,
          stockValue: 0,
          costValue: 0,
          products: [],
        };
      }
      byCategory[product.category].items += product.stock;
      byCategory[product.category].stockValue += product.stock * product.sellingPrice;
      byCategory[product.category].costValue += product.stock * product.costPrice;
      byCategory[product.category].products.push(product);
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: products.length,
          totalItems: products.reduce((sum, p) => sum + p.stock, 0),
          totalStockValue,
          totalCostValue,
          totalProfit,
        },
        byCategory: Object.values(byCategory),
        products,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory report',
      error: error.message,
    });
  }
};
