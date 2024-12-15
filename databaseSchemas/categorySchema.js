const mongoose=require('mongoose')
const {Schema}=mongoose

const categorySchema=new Schema({
    name:{
        type:String,
        required:true
    },

    image:[{
        type:String,
        required:true
    }],

    visiblity:{
        type:Boolean
    },

    isBlock:{
        type:Boolean
    },
    purchaseCount:{
        type:Number,
        default:0
    }
})

const category=mongoose.model('category',categorySchema)

module.exports=category