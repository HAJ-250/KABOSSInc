import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface UserAttributes {
  id?: number;
  _id?: string;
  email?: string;
  username?: string;
  password: string;
  displayName: string;
  role: 'customer' | 'admin';
  phone?: string;
  profilePictureUrl?: string;
  emailVerified?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  declare id: number;
  declare email?: string;
  declare username?: string;
  declare password: string;
  declare displayName: string;
  declare role: 'customer' | 'admin';
  declare phone?: string;
  declare profilePictureUrl?: string;
  declare emailVerified: boolean;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('customer', 'admin'),
      defaultValue: 'customer',
    },
phone: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    profilePictureUrl: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
  }
);

export default User;
