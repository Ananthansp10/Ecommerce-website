const mongoose=require('mongoose');

const googleAuthSchema=new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profilePic: { type: String },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports= mongoose.model('googleAuth',googleAuthSchema);

