import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export type NotificationType =
  | 'booking'
  | 'message'
  | 'booking_file'
  | 'status_update'
  | 'payment'
  | 'system';

export interface NotificationAttributes {
  id?: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  declare id: number;
  declare userId: number;
  declare type: NotificationType;
  declare title: string;
  declare body: string;
  declare isRead: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() } as any;
    values._id = String(values.id);
    return values;
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
type: {
      type: DataTypes.ENUM('booking', 'message', 'booking_file', 'status_update', 'payment', 'system'),
      allowNull: false,
      defaultValue: 'system',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
  }
);

export default Notification;

