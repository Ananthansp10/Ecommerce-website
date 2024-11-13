const mongoose=require('mongoose')
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
            price:{
                type:Number,
                required:true
            },
            image:[{
                type:String,
                required:true
            }]
        }
    ],
})

const cart=mongoose.model("cart",cartSchema)

module.exports=cart;