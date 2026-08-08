import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class BookingFile extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
BookingFile.init({
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
}, {
    sequelize,
    modelName: 'BookingFile',
});
export default BookingFile;
//# sourceMappingURL=BookingFile.js.map