import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface AnnouncementAttributes {
  id?: number;
  _id?: string;
  title: string;
  content: string;
  type?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Announcement extends Model<AnnouncementAttributes> implements AnnouncementAttributes {
  declare id: number;
  declare title: string;
  declare content: string;
  declare type?: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }
}

Announcement.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Announcement',
  }
);

export default Announcement;
