const mongoose=require('mongoose');
//const mongoURL='mongodb://127.0.0.1:27017/ecommerce';
const mongoURL='mongodb://13.61.0.254:27017/ecommerce';

mongoose.connect(mongoURL).then(()=>{
    console.log("database connected")
}).catch((err)=>{
    console.log("database not connected",+err)
})

module.exports=mongoose;