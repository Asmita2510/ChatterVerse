const { CronJob } = require('cron');
const sequelize = require('../utils/database')
const { Op } = require('sequelize');


const Message = require('../models/message')

// const ChatHistory = require('../models/chat-history');
const ArchivedChat = require('../models/archived-chats')

exports.job = new CronJob(
    '0 0 * * *',
    function () {
        archiveOldRecords();
    },
    null,
    false,
    'Asia/Kolkata'
);

async function archiveOldRecords() {
    try {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        // Find records to archive
        const recordsToArchive = await Message.findAll({
            where: {
                createdAt: {
                    [Op.lt]: tenDaysAgo,
                },
            },
        });

        // Archive records
        await Promise.all(
            recordsToArchive.map(async (record) => {
                await ArchivedChat.create({
                    id: record.id,
                    message: record.message,
                    createdAt: record.createdAt,
                    isText: record.isText,
                    userId: record.userId,
                    groupId: record.groupId
                });
                await record.destroy();
            })
        );
        console.log('Old records archived successfully.');
    } catch (error) {
        console.error('Error archiving old records:', error);
    }
}