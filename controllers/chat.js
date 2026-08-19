const Team = require('../models/teams');
const Chat = require('../models/chats');

async function handleTeamCreation(req, res) {
    try {
        console.log(req.user)
        const {
            groupName,
            groupDescription,
            members
        } = req.body;

        let selectedMembers;

        if (Array.isArray(members)) {
            selectedMembers = members;
        } else {
            selectedMembers = [members];
        }

        // Add creator
        selectedMembers.push(req.user.id);

        console.log(`Members: ${selectedMembers}`);

        const chat = await Chat.create({
            members: selectedMembers
        });

        const groupImage = req.file
            ? req.file.path
            : "/user/default.jpg";

        const team = await Team.create({
            name: groupName,
            description: groupDescription,
            groupPicture: groupImage,
            createdBy: req.user.id,
            admin: req.user.id,
            chat: chat._id
        });

        return res.redirect('/home');

    } catch (err) {

        console.error(`Error Creating Team : ${err}`);

        return res.redirect('/home');
    }
}

module.exports = {
    handleTeamCreation
}