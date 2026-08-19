const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    name : {
        type : "String",
        required : true, 
    },
    description : {
        type : "String",
        default : null
    }, 
    groupPicture : {
        type : "String",
        default : '/user/default.jpg'
    },
    createdBy : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    admin : [
        {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        }
    ],
    chat : {
        type : Schema.Types.ObjectId,
        ref : "Chat"
    }
},{timestamps : true});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;