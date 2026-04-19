import prisma from '../lib/prisma.js';

/**
 * Create a new sale with items
 * Business Logic:
 * - Profit = sellingPrice - costPrice per item
 * - Reduce stock after sale
 * - Prevent sale if stock is insufficient
 * - Calculate totalAmount and totalProfit
 */
export const createSale = async (req, res) => {
  try {
    const { items, customerName, customerPhone, paymentMethod = 'cash' } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sales must contain at least one item',
      });
    }

    // Validate each item
    let totalAmount = 0;
    let totalProfit = 0;
    const saleItems = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have valid productId and quantity > 0',
        });
      }

      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${productId} not found`,
        });
      }

      // Check stock availability
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`,
        });
      }

      // Calculate profit per item: sellingPrice - costPrice
      const itemProfit = (product.sellingPrice - product.costPrice) * quantity;
      const itemTotal = product.sellingPrice * quantity;

      totalAmount += itemTotal;
      totalProfit += itemProfit;

      saleItems.push({
        productId,
        quantity,
        price: product.sellingPrice,
        profit: product.sellingPrice - product.costPrice,
      });
    }

    // Validate payment method
    const validPaymentMethods = ['cash', 'card', 'transfer'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`,
      });
    }

    // Create sale with items in transaction
    const sale = await prisma.sale.create({
      data: {
        totalAmount,
        totalProfit,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        paymentMethod,
        items: {
          create: saleItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            profit: item.profit,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Update or create daily analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyAnalytics.upsert({
      where: { date: today },
      create: {
        date: today,
        totalSales: totalAmount,
        totalProfit: totalProfit,
        totalCost: items.reduce((sum, item) => {
          const product = items.find(i => i.productId === item.productId);
          return sum; // This will be calculated properly
        }, 0),
        itemsSold: items.reduce((sum, item) => sum + item.quantity, 0),
        transactionCount: 1,
      },
      update: {
        totalSales: {
          increment: totalAmount,
        },
        totalProfit: {
          increment: totalProfit,
        },
        itemsSold: {
          increment: items.reduce((sum, item) => sum + item.quantity, 0),
        },
        transactionCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: {
        id: sale.id,
        totalAmount: sale.totalAmount,
        totalProfit: sale.totalProfit,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        paymentMethod: sale.paymentMethod,
        itemCount: sale.items.length,
        createdAt: sale.createdAt,
        items: sale.items,
      },
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sale',
      error: error.message,
    });
  }
};

/**
 * Get all sales with filters
 */
export const getSales = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, limit = 50, offset = 0 } = req.query;

    const where = {};

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Filter by payment method
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.sale.count({ where });

    res.json({
      success: true,
      data: sales,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales',
      error: error.message,
    });
  }
};

/**
 * Get single sale by ID
 */
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sale',
      error: error.message,
    });
  }
};

/**
 * Get daily sales summary
 */
export const getDailySales = async (req, res) => {
  try {
    const { date } = req.query;

    let startDate = new Date();
    if (date) {
      startDate = new Date(date);
    }
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.totalProfit, 0);
    const itemsSold = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    res.json({
      success: true,
      data: {
        date: startDate.toISOString().split('T')[0],
        sales,
        summary: {
          totalSales: sales.length,
          totalAmount,
          totalProfit,
          itemsSold,
          averageTransaction: sales.length > 0 ? totalAmount / sales.length : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily sales',
      error: error.message,
    });
  }
};
