import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Contact extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Contact.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'Contact',
});
export default Contact;
//# sourceMappingURL=Contact.js.map