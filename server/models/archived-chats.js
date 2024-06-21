const Sequelize = require('sequelize')
const sequelize = require('../utils/database')
const ArchivedChat = sequelize.define('archived_chats', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isText: {
        type: Sequelize.STRING,
    },
    userId: {
        type: Sequelize.INTEGER,
    },
    groupId: {
        type: Sequelize.INTEGER,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    timestamps: false
})


module.exports = ArchivedChat;
