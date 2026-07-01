import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface PartnerAttributes {
  id?: number;
  _id?: string;
  name: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Partner extends Model<PartnerAttributes> implements PartnerAttributes {
  declare id: number;
  declare name: string;
  declare description?: string;
  declare logo?: string;
  declare isActive: boolean;
  declare sortOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }
}

Partner.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Partner',
  }
);

export default Partner;
