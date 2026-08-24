const Chat = require('../models/chats');
const Message = require('../models/messages');
const User = require('../models/user');
const Team = require('../models/teams');

module.exports = function (io) {
    io.on("connection", async (socket) => {
        console.log(`A user connected : ${socket.id}`);

        const userRoom = `user:${socket.user.id}`;
        socket.join(userRoom);
        console.log(`${socket.user.userName} joined personal room ${userRoom}`);

        // Update user status to Online
        await User.findByIdAndUpdate(socket.user.id, {
            status: "Online"
        });
        console.log(`${socket.user.userName} is online`);

        // ==========================================
        // Direct Chat Events
        // ==========================================

        socket.on("open-chat", async ({ receiverId }) => {
            try {
                const senderId = socket.user.id;

                // Check for existing direct chat
                let chat = await Chat.findOne({
                    type: "direct",
                    members: {
                        $all: [senderId, receiverId],
                        $size: 2
                    }
                });

                // Create new chat if non-existent
                if (!chat) {
                    chat = await Chat.create({
                        members: [senderId, receiverId],
                        type: "direct"
                    });
                    console.log("New chat created");
                } else {
                    console.log("Existing chat found");
                }

                socket.join(chat._id.toString());

                // Mark received messages as seen and read
                await Message.updateMany(
                    {
                        sender: receiverId,
                        chat: chat._id,
                        seen: false
                    },
                    {
                        $set: { seen: true },
                        $addToSet: { readBy: senderId } //addToSet adds changes to existing obj
                    }
                );

                // Fetch message history
                const messages = await Message.find({ chat: chat._id })
                    .populate("sender", "_id userName profilePicture")
                    .sort({ createdAt: 1 });

                console.log(`${socket.user.userName} joined room ${chat._id}`);
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

                const receiver = await User.findById(receiverId).select(
                    "fullName userName profilePicture desgination email status"
                );

                socket.emit("chat-opened", {
                    chatId: chat._id,
                    receiver,
                    messages: formattedMessages
                });
            } catch (err) {
                console.error("Error opening chat:", err);
            }
        });

        socket.on("send-message", async ({ chatId, text }) => {
            try {
                const senderId = socket.user.id;

                // Verify chat and membership
                const chat = await Chat.findOne({
                    _id: chatId,
                    type: "direct",
                    members: senderId
                });

                if (!chat) {
                    console.log("Invalid chat or user not part of chat");
                    return;
                }

                const receiverId = chat.members.find(
                    member => member.toString() !== senderId.toString()
                );
                if (!receiverId) return;

                // Create message
                const message = await Message.create({
                    chat: chatId,
                    sender: senderId,
                    text
                });

                const populateMessage = await Message.findById(message._id).populate(
                    "sender",
                    "_id userName profilePicture"
                );

                // Update sidebar preview
                await Chat.findByIdAndUpdate(chatId, {
                    lastMessage: text,
                    lastMessagedAt: Date.now()
                });

                const messageData = {
                    _id: populateMessage._id,
                    chatId: chatId,
                    text: populateMessage.text,
                    seen: populateMessage.seen,
                    edited: populateMessage.edited,
                    createdAt: populateMessage.createdAt,
                    sender: {
                        id: populateMessage.sender._id.toString(),
                        userName: populateMessage.sender.userName,
                        profilePicture: populateMessage.sender.profilePicture
                    }
                };

                // Emit to sender and receiver
                socket.emit("receive-message", messageData);
                io.to(`user:${receiverId.toString()}`).emit("receive-message", messageData);
            } catch (err) {
                console.error("Error sending message:", err);
            }
        });

        // ==========================================
        // Team Chat Events
        // ==========================================

        socket.on("open-teamChat", async ({ teamId }) => {
            try {
                const team = await Team.findById(teamId);
                if (!team) {
                    console.log("Team Not Found");
                    return;
                }

                const chatId = team.chat;
                console.log(`Chat Id found from Selected Team : ${chatId}`);

                const chat = await Chat.findById(chatId).populate(
                    "members",
                    "_id userName fullName profilePicture status"
                );

                if (!chat) {
                    console.log("No chat found");
                    return;
                }

                // Update read status for team messages
                await Message.updateMany(
                    {
                        chat: chat._id,
                        sender: { $ne: socket.user.id },
                        readBy: { $ne: socket.user.id }
                    },
                    {
                        $addToSet: { readBy: socket.user.id }
                    }
                );

                socket.join(chat._id.toString());
                console.log(`${socket.user.userName} joined team room : ${chat._id}`);

                // Load old messages
                const messages = await Message.find({ chat: chat._id })
                    .populate("sender", "userName fullName profilePicture")
                    .sort({ createdAt: 1 });

                console.log(`Team Messages found : ${messages.length}`);

                socket.emit("team-chat-opened", {
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
            } catch (err) {
                console.error(`Error Listining open-teamChat event : ${err}`);
            }
        });

        socket.on("send-team-message", async ({ chatId, text }) => {
            try {
                // Verify chat and membership
                const chat = await Chat.findOne({
                    _id: chatId,
                    type: "team",
                    members: socket.user.id
                });

                if (!chat) {
                    console.log("Invalid team chat or user not a member");
                    return;
                }

                // Create message
                const message = await Message.create({
                    chat: chatId,
                    sender: socket.user.id,
                    text
                });

                // Update chat preview
                await Chat.findByIdAndUpdate(chatId, {
                    lastMessage: text,
                    lastMessagedAt: Date.now()
                });

                // Populate sender
                await message.populate("sender", "userName fullName profilePicture");

                const messageData = {
                    _id: message._id,
                    chatId: chatId,
                    text: message.text,
                    createdAt: message.createdAt,
                    sender: {
                        id: message.sender._id.toString(),
                        userName: message.sender.userName,
                        fullName: message.sender.fullName,
                        profilePicture: message.sender.profilePicture
                    },
                    readBy: message.readBy
                };

                // Deliver to all team members
                chat.members.forEach(memberId => {
                    io.to(`user:${memberId.toString()}`).emit("receive-team-message", messageData);
                });
            } catch (err) {
                console.error("Error sending team message:", err);
            }
        });

        // ==========================================
        // Disconnect Event
        // ==========================================

        socket.on("disconnect", async () => {
            console.log(`User disconnected : ${socket.id}`);
            await User.findByIdAndUpdate(socket.user.id, {
                status: "Offline",
                lastSeen: new Date()
            });
            console.log(`${socket.user.userName} is Offline`);
        });
    });
};