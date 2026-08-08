import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Payment extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Payment.init({
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
    transactionId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    externalReference: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(12, 0),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING(8),
        allowNull: false,
        defaultValue: 'RWF',
    },
    phoneNumber: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.ENUM('MTN_MOMO', 'AIRTEL_MONEY', 'BANK', 'CASH'),
        allowNull: false,
        defaultValue: 'MTN_MOMO',
    },
    paymentStatus: {
        type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
    momoReferenceId: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    financialTransactionId: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    failureReason: {
        type: DataTypes.STRING(512),
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
});
export default Payment;
//# sourceMappingURL=Payment.js.map