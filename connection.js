const mongoose = require('mongoose');

async function connectToDB(url){
    return await mongoose.connect(url);
};

module.exports = {
    connectToDB
};