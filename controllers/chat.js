const Team = require('../models/teams');
const Chat = require('../models/chats');

// Handle new team creation submit request
async function handleTeamCreation(req, res) {
    try {
        console.log(req.user);

        const {
            groupName,
            groupDescription,
            members
        } = req.body;

        let selectedMembers;

        // Ensure members is structured as an array
        if (Array.isArray(members)) {
            selectedMembers = members;
        } else {
            selectedMembers = [members];
        }

        // Add team creator to members list
        selectedMembers.push(req.user.id);

        console.log(`Members: ${selectedMembers}`);

        // Create accompanying team chat room
        const chat = await Chat.create({
            members: selectedMembers,
            type: "team"
        });

        // Set uploaded group image or fall back to default
        const groupImage = req.file
            ? req.file.path
            : "/user/default.jpg";

        // Create new team instance
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
};