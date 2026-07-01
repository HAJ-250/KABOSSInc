import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface ConversationAttributes {
  id?: number;
  _id?: string;
  subject?: string;
  participants?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  status?: 'active' | 'archived' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

class Conversation extends Model<ConversationAttributes> implements ConversationAttributes {
  declare id: number;
  declare subject?: string;
  declare participants?: string;
  declare lastMessage?: string;
  declare lastMessageAt?: Date;
  declare status: 'active' | 'archived' | 'completed';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    if (values.participants && typeof values.participants === 'string') {
      try { values.participants = JSON.parse(values.participants); } catch { /* keep as is */ }
    }
    return values;
  }
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    participants: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'completed'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'Conversation',
  }
);

export default Conversation;
