import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export type AttachmentType = 'image' | 'pdf' | 'zip' | 'document' | 'other';

export interface AttachmentAttributes {
  id?: number;
  _id?: string;
  messageId: number;
  conversationId: number;
  senderId: number;
  fileName: string;
  fileType: AttachmentType;
  mimeType: string;
  storagePath: string; // relative path e.g. chat/<filename>
  size: number; // bytes
  createdAt?: Date;
  updatedAt?: Date;
}

class Attachment extends Model<AttachmentAttributes> implements AttachmentAttributes {
  declare id: number;
  declare messageId: number;
  declare conversationId: number;
  declare senderId: number;
  declare fileName: string;
  declare fileType: AttachmentType;
  declare mimeType: string;
  declare storagePath: string;
  declare size: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() } as any;
    values._id = String(values.id);
    return values;
  }
}

Attachment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    conversationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileType: {
      type: DataTypes.ENUM('image', 'pdf', 'zip', 'document', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    mimeType: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    storagePath: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Attachment',
    indexes: [
      { fields: ['messageId'] },
      { fields: ['conversationId'] },
      { fields: ['senderId'] },
    ],
  }
);

export default Attachment;

