import { Request, Response } from 'express';
import ContactMessage from '../models/contactMessage.model';

// POST /api/contact/messages
export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ success: false, message: 'Please provide name, email, subject, and message.' });
      return;
    }

    const contactMsg = await ContactMessage.create({
      name,
      email,
      subject,
      category: category || 'General Inquiry',
      message,
      status: 'unread',
    });

    res.status(201).json({
      success: true,
      message: 'Contact message received successfully!',
      data: contactMsg,
    });
  } catch (error: any) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ success: false, message: 'Server error submitting message.', error: error.message });
  }
};

// GET /api/contact/messages
export const getAllContactMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, category } = req.query;
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { subject: searchRegex }, { message: searchRegex }];
    }

    const messages = await ContactMessage.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ success: false, message: 'Server error fetching messages.', error: error.message });
  }
};

// PATCH /api/contact/messages/:id
export const updateContactMessageStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['unread', 'read', 'replied', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status provided.' });
      return;
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Contact message not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Message status updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating message status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status.', error: error.message });
  }
};

// DELETE /api/contact/messages/:id
export const deleteContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await ContactMessage.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Contact message not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Server error deleting message.', error: error.message });
  }
};
