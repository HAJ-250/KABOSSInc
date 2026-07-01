import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface SettingsAttributes {
  id?: number;
  _id?: string;
  key: string;
  value: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Settings extends Model<SettingsAttributes> implements SettingsAttributes {
  declare id: number;
  declare key: string;
  declare value: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }
}

Settings.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Settings',
  }
);

export default Settings;
