import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface ServiceAttributes {
  id?: number;
  _id?: string;
  title: string;
  category?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Service extends Model<ServiceAttributes> implements ServiceAttributes {
  declare id: number;
  declare title: string;
  declare category?: string;
  declare description?: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }
}

Service.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Service',
  }
);

export default Service;
