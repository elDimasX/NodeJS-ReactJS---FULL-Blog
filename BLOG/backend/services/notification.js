
const Notification = require("../models/notification");

async function createNotification(data)
{
    try {

        // Não notifica a si mesmo
        if (data.recipient.toString() === data.sender.toString()) return;

        await Notification.create(data);

    } catch (err)
    {
        if (err.code !== 11000)
        {
            // duplicado → ignora; porque estamos usando (unique) aqui
            console.log(`Error in services/notifications.js: ${err}`)
        }

    }
}

module.exports = {
    createNotification
};
