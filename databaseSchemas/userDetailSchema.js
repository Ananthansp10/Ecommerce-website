const mongoose=require('mongoose');
const {Schema}=mongoose;

const userDetailSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    image:{
        type:String,
    },
    gender:{
        type:String,
        required:true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
})

const userDetail=mongoose.model('userDetail',userDetailSchema)

module.exports=userDetail;