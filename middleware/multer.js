const multer = require('multer');
const cloudinary = require('../services/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params : {
        folder : "team-chat-project",
        public_id : (req, res)=> {
            // console.log(req.body)
            return `${Date.now()}-${req.body.userName}`
        },
    },
});

const uploads = multer({
    storage : storage,
    fileFilter : function (req, file, cb){
        if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
            cb(null, true);
        } else {
            cb(`Invalid File Type! Please Upload png or jpeg format`, false);
        }
    },
});

module.exports = uploads;