import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Message extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Message.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    conversationId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    senderId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    senderName: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'Message',
});
export default Message;
//# sourceMappingURL=Message.js.map