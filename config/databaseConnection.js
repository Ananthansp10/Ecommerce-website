const mongoose=require('mongoose');
const mongoURL='mongodb://13.61.0.254:27017/ecommerce';
//const mongoURL='mongodb://13.61.0.254:27017/ecommerce';
//const mongoURL='mongodb://127.0.0.1:27017/ecommerce'

// mongoose.connect(mongoURL).then(()=>{
//     console.log("database connected")
// }).catch((err)=>{
//     console.log("database not connected",+err)
// })

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000 
  }).then(() => {
    console.log("Database connected successfully");
  }).catch((err) => {
    console.log("Database connection failed", err);
  });

module.exports=mongoose;