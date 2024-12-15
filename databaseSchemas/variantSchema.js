const mongoose=require('mongoose');
const {Schema}=mongoose


const variantSchema=new Schema({
    productId:{
        type:mongoose.Types.ObjectId,
        ref:'Product',
        required:true
    },
    variants:[{
        name:{
            type:String,
            required:true
        },
        catType: {
            type: String,
            required: true,
        },
    
        category: {
            type: Schema.Types.ObjectId,
            ref: 'category',
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0
        },
        colour: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        images: [
            {
                type: String,
                required: true
            }
        ],
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        visiblity:{
            type:Boolean
        },
        storage:{
            type:String,
        },
        offerPrice:{
            type:Number
        }

    }]
})

const variant=mongoose.model('variant',variantSchema)

module.exports=variant