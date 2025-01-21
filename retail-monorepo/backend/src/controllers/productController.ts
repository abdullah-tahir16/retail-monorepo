import { Request, Response } from 'express';
import { Product } from '../models';

// @desc   Create a new product (Admin only)
// @route  POST /api/products
// @access Private (Admin)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    const product = new Product({
      name,
      description,
      price,
      image,
      category,
      stock,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc   Get all products with search, filtering, sorting & pagination
// @route  GET /api/products
// @access Public
export const getAllProducts = async (req: Request, res: Response) => {
    try {
      const { search, category, minPrice, maxPrice, sort, page, limit } = req.query;
  
      // Search by name
      let query: any = {};
      if (search) {
        query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
      }
  
      // Filter by category
      if (category) {
        query.category = category;
      }
  
      // Filter by price range
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
  
      // Sorting
      let sortQuery = {};
      if (sort) {
        const sortField = sort.toString();
        if (sortField === 'priceAsc') sortQuery = { price: 1 }; // Sort by price (low to high)
        else if (sortField === 'priceDesc') sortQuery = { price: -1 }; // Sort by price (high to low)
        else if (sortField === 'latest') sortQuery = { createdAt: -1 }; // Sort by latest
      }
  
      // Pagination
      const pageNumber = Number(page) || 1;
      const pageSize = Number(limit) || 10;
      const skip = (pageNumber - 1) * pageSize;
  
      const totalProducts = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(pageSize);
  
      res.json({
        totalProducts,
        page: pageNumber,
        totalPages: Math.ceil(totalProducts / pageSize),
        products,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error });
    }
  };

// @desc   Get a single product by ID
// @route  GET /api/products/:id
// @access Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc   Update a product (Admin only)
// @route  PUT /api/products/:id
// @access Private (Admin)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;
    product.category = category || product.category;
    product.stock = stock || product.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc   Delete a product (Admin only)
// @route  DELETE /api/products/:id
// @access Private (Admin)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
