import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface QuoteAttributes {
  id?: number;
  _id?: string;
  userId: number;
  serviceId: number;
  serviceName: string;
  budget?: string;
  details: string;
  status: 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'declined';
  createdAt?: Date;
  updatedAt?: Date;
}

class Quote extends Model<QuoteAttributes> implements QuoteAttributes {
  declare id: number;
  declare userId: number;
  declare serviceId: number;
  declare serviceName: string;
  declare budget?: string;
  declare details: string;
  declare status: 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'declined';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }
}

Quote.init(
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
    budget: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewing', 'quoted', 'accepted', 'declined'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'Quote',
  }
);

export default Quote;

