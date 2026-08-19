require("dotenv").config();

const express = require('express');
const app = express();
const http = require('http');
const cookieParser = require('cookie-parser');
const { connectToDB } = require('./connection');
const path = require('path');
const userRouter = require('./routes/user');
const socketAuth = require('./middleware/socketAuth');
const chatSocket = require('./sockets/chatSocket');

const { Server } = require('socket.io'); // distructuring the Server function available in the library of socket.io, Lib : "socket.io": "^4.8.3"
const server = http.createServer(app); // this creates an HTTP server (This can basic request, response cycle)
const io = new Server(server); 
// This adds the instance returned for the script "const socket = io()" to the existing Http Server and 
// returns an socket.id for every connection 

chatSocket(io); // this module returns a call back function which takes io instance of object as argument

// Middlewares
app.use(express.static(path.resolve('public')));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
io.use(socketAuth); // This adds a middleware for the authentication part, where once a user 
// tries to connect to home and make a websocket connection via Socket.io server, 
// it should authencticate if the user is logged in or not, if not dont allow, and 
// no socket.id will be provided!

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use('/', userRouter); 


connectToDB(process.env.MONGO_DB_CONNECTION_URL).then(()=> {
    const PORT = 9000;
    server.listen(PORT, ()=> console.log(`Server listining on ${PORT}`));
    console.log(`Mongo DB connected Sucessfully!`);
}).catch((err)=> {
    console.error(err);
    console.log('Restart Needed');
})