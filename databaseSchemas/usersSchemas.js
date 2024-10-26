const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

// Define the signup schema
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
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address',
        ],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        validate: {
            validator: function (password) {
              return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
            },
            message: 'Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character.'
          }
        },

    confirmPassword: {
        type: String,
        required: [true, 'Confirm Password is required'],
        validate: {
            // Custom validator to check if password and confirmPassword match
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords do not match',
        },
    },
    verified:{
        type:Boolean
    },
    status:{
        type:String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status:{
        type:String
    }
});

// Hashing the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // Hash the password with bcrypt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Remove confirmPassword from the database (it's only for validation)
    this.confirmPassword = undefined;

    next();
});

// Export the model
module.exports = mongoose.model('users', userSchema);
