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
        if(cat=="all"){
            product.find({visiblity:true}).populate({path:'category',match:{isBlock:false}}).then((products)=>{
                const filteredProducts=products.filter((products)=>products.category!==null)
                resolve(filteredProducts)
            })
        }else{
            product.find({catType:cat,visiblity:true}).populate({path:'category',match:{isBlock:false}}).then((products)=>{
                const filteredProducts=products.filter((products)=>products.category!==null)
                resolve(filteredProducts)
            })
        }
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
   },

   getSearchProducts:(item)=>{
    return new Promise((resolve,reject)=>{
        if(item=="Mobile" || item=="Mobiles" || item=="mobile" || item=="mobiles" || item=="Accessory" || item=="accessory" || item=="accessories" || item=="Accessories"){
            product.find({catType:{$regex:item,$options:"i"},visiblity:true}).then((data)=>{
                resolve(data)
            })
        }else{
        product.find({name:{$regex:item,$options:"i"},visiblity:true}).then((data)=>{
            resolve(data)
        })
    }
    })
   },

   sortProductByPrice:(pricerange)=>{
    return new Promise((resolve,reject)=>{
        if(pricerange=="low-to-high"){
          product.find({visiblity:true}).sort({price:1}).then((data)=>{
            resolve(data)
          })
        }
        else{
            product.find({visiblity:true}).sort({price:-1}).then((data)=>{
                resolve(data)
            })
        }
    })
   },

   sortSearchProducts:(pricerange,item)=>{
    return new Promise((resolve,reject)=>{
        if(item=="Mobile" || item=="Mobiles" || item=="mobile" || item=="mobiles" || item=="Accessory" || item=="accessory" || item=="accessories" || item=="Accessories"){
            if(pricerange=="low-to-high"){
                product.find({catType:{$regex:item,$options:"i"},visiblity:true}).sort({price:1}).then((data)=>{
                    resolve(data)
                })
            }else{
                product.find({catType:{$regex:item,$options:"i"},visiblity:true}).sort({price:-1}).then((data)=>{
                    resolve(data)
                })
            }
        }else{
            if(pricerange=="low-to-high"){
                product.find({name:{$regex:item,$options:"i"},visiblity:true}).sort({price:1}).then((data)=>{
                    resolve(data)
                })
            }else{
                product.find({name:{$regex:item,$options:"i"},visiblity:true}).sort({price:-1}).then((data)=>{
                    resolve(data)
                })
            } 
        }
    })
   },

   filterProducts:(cat,price)=>{
    return new Promise((resolve,reject)=>{
        if(price=="low-to-high"){
            product.find({catType:cat,visiblity:true}).sort({price:1}).then((data)=>{
                resolve(data)
            })
        }else{
            product.find({catType:cat,visiblity:true}).sort({price:-1}).then((data)=>{
                resolve(data)
            })
        }
    })
   }
}