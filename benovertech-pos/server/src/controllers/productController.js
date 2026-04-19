import prisma from '../lib/prisma.js';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// Get single product by ID or barcode
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ID or barcode
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { barcode: id }
        ]
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const { name, category, costPrice, sellingPrice, stock, barcode } = req.body;

    // Validation
    if (!name || !category || !costPrice || !sellingPrice || !barcode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, costPrice, sellingPrice, barcode',
      });
    }

    if (costPrice < 0 || sellingPrice < 0 || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and stock cannot be negative',
      });
    }

    if (sellingPrice <= costPrice) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be greater than cost price',
      });
    }

    // Check if barcode already exists
    const existingProduct = await prisma.product.findUnique({
      where: { barcode },
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Barcode already exists',
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock) || 0,
        barcode,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle unique constraint errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: `${error.meta?.target?.[0] || 'Field'} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, costPrice, sellingPrice, stock, barcode } = req.body;

    // Find product
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Validation
    if (costPrice && sellingPrice && sellingPrice <= costPrice) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be greater than cost price',
      });
    }

    // Check if barcode is being changed and already exists
    if (barcode && barcode !== product.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode },
      });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Barcode already exists',
        });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) }),
        ...(sellingPrice !== undefined && { sellingPrice: parseFloat(sellingPrice) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(barcode && { barcode }),
      },
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: `${error.meta?.target?.[0] || 'Field'} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Don't delete if there are sales
    const saleItems = await prisma.saleItem.findMany({
      where: { productId: id },
    });

    if (saleItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with existing sales records',
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

// Search products by barcode or name
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query required',
      });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { barcode: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message,
    });
  }
};

// Get low stock products
export const getLowStock = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: parseInt(threshold),
        },
      },
      orderBy: { stock: 'asc' },
    });

    res.json({
      success: true,
      data: lowStockProducts,
      total: lowStockProducts.length,
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: error.message,
    });
  }
};
