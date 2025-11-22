const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    googleId:{
        type:String
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'],
        },

    confirmPassword: {
        type: String,
    },
    verified:{
        type:Boolean
    },
    status:{
        type:String
    },
    referralCode:{
        type:String,
        unique:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Function to generate a random unique referral code
const generateReferralCode = async () => {
    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase(); 

    const existingUser = await mongoose.model('users').findOne({ referralCode });
  
    if (existingUser) {
      return generateReferralCode();
    }
  
    return referralCode;
  };
  
  userSchema.pre('save', async function (next) {
    if (this.isNew) {
      const referralCode = await generateReferralCode();
      this.referralCode = referralCode;
    }
    })


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    this.confirmPassword = undefined;

    next();
});


module.exports = mongoose.model('users', userSchema);
