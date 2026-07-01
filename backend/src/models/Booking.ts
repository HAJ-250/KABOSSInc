import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';
import Service from './Service.js';

export interface BookingAttributes {
  id?: number;
  _id?: string;
  userId: number;
  serviceId: number;
  serviceName: string;
  details: string;
  date: string;
  time?: string;
  location?: string;
  status: 'pending' | 'approved' | 'in-progress' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

class Booking extends Model<BookingAttributes> implements BookingAttributes {
  declare id: number;
  declare userId: number;
  declare serviceId: number;
  declare serviceName: string;
  declare details: string;
  declare date: string;
  declare time?: string;
  declare location?: string;
  declare status: 'pending' | 'approved' | 'in-progress' | 'completed' | 'cancelled';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }
}

Booking.init(
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
    serviceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    serviceName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'in-progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'Booking',
  }
);

export default Booking;
