const product=require('../databaseSchemas/productSchema')
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; 
module.exports={
   getProducts:()=>{
    return new Promise((resolve,reject)=>{
        product.find({visiblity:true}).limit(1).skip(3).limit(4).populate({path:'category',match:{isBlock:false}}).then((products)=>{
            const filteredProducts=products.filter((products)=>products.category!==null)
            resolve(filteredProducts)

        })
    })
   },

   getAllProducts:()=>{
    return new Promise((resolve,reject)=>{
        product.find({visiblity:true}).populate({path:'category',match:{isBlock:false}}).then((products)=>{
            const filteredProducts=products.filter((products)=>products.category!==null)
            resolve(filteredProducts)
        })
    })
   },

   productByCat:(cat)=>{
    return new Promise((resolve,reject)=>{
        product.find({category:cat,visiblity:true}).then((products)=>{
            resolve(products)
        })
    })
   },

   viewProductDetails:(proId)=>{
    return new Promise((resolve,reject)=>{
        product.findOne({_id:new ObjectId(proId)}).then((data)=>{
            resolve(data)
        })
    })
   },

   getColourVariant:(prodName)=>{
    return new Promise((resolve,reject)=>{
        product.find({name:prodName}).then((data)=>{
            resolve(data)
        })
    })
   }
}