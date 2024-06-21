const express = require('express');
// const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config();
const bodyParser = require('body-parser');
const sequelize = require('./utils/database')
var Sib = require('sib-api-v3-sdk');
// const sib = new Sib()
const fs = require('fs')
const path = require('path');
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require('@socket.io/admin-ui');
const websocketService = require('./services/websocket');


const User = require('./models/user')

const Message = require('./models/message')

const Group = require('./models/group')


const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
const cors = require('cors')
const cronService = require('./services/cron');
cronService.job.start();


app.use(morgan('combined', { stream: accessLogStream }))

app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST'],

    }
))

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        credentials: true
    }
});
console.log('connected')
io.on('connection', websocketService)

instrument(io, { auth: false })

const userRoutes = require('./routes/user')
const messageRoutes = require('./routes/message')
const groupRoutes = require('./routes/group')
const mainPageRouter = require('./routes/mainpage')

app.use(bodyParser.json({ extended: false }));

app.use(express.static('client'))
app.use(express.static('views'))


app.use(mainPageRouter)
app.use('/user', userRoutes);
app.use('/message', messageRoutes)
app.use('/group', groupRoutes)





Message.belongsTo(User)
User.hasMany(Message)
Group.belongsToMany(User, { through: 'GroupUser' });
User.belongsToMany(Group, { through: 'GroupUser' });
Message.belongsTo(Group)
Group.hasMany(Message)

// ForgotPassword.belongsTo(User)
// User.hasMany(ForgotPassword)
// Salary.belongsTo(User)
// User.hasMany(Salary)

sequelize.sync({
    // force: true  //these should not be done in production becoz we donot want to overwrite the table everytime we run
    // alter:true
})
httpServer.listen(3000)