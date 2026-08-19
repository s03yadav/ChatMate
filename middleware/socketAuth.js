const cookie = require('cookie');
const { getCookie } = require('../services/authentication');

module.exports = (socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie || "";     
    //socket.handshake stores http header object from the browser while intialising io or handshake. 
    
    const cookies = cookieHeader ? cookie.parseCookie(cookieHeader) : {};
    // parseCookie functon from a lib cookie of nodeJS is used to parse cookie from a string
    // As cookie fetched from headers of socket object may look like : "tokenId=IsubnebS13cje"...
    // the function seprates the key and value from cookie.
    const tokenId = cookies.tokenId;
    console.log(`Token Id : ${tokenId}`);

    const token = cookies.tokenId;

    if(!token){
        return next(new Error("Authentication required!"));
    }
    
    const user = getCookie(token);
    // console.log(`Socket Authentication Shows User : ${user.userName}`)
    if (!user){
        return next(new Error("Invalid Token"));
    }

    socket.user = user;
    next();
}