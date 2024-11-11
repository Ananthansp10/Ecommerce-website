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
            // totalPrice:{
            //     type:Number,
            //     required:true,
            //     default:function(){
            //         return this.quantity*this.price;
            //     }
            // },
            image:[{
                type:String,
                required:true
            }]
        }
    ],
    // totalValue:{
    //     type:Number,
    //     required:true,
    //     default:0
    // },
})

// cartSchema.pre('save', function (next) {
//     let total = 0;
//     this.products.forEach(product => {
//         total += product.totalPrice;
//     });
//     this.totalValue = total;
//     next();
// });

const cart=mongoose.model("cart",cartSchema)

module.exports=cart;