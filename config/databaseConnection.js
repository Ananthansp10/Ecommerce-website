const mongoose=require('mongoose');
const mongoURL='mongodb+srv://Ananthan:ananthan123@cluster0.ky5sr.mongodb.net/ecommerce'

mongoose.connect(mongoURL).then(()=>{
    console.log("database connected")
}).catch((err)=>{
    console.log("database not connected",+err)
})
  

module.exports=mongoose;