const mongoose=require('mongoose')
const {Schema}=mongoose;

const addressSchema=new Schema({
    addressType:{
        type:String
    },
    addressLine1:{
        type:String
    },
    addressLine2:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    country:{
        type:String
    },
    pincode:{
        type:Number
    },
    landmark:{
        type:String
    }
})

const mainSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    address:[addressSchema]
})

module.exports=mongoose.model('address',mainSchema)