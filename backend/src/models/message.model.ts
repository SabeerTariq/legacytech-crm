import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.config';

// Message attributes interface
interface MessageAttributes {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Message creation attributes
interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'read' | 'readAt' | 'createdAt' | 'updatedAt'> {}

// Message model class
class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public content!: string;
  public read!: boolean;
  public readAt!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Message model
Message.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    receiverId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
  }
);

export default Message;
