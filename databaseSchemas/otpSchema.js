const mongoose=require('mongoose')
const { Schema } = mongoose;

const otpschema=new Schema({
    email:{
        type:String
    },
    otp:{
        type:Number
    }
})

module.exports = mongoose.model('otp', otpschema);