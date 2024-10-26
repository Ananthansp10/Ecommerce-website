const mongoose=require('mongoose')
const { Schema } = mongoose;

const adminSchema=new Schema({
    email:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:[true,"password required"],
        minlength: [6, 'Password must be at least 6 characters long'],
        validate: {
            validator: function (password) {
              return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
            },
            message: 'Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character.'
          }
        },
})

const admin=mongoose.model('admin',adminSchema)

module.exports=admin;