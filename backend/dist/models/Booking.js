import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Booking extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Booking.init({
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
    details: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    date: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    time: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    amount: {
        type: DataTypes.DECIMAL(12, 0),
        allowNull: true,
    },
    amountCurrency: {
        type: DataTypes.STRING(8),
        allowNull: true,
        defaultValue: 'RWF',
    },
    paymentStatus: {
        type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'NO_PAYMENT'),
        allowNull: true,
        defaultValue: 'NO_PAYMENT',
    },
    status: {
        type: DataTypes.ENUM('pending', 'pending-payment', 'confirmed', 'approved', 'in-progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
}, {
    sequelize,
    modelName: 'Booking',
});
export default Booking;
//# sourceMappingURL=Booking.js.map