const mongoose=require('mongoose')
const {Schema}=mongoose

const couponSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    },
    discountValue:{
        type:Number,
        required:true
    },
    minimumPrice:{
        type:Number,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        required:true
    }
})

couponSchema.pre('find', async function (next) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    try {
        await this.model.updateMany(
            { endDate: { $lt: now }, isActive: true },
            { $set: { isActive: false } }
        );
    } catch (err) {
        console.error('Error updating expired coupons in pre-find:', err);
    }
    next();
});

const coupon=mongoose.model('coupon',couponSchema);

module.exports=coupon;