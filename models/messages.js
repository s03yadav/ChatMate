const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    chat : {
        type : Schema.Types.ObjectId,
        ref : "Chat",
        required : true,
    }, 
    sender : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    text : {
        type : String, 
        required : true, 
    },
    seen : {
        type : Boolean,
        required : true,
        default : false
    },
    edited : { 
        type : Boolean, 
        required : true,
        default : false,
    },
    readBy : [
        {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    ]
}, 
{timestamps : true});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;