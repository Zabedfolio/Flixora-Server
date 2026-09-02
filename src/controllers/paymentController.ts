import { Request, Response } from 'express';
import { Payment } from '../models/payment';

// POST: Save Payment Data
export const postPaymentData = async (req: Request, res: Response) => {
  try {
    const { userId, planId, planName, amount, paymentMethod } = req.body;

    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = new Payment({
      userId,
      planId,
      planName,
      amount,
      invoiceId,
      status: 'Paid',
      paymentMethod: paymentMethod || 'Card',
    });

    const savedPayment = await newPayment.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: savedPayment,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET: Fetch Payment History by User ID
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const history = await Payment.find({ userId }).populate('planId');

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
