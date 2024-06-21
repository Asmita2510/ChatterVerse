const Sequelize = require('sequelize')
const sequelize = require('../utils/database')
const Message = sequelize.define('messages', {
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
    }
})


module.exports = Message;