const jwt = require('jsonwebtoken')
const User = require('../models/user');

const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        // console.log(token)
        const userId = jwt.verify(token, process.env.TOKEN_SECRET)
        // console.log('userId >>>>>',userId.userId)
        User.findByPk(userId.userId).then((user) => {
            req.user = user;
            next()
        })
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false })
    }
}
module.exports = { authenticate }