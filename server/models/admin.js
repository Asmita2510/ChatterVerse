const Sequelize = require('sequelize')
const sequelize = require('../utils/database')
const Admin = sequelize.define('admins', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    groupId: {
        type: Sequelize.INTEGER,
    }
})


module.exports = Admin;