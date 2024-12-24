const mongoose=require('mongoose');
const mongoURL='mongodb+srv://appu34870:butPLicStT5iptlP@cluster0.ky5sr.mongodb.net/ecommerce'

// mongoose.connect(mongoURL).then(()=>{
//     console.log("database connected")
// }).catch((err)=>{
//     console.log("database not connected",+err)
// })

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('Database connection error:', err);
    });
  

module.exports=mongoose;