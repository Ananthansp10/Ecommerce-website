const mongoose=require('mongoose');
const {Schema}=mongoose;

const orderSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    orderedProducts:[{
       productId:{
        type:Schema.Types.ObjectId,
        ref:'Product',
        required:true
       }, 
       name:{
        type:String,
        required:true
       },
       catType:{
        type:String,
        required:true
       },
       description:{
        type:String,
        required:true
       },
       quantity:{
        type:Number,
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
       orderStatus:{
        type:String,
        required:true
    },
    orderedDate:{
        type: Date,
        default: Date.now
    }
    }],

    address:{
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
    },
    
    totalPrice:{
        type:Number,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    }
})

const order=mongoose.model('order',orderSchema);

module.exports=order;