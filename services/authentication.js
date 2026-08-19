const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

function setCookie(user){
    const payload = {
        id : user._id,
        userName : user.userName,
        email : user.email,
        status : user.status,
        profilePicture : user.profilePicture
    }
    return jwt.sign(payload, secret, {
        expiresIn : "90d"
    });
}

function getCookie(token){
    try{
        return jwt.verify(token, secret);
    } catch(err){
        console.error(err);
        return null;
    }
}

module.exports = {
    setCookie,
    getCookie
}