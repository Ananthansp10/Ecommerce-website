const mongoose = require('mongoose');
const {Schema}=mongoose

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required:true
  },
  description: {
    type: String,
    required:true
  },
  discountType: {
    type: String,
    required:true
  },
  discountValue: {
    type: String,
    required:true
  },
  minimumPrice:{
    type:Number,
    required:true
  },
  applicable: {
    type:String,
    required:true
  },
  image:{
    type:String,
    required:true
  },
  startDate: {
    type: Date,
    required:true
  },
  endDate: {
    type: Date,
    required:true
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isUsed:{
    type:Boolean,
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Offer', offerSchema);
