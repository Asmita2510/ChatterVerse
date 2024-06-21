const User = require('../models/user')
const sequelize = require('../utils/database')
const Message = require('../models/message')
const { Op } = require('sequelize');
const AWS = require('aws-sdk') //changes

exports.postAddMessage = (req, res, next) => {
    const groupId = req.query.groupId
    const userId = req.user.id
    const message = req.body.message
    Message.create({
        message: message,
        userId: userId,
        groupId: groupId,
        isText: true //change
    }).then(() => {
        res.send("Message sent succesfully")

    }).catch((err) => {
        res.send(err)
    })

};
// exports.downloadExpenses = async (req, res, next) => {
//     const expenses = await req.user.getExpenses()
//     console.log(expenses)
//     const stringifiedExpenses = JSON.stringify(expenses)
//     const userId = req.user.id
//     const fileName = Expense${ userId }/${new Date()}.txt
//     const fileUrl = await uploadToS3(stringifiedExpenses, fileName)
//     res.status(200).json({
//         fileUrl, success: true

//     })

// }

function uploadToS3(image, filename) { //in place od data write image
    console.log('data', image)
    const BUCKET_NAME = process.env.BUCKET_NAME
    const IAM_USER_KEY = process.env.IAM_USER_KEY
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        // Bucket:BUCKET_NAME
    })

    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: image,
        ACL: 'public-read',
        ContentType: "image/jpeg",
    }
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log("Something Went Wrong", err)
                reject(err)
            }
            else {
                console.log(s3response)
                resolve(s3response.Location)

            }
        })
    })
}


exports.postAddImage = async (req, res, next) => {
    console.log(req.file, 'this is the files')
    const groupId = req.query.groupId
    const userId = req.user.id
    console.log(req.file.filename, 'this is the original name')
    const filename = `chat-images/group${groupId}/user${userId}/${Date.now()}_${req.file.originalname}`

    //use this way when you have an s3 bucket
    // const imageUrl = await uploadToS3(req.file.buffer, filename)
    // console.log(imageUrl, 'this is the uploaded bucket image')
    Message.create({
        message: req.file.filename,
        userId: userId,
        groupId: groupId,
        isText: false //change
    }).then(() => {
        res.send("Message sent successfully")

    }).catch((err) => {
        res.send(err)
    })

};

//when we have s3 bucket
// exports.postAddImage = async (req, res, next) => {
//     console.log(req.file, 'this is the files')
//     const groupId = req.query.groupId
//     const userId = req.user.id
//     console.log(req.file.buffer, 'this is the original name')
//     const filename = `chat-images/group${groupId}/user${userId}/${Date.now()}_${req.file.originalname}`

//     const imageUrl = await uploadToS3(req.file.buffer, filename)
//     console.log(imageUrl, 'this is the uploaded bucket image')
//     Message.create({
//         message: imageUrl,
//         userId: userId,
//         groupId: groupId,
//         isText: false //change
//     }).then(() => {
//         res.send("Message sent successfully")

//     }).catch((err) => {
//         res.send(err)
//     })

// };


exports.getMessages = async (req, res, next) => {
    try {
        const lastMessageId = req.query.lastmsgId || -1;
        const messages = await Message.findAll({
            where: {
                id: { [Op.gt]: lastMessageId }
            },
            attributes: [
                'id',
                'message',
                'groupId',
                'createdAt',
                'isText',
                [sequelize.col('user.name'), 'name'], // Include user.name as 'name'
            ],
            include: [{
                model: User,
                attributes: [], // No need to specify attributes for User model
            }],
        });
        console.log(messages, "messssssaagesss")
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};