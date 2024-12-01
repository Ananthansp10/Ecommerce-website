const mongoose=require('mongoose')
const {Schema}=mongoose

const wishListSchema=new Schema({
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
            name:{
                type:String,
                required:true
            },
            description:{
                type:String,
                required:true
            },
            colour:{
                type:String,
                required:true
            },
            price:{
                type:Number,
                required:true
            },
            images:[{
                type:String,
                required:true
            }],
            isOnWishList:{
                type:Boolean,
                default:true
            },
            offerPrice:{
                type:Number,
                default:false
            }
        }
    ]
})

const wishList=mongoose.model('wishlist',wishListSchema);

module.exports=wishList;