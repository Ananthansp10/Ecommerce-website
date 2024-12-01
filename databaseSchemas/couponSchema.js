const mongoose=require('mongoose')
const {Schema}=mongoose

const couponSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    },
    discountValue:{
        type:Number,
        required:true
    },
    minimumPrice:{
        type:Number,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        required:true
    }
})

const coupon=mongoose.model('coupon',couponSchema);

module.exports=coupon;