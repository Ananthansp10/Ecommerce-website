const mongoose=require('mongoose');
const {Schema}=mongoose;

const orderSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    cartId:{
        type:Schema.Types.ObjectId,
        ref:'cart',
        required:true
    },
    addressId:{
        type:Schema.Types.ObjectId,
        ref:'address',
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    orderStatus:{
        type:String,
        required:true
    }
})

const order=mongoose.model('order',orderSchema);

module.exports=order;