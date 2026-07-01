import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface TestimonialAttributes {
  id?: number;
  _id?: string;
  name: string;
  role?: string;
  content: string;
  rating?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Testimonial extends Model<TestimonialAttributes> implements TestimonialAttributes {
  declare id: number;
  declare name: string;
  declare role?: string;
  declare content: string;
  declare rating: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }
}

Testimonial.init(
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
    role: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Testimonial',
  }
);

export default Testimonial;
