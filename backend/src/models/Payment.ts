import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type PaymentMethod = 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK' | 'CASH';

export interface PaymentAttributes {
  id?: number;
  _id?: string;
  bookingId: number;
  userId: number;
  transactionId: string; // generated reference stored in DB (X-Reference-Id)
  externalReference: string; // our own reference
  amount: number;
  currency: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  momoReferenceId?: string; // MTN X-Reference-Id
  financialTransactionId?: string; // MTN financial transaction id
  failureReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Payment extends Model<PaymentAttributes> implements PaymentAttributes {
  declare id: number;
  declare bookingId: number;
  declare userId: number;
  declare transactionId: string;
  declare externalReference: string;
  declare amount: number;
  declare currency: string;
  declare phoneNumber: string;
  declare paymentMethod: PaymentMethod;
  declare paymentStatus: PaymentStatus;
  declare momoReferenceId?: string;
  declare financialTransactionId?: string;
  declare failureReason?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() } as any;
    values._id = String(values.id);
    return values;
  }
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    externalReference: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: 'RWF',
    },
    phoneNumber: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('MTN_MOMO', 'AIRTEL_MONEY', 'BANK', 'CASH'),
      allowNull: false,
      defaultValue: 'MTN_MOMO',
    },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    momoReferenceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    financialTransactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
  }
);

export default Payment;
