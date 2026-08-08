import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface MessageAttributes {
  id?: number;
  _id?: string;
  conversationId: number;
  senderId: number;
  senderName?: string;
  content: string;
  isRead?: boolean;
  deliveredAt?: Date | null;
  seenAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

class Message extends Model<MessageAttributes> implements MessageAttributes {
  declare id: number;
  declare conversationId: number;
  declare senderId: number;
  declare senderName?: string;
  declare content: string;
  declare isRead: boolean;
  declare deliveredAt?: Date | null;
  declare seenAt?: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    senderName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    seenAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Message',
  }
);

export default Message;
