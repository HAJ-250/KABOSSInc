import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Quote extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Quote.init({
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
}, {
    sequelize,
    modelName: 'Quote',
});
export default Quote;
//# sourceMappingURL=Quote.js.map