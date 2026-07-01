import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class FAQ extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
FAQ.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    answer: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize,
    modelName: 'FAQ',
});
export default FAQ;
//# sourceMappingURL=FAQ.js.map