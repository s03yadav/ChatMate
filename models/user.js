const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName : {
        type : String,
        required : true,
        unique : true
    },
    fullName : {
        type : String,
        required : true
    },
    mobile : {
        type : Number,
        required : true,
        unique : true
    },
    email : {
        type : String,
        default : null
    },
    status : {
        type : String,
        enum : ["Online", "Offline", "Away"],
        default : "Offline"
    },
    lastSeen : {
        type : Date, 
        default : Date.now
    },
    password : {
        type : String,
        required : true
    },
    profilePicture : {
        type : String,
        default : '/user/default.jpg'
    },
    desgination : {
        type : String,
        default : null
    }
}, {timestamps : true});

const User = mongoose.model('User', userSchema);

module.exports = User;