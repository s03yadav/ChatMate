const bcrypt = require('bcrypt');
const User = require('../models/user');
const { setCookie } = require('../services/authentication');
const Chat = require('../models/chats');
const Team = require('../models/teams');

// Render the sign-up page
function handleSignUp(req, res) {
    return res.render('signup.ejs');
}

// Handle new user registration submission
async function handleSignupForm(req, res) {
    try {
        const { userName, fullName, mobile, designation, email, password } = req.body;
        console.log(`Extracted designation : ${designation}`);

        const bcryptPassword = await bcrypt.hash(password, 10);
        const pfp = req.file ? req.file.path : "/user/default.jpg";

        const user = await User.findOne({ email: email });

        if (user) {
            return res.redirect('/login');
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
        return res.redirect('/login');
    }
}

// Render the login page
function handleLogin(req, res) {
    return res.render('login');
}

// Handle user login authentication
async function handleLoginForm(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.redirect('/signup');
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

// Render home page with users, direct chats, and teams payload
async function handleHome(req, res) {
    const user = req?.user;

    if (!user) {
        return res.render('login');
    }

    // Fetch all users except the currently logged-in user
    const allUsers = await User.find({
        _id: { $ne: user.id }
    });

    // Fetch all chats where the logged-in user is a member
    const chats = await Chat.find({
        members: user.id
    });

    console.log("Chats of logged in user:", chats);

    // Pair each user with their existing direct chat object (if present)
    const userWithChat = allUsers.map(singleUser => {
        const chat = chats.find(chat => {
            if (chat.type !== "direct") {
                return false;
            }   
            // .some checks if at least one element in an array passes a test defined by a callback function
            return chat.members.some(member =>
                member.toString() === singleUser._id.toString()
            );
        });

        return {
            user: singleUser,
            chat: chat || null
        };
    });

    // Fetch team details matching user's chat membership
    const teams = await Team.find({
        chat: {
            $in: chats.map(chat => chat._id)
        }
    }).populate(
        "chat",
        "_id lastMessage lastMessagedAt"
    );

    console.log(`Teams : ${teams}`);
    console.log("Chat Items:", userWithChat);

    return res.render('home', {
        loggedUser: user,
        users: userWithChat,
        teams: teams
    });
}

module.exports = {
    handleSignUp,
    handleSignupForm,
    handleLogin,
    handleLoginForm,
    handleHome
};