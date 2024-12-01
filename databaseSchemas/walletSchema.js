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
    }
})

const wallet=mongoose.model('wallet',walletSchema)

module.exports=wallet