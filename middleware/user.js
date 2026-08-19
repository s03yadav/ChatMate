const { getCookie } = require("../services/authentication");

async function handleSession (req,res, next){
    const tokenId = req?.cookies?.tokenId;
    const user = getCookie(tokenId);
    if (user){
        req.user = user;
        next()
    } else {
        console.log('Unable to fetch user via token Id in middleware')
        next();
    }
};

module.exports = {
    handleSession
}