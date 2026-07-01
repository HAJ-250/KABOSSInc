import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Service extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Service.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize,
    modelName: 'Service',
});
export default Service;
//# sourceMappingURL=Service.js.map