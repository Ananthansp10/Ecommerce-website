const mongoose=require('mongoose')
const {Schema}=mongoose

const couponUsers=new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'users',
        required:true
    },
    usedCoupons:[{
        type:String,
        required:true
    }]
})

const couponUsed=mongoose.model('couponUsers',couponUsers)

module.exports=couponUsed;