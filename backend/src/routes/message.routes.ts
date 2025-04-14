import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
const messageController = new MessageController();

// All message routes are protected
router.use(protect);

// GET all messages for the current user
router.get('/', messageController.getMyMessages);

// GET conversation between current user and another user
router.get('/conversation/:userId', messageController.getConversation);

// GET unread messages count
router.get('/unread', messageController.getUnreadCount);

// SEND a message
router.post('/', messageController.sendMessage);

// MARK message as read
router.patch('/:messageId/read', messageController.markAsRead);

// DELETE a message
router.delete('/:messageId', messageController.deleteMessage);

export default router;
