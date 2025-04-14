import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  /**
   * Get all messages for the current user
   */
  public getMyMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await this.messageService.getUserMessages(req.user.id);
      
      return res.status(200).json({
        status: 'success',
        results: messages.length,
        data: {
          messages
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get conversation between current user and another user
   */
  public getConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const messages = await this.messageService.getConversation(req.user.id, Number(userId));
      
      return res.status(200).json({
        status: 'success',
        results: messages.length,
        data: {
          messages
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Send a message
   */
  public sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { receiverId, content } = req.body;
      
      if (!receiverId || !content) {
        return res.status(400).json({
          status: 'error',
          message: 'Receiver ID and content are required'
        });
      }
      
      const message = await this.messageService.sendMessage(req.user.id, Number(receiverId), content);
      
      return res.status(201).json({
        status: 'success',
        data: {
          message
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark message as read
   */
  public markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      const message = await this.messageService.markAsRead(Number(messageId), req.user.id);
      
      return res.status(200).json({
        status: 'success',
        data: {
          message
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get unread messages count
   */
  public getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.messageService.getUnreadCount(req.user.id);
      
      return res.status(200).json({
        status: 'success',
        data: {
          count
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a message
   */
  public deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      await this.messageService.deleteMessage(Number(messageId), req.user.id);
      
      return res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  };
}
