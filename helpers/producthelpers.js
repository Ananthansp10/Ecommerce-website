const product=require('../databaseSchemas/productSchema');
const cartDetail=require('../databaseSchemas/cartSchema');
const variant=require('../databaseSchemas/variantSchema');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; 
module.exports={
   getProducts:()=>{
    return new Promise((resolve,reject)=>{
        product.find({visiblity:true}).sort({purchaseCount:-1}).limit(4).populate({path:'category',match:{isBlock:false}}).then((products)=>{
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
            console.log(data)
            resolve(data)
        })
    })
   },

   getColourVariant:(productId)=>{
    return new Promise((resolve,reject)=>{
        variant.findOne({productId:new ObjectId(productId)}).then((data)=>{
            if(data){
            resolve(data.variants)
            }else{
                resolve([])
            }
        })
    })
   },

   getSearchProducts: (item) => {
    return new Promise((resolve, reject) => {
        if (!item || typeof item !== "string" || /^[*]+$/.test(item)) {
            resolve([])
        }

        const validCategories = [
            "Mobile", "Mobiles", "mobile", "mobiles",
            "Accessory", "accessory", "accessories", "Accessories"
        ];

        const query = validCategories.includes(item)
            ? { catType: { $regex: item, $options: "i" }, visiblity: true }
            : { name: { $regex: item, $options: "i" }, visiblity: true }; 

        product.find(query)
            .then((data) => {
                console.log(data)
                if (data.length === 0) {
                     resolve([]);
                }
                resolve(data);
            })
            .catch((error) => {
                console.error("Error fetching search results:", error);
                reject(new Error("An error occurred while fetching search results."));
            });
        });
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
   },

   getCartLength:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        const cartUser=await cartDetail.findOne({userId:new ObjectId(userId)})
        if(cartUser){
            cartDetail.findOne({userId:new ObjectId(userId)}).then((data)=>{
                resolve(data.products.length)
            })
        }else{
            resolve()
        }
    })
   },

   getCartProducts:(userId)=>{
    return new Promise((resolve,reject)=>{
        cartDetail.aggregate([{
            $match:{
                userId:new ObjectId(userId),
            }
           },
            {
                $unwind:"$products"
            },
            {
                $lookup:{
                    from:"products",
                    localField:"products.productId",
                    foreignField:"_id",
                    as:"productDetails"
                }
            },
            {
                $unwind:"$productDetails"
            },
            {
                $project:{
                    productId:'$productDetails._id',
                    productName:'$productDetails.name',
                    category:'$productDetails.catType',
                    price:'$productDetails.price',
                    images:'$productDetails.images',
                    description:'$productDetails.description',
                    stock:'$productDetails.stock',
                    quantity:'$products.quantity',
                    offerPrice:'$productDetails.offerPrice',
                    couponCode:1,
                    couponDiscount:1,
                    couponStatus:1
                }
            }
        ]).then((data)=>{
            resolve(data)
        })
    })
   },

   viewVariant:(productId,variantId)=>{
    return new Promise(async(resolve,reject)=>{
       const findProduct=await variant.findOne({productId:new ObjectId(productId),'variants._id':new ObjectId(variantId)},{'variants.$':1})
       resolve(findProduct.variants)
    })
   }
}