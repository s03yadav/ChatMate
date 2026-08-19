const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    members : [
        {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required : true
        }
    ],
    lastMessage : {
        type : String,
        default : null
    },
    lastMessagedAt : {
        type : Date,
        default : Date.now
    }
}, {timestamps : true});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;