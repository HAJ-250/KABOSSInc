import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Notification extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Notification.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('booking', 'message', 'booking_file', 'status_update', 'payment', 'system'),
        allowNull: false,
        defaultValue: 'system',
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'Notification',
});
export default Notification;
//# sourceMappingURL=Notification.js.map