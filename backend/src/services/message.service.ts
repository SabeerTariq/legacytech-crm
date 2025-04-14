import { Message, User } from '../models';
import { ApiError } from '../middleware/error.middleware';
import { Op } from 'sequelize';

export class MessageService {
  /**
   * Get all messages for a user
   */
  public async getUserMessages(userId: number) {
    return await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get conversation between two users
   */
  public async getConversation(userId1: number, userId2: number) {
    return await Message.findAll({
      where: {
        [Op.or]: [
          {
            senderId: userId1,
            receiverId: userId2
          },
          {
            senderId: userId2,
            receiverId: userId1
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Send a message
   */
  public async sendMessage(senderId: number, receiverId: number, content: string) {
    // Validate receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      throw new ApiError(404, `User with ID ${receiverId} not found`);
    }

    return await Message.create({
      senderId,
      receiverId,
      content,
      read: false
    });
  }

  /**
   * Mark message as read
   */
  public async markAsRead(messageId: number, userId: number) {
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      throw new ApiError(404, `Message with ID ${messageId} not found`);
    }
    
    // Only the receiver can mark a message as read
    if (message.receiverId !== userId) {
      throw new ApiError(403, 'You are not authorized to mark this message as read');
    }
    
    return await message.update({
      read: true,
      readAt: new Date()
    });
  }

  /**
   * Get unread messages count
   */
  public async getUnreadCount(userId: number) {
    return await Message.count({
      where: {
        receiverId: userId,
        read: false
      }
    });
  }

  /**
   * Delete a message
   */
  public async deleteMessage(messageId: number, userId: number) {
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      throw new ApiError(404, `Message with ID ${messageId} not found`);
    }
    
    // Only the sender or receiver can delete a message
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ApiError(403, 'You are not authorized to delete this message');
    }
    
    await message.destroy();
    return true;
  }
}
