import { Router } from 'express';
import {
  submitContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../controllers/contact.controller';

const contactRouter = Router();

contactRouter.post('/contact/messages', submitContactMessage);
contactRouter.post('/contact', submitContactMessage); // alias
contactRouter.get('/contact/messages', getAllContactMessages);
contactRouter.patch('/contact/messages/:id', updateContactMessageStatus);
contactRouter.delete('/contact/messages/:id', deleteContactMessage);

export default contactRouter;
