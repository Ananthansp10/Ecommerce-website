const mongoose = require('mongoose');
const { Schema } = mongoose;

const otpschema = new Schema({
    email: {
        type: String
    },
    otp: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const OTP = mongoose.model('OTP', otpschema);

module.exports = OTP;
