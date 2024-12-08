const mongoose=require('mongoose')
const {Schema}=mongoose

const walletSchema=new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"users",
        required:true,
    },
    balanceAmount:{
        type:Number,
        required:true,
        default:0
    },
    walletHistory:[{
        date:{
            type:Date,
            default:Date.now
        },
        description:{
            type:String,
            required:true
        },
        amountType:{
            type:String,
            required:true
        },
        amount:{
            type:Number,
            required:true
        }
    }]
})

const wallet=mongoose.model('wallet',walletSchema)

module.exports=wallet