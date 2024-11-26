const mongoose = require('mongoose');
const{Schema}=mongoose;
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
            required: true // Image URL or public ID from Cloudinary
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
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
