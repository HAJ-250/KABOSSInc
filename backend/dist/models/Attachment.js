import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
class Attachment extends Model {
    toJSON() {
        const values = { ...this.get() };
        values._id = String(values.id);
        return values;
    }
}
Attachment.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    messageId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    conversationId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    senderId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    fileType: {
        type: DataTypes.ENUM('image', 'pdf', 'zip', 'document', 'other'),
        allowNull: false,
        defaultValue: 'other',
    },
    mimeType: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    storagePath: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    size: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize,
    modelName: 'Attachment',
    indexes: [
        { fields: ['messageId'] },
        { fields: ['conversationId'] },
        { fields: ['senderId'] },
    ],
});
export default Attachment;
//# sourceMappingURL=Attachment.js.map