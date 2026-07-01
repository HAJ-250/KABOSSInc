import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Announcement extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Announcement.init({
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
}, {
    sequelize,
    modelName: 'Announcement',
});
export default Announcement;
//# sourceMappingURL=Announcement.js.map