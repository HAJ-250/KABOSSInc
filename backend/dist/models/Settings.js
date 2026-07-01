import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Settings extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Settings.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Settings',
});
export default Settings;
//# sourceMappingURL=Settings.js.map