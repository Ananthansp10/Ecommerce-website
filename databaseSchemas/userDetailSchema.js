const mongoose=require('mongoose');
const {Schema}=mongoose;

const userDetailSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    addressType:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    houseNumber:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
})

const userDetail=mongoose.model('userDetail',userDetailSchema)

module.exports=userDetail;