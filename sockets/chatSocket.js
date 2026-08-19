const Chat = require('../models/chats');
const Message = require('../models/messages');
const User = require('../models/user');
const Team = require('../models/teams');

module.exports = function (io) {
    // Event listener, io.on act as an even listener, whenever the connection is established via Socket.io
    // event listener returns a call back function which takes socket object as an argument
    // connection is predefined server side even in socket. so does'nt need to 
    // define any client side event for it. 
    io.on("connection", async (socket) => {
        console.log(`A user connected : ${socket.id}`);
        console.log(socket.user);

        // finds user on its id who is currently connected to the Socket server and user connected is done
        // by the middleware (it fetches user object stored as payload in JWT token). socket.user = user.
        await User.findByIdAndUpdate(socket.user.id, {
            status: "Online"
        });

        console.log(`${socket.user.userName} is online`);

        //Open chat event
        socket.on("open-chat", async ({ receiverId }) => {
            // creating var senderId and assigning it the value of logged in user
            const senderId = socket.user.id;

            // checking the senderId and receiverId has a existing chat 
            let chat = await Chat.findOne({
                members: {
                    $all: [senderId, receiverId],
                    $size: 2
                }
            });

            // if no exisiting chat found of both users, create a new one
            if (!chat) {

                chat = await Chat.create({
                    members: [senderId, receiverId]
                });

                console.log("New chat created");

            } else {

                console.log("Existing chat found");

            }

            // create a new socket io room on basis of chat._id if new Chat created
            // else join the exisitng room based on chat._id of found
            socket.join(chat._id.toString());

            console.log(`${socket.user.userName} joined room ${chat._id}`);

            // ==========================
            // LOAD OLD MESSAGES
            // ==========================

            const messages = await Message.find({
                chat: chat._id
            })
                .populate("sender", "_id userName profilePicture")
                //populate will populate sender ObjectId with it data, id, userName and profilePicture.
                .sort({ createdAt: 1 });
            // sort will the arrange the upcoming msgs of chat room in ascending order.

            console.log("Messages Found :", messages.length);

            const formattedMessages = messages.map(message => ({
                _id: message._id,
                chat: message.chat,
                text: message.text,
                seen: message.seen,
                edited: message.edited,
                createdAt: message.createdAt,

                sender: {
                    id: message.sender._id.toString(),
                    userName: message.sender.userName,
                    profilePicture: message.sender.profilePicture
                }
            }));

            // .select is field filtering in mongoose, it will only select fullName, userName, profilePicture and status
            const receiver = await User.findById(receiverId).select(
                "fullName userName profilePicture desgination email status"
            );

            socket.emit("chat-opened", {
                chatId: chat._id,
                receiver,
                messages: formattedMessages
            });

        });

        socket.on("send-message", async ({ chatId, text }) => {
            try {
                const senderId = socket.user.id;
                console.log("chatId:", chatId);
                console.log("text:", text);
                console.log("sender:", senderId);
                const message = await Message.create({
                    chat: chatId,
                    sender: senderId,
                    text
                });

                // fetches last send message with whole details of sender : id, userName and pfp
                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "_id userName profilePicture");

                // Populating the chat with last message is useful for side bar for chat history
                await Chat.findByIdAndUpdate(chatId, {
                    lastMessage: text,
                    lastMessagedAt: Date.now()
                });

                io.to(chatId).emit("receive-message", {
                    _id: populatedMessage._id,
                    chat: populatedMessage.chat,
                    text: populatedMessage.text,
                    seen: populatedMessage.seen,
                    edited: populatedMessage.edited,
                    createdAt: populatedMessage.createdAt,

                    sender: {
                        id: populatedMessage.sender._id.toString(),
                        userName: populatedMessage.sender.userName,
                        profilePicture: populatedMessage.sender.profilePicture
                    }
                });
            } catch (err) {
                console.error(err);
            }
        });

        socket.on('open-teamChat', async ({ teamId }) => {
            try {
                const team = await Team.findById(teamId);
                if (team) {
                    const chatId = team.chat;
                    console.log(`Chat Id found from Selected Team : ${chatId}`);

                    const chat = await Chat.findById(chatId)
                        .populate('members', "_id userName fullName profilePicture status");

                    if (!chat) {
                        console.log(`No chat found`)
                        return;
                    }

                    socket.join(chat._id.toString());
                    console.log(`${socket.user.userName} joined team room : ${chat._id}`);

                    // Load old messages
                    const messages = await Message.find({
                        chat: chat._id
                    })
                        .populate('sender', "userName fullName profilePicture")
                        .sort({ createdAt: 1 });

                    console.log(`Team Messages found : ${messages.length}`)

                    socket.emit('team-chat-opened', {
                        team: {
                            _id: team._id,
                            name: team.name,
                            groupPicture: team.groupPicture
                        },
                        chat: {
                            _id: chat._id
                        },
                        members: chat.members,
                        messages: messages
                    });
                } else {
                    console.log(`Team Not Found`)
                    return;
                }
            } catch (err) {
                console.error(`Error Listining open-teamChat event : ${err}`);
            }
        });

        socket.on("send-team-message", async ({ chatId, text }) => {

            // verify user belongs to chat

            // create Message

            const message = await Message.create({
                chat: chatId,
                sender: socket.user.id,
                text: text
            });

            // populate sender
            await message.populate(
                "sender",
                "userName fullName profilePicture"
            );

            // send to everyone in team room
            io.to(chatId.toString()).emit(
                "receive-team-message",
                message
            );

        });

        // Disconnect Event Listener
        socket.on('disconnect', async () => {
            console.log(`User disconnected : ${socket.id}`);
            await User.findByIdAndUpdate(socket.user.id, {
                status: "Offline",
                lastSeen: new Date()
            });
            console.log(`${socket.user.userName} is Offline`);
        });
    });

}
