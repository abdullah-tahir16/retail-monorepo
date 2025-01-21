import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Order from '../models/order/order';

// @desc   Create a new order
// @route  POST /api/orders
// @access Private (Authenticated Users)
export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
      const { items, totalPrice } = req.body;
  
      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in the order' });
      }
  
      const order = new Order({
        user: req.user._id,
        items,
        totalPrice,
      });
  
      const savedOrder = await order.save();
      res.status(201).json(savedOrder);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error });
    }
  };

// @desc   Get logged-in user's orders
// @route  GET /api/orders
// @access Private (Authenticated Users)
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc   Get order details by ID
// @route  GET /api/orders/:id
// @access Private (Authenticated Users)
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc   Admin: Get all orders
// @route  GET /api/orders/all
// @access Private (Admin Only)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc   Admin: Update order status
// @route  PUT /api/orders/:id/status
// @access Private (Admin Only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
