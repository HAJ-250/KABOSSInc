import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export type BookingFileType = 'pdf' | 'image' | 'zip' | 'other';

export interface BookingFileAttributes {
  id?: number;
  bookingId: number;
  userId: number;
  fileType: BookingFileType;
  fileName: string;
  mimeType: string;
  storagePath: string; // e.g. /uploads/booking-files/xxxx.pdf
  createdAt?: Date;
  updatedAt?: Date;
}

class BookingFile extends Model<BookingFileAttributes> implements BookingFileAttributes {
  declare id: number;
  declare bookingId: number;
  declare userId: number;
  declare fileType: BookingFileType;
  declare fileName: string;
  declare mimeType: string;
  declare storagePath: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() } as any;
    values._id = String(values.id);
    return values;
  }
}

BookingFile.init(
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
    fileType: {
      type: DataTypes.ENUM('pdf', 'image', 'zip', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    storagePath: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'BookingFile',
  }
);

export default BookingFile;

