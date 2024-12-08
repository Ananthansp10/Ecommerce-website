const mongoose=require('mongoose');
const coupon = require('./couponSchema');
const {Schema}=mongoose

const cartSchema=new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'users',
        required:true
    },
    products:[
        {
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            },
            description:{
                type:String,
                required:true
            },
            price:{
                type:Number,
                required:true
            },
            image:[{
                type:String,
                required:true
            }],
            offerPrice:{
                type:Number
            },
            offerDiscount:{
                type:Number
            },
        }
    ],
    couponCode:{
        type:String
    },
    couponDiscount:{
        type:Number
    },
    couponStatus:{
        type:Boolean,
        default:false
    }
})

const cart=mongoose.model("cart",cartSchema)

module.exports=cart;