const bcrypt = require('bcrypt');
const User = require('../models/user');
const { setCookie } = require('../services/authentication');
const Chat = require('../models/chats');
const Team = require('../models/teams');

function handleSignUp(req, res) {
    return res.render('signup.ejs');
}

async function handleSignupForm(req, res) {
    try {
        const { userName, fullName, mobile, designation, email, password } = req.body;
        console.log(`Extracted designation : ${designation}`)
        const bcryptPassword = await bcrypt.hash(password, 10);
        const pfp = req.file ? req.file.path : "/user/default.jpg"
        const user = await User.findOne({
            email: email
        });
        if (user) {
            return res.redirect('/login')
        } else {
            const createdUser = await User.create({
                userName: userName,
                fullName: fullName,
                mobile: mobile,
                email: email,
                desgination: designation,
                password: bcryptPassword,
                profilePicture: pfp
            });
            if (createdUser) {
                return res.redirect('/login');
            }
        }
    } catch (err) {
        console.error(err);
        return redirect(`/login`);
    }
};

function handleLogin(req, res) {
    return res.render('login')
};

async function handleLoginForm(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.redirect('/signup')
    } else {
        const pass = await bcrypt.compare(password, user.password);
        if (pass) {
            const token = setCookie(user);
            res.cookie('tokenId', token, {
                maxAge: 90 * 24 * 60 * 60 * 1000,
            });
            return res.redirect('/home');
        } else {
            console.log(`error login`);
            return res.render('/login');
        }
    }
}

async function handleHome(req, res) {

    const user = req?.user;

    if (!user) {
        return res.render('login');
    }

    const allUsers = await User.find({
        _id: { $ne: user.id }
    });

    const chats = await Chat.find({
        members: user.id
    });

    console.log("Chats of logged in user:", chats);

    const userWithChat = allUsers.map(singleUser => {

        const chat = chats.find(chat => {

            // Ignore group/team chats
            if (chat.members.length !== 2) {
                return false;
            }

            // Find the one-to-one chat with this user
            return chat.members.some(member =>
                member.toString() === singleUser._id.toString()
            );
        });

        return {
            user: singleUser,
            chat: chat || null
        };
    });

    const teams = await Team.find({
        chat : {
            $in : chats.map(chat=> chat._id)
        }
    });

    console.log(`Teams : ${teams}`);
    console.log("Chat Items:", userWithChat);

    return res.render('home', {
        loggedUser: user,
        users: userWithChat,
        teams : teams
    });
}

module.exports = {
    handleSignUp,
    handleSignupForm,
    handleLogin,
    handleLoginForm,
    handleHome
}