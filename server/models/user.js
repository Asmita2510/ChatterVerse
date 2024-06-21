const Sequelize = require('sequelize')
const sequelize = require('../utils/database')
const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,

    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    ispremiumuser: {
        type: Sequelize.BOOLEAN,

    },
    isloggedIn: {
        type: Sequelize.BOOLEAN,

    },
  


}
    , {
        indexes: [
            {
                unique: true,
                fields: ['email','phone']
            }
        ]
    }

);


module.exports = User;