const product=require('../databaseSchemas/productSchema');
const Admin=require('../databaseSchemas/adminSchema');
const user=require('../databaseSchemas/usersSchemas');
const category=require('../databaseSchemas/categorySchema');
const googleAuth=require('../databaseSchemas/googleAuthSchemas');
const orderDetail=require('../databaseSchemas/orderSchema');
const couponData=require('../databaseSchemas/couponSchema');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; 
module.exports={
    adminLogin:(data)=>{
       return new Promise(async(resolve,reject)=>{
        const admin=await Admin.collection.findOne({email:data.email,password:data.password})
        if(admin){
            resolve({status:true})
        }
        else{
            resolve({status:false})
        }
       })
    },

    addProduct:(data)=>{
        return new Promise((resolve,reject)=>{
            product.collection.insertOne(data).then((data)=>{
                if(data){
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            })
        })
    },

    getProducts:()=>{
        return new Promise((resolve,reject)=>{
            product.find({visiblity:true}).then((products)=>{
                resolve(products)
            })
        })
    },

    findProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            product.find({_id:new ObjectId(prodId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    editProduct:(proId,data,images)=>{
        if(images.length==4){
            const editproduct={
                name:data.name,
                catType:data.catType,
                price:data.price,
                stock:data.stock,
                colour:data.colour,
                description:data.description,
                images:images,
                storage:data.storage
            }
            return new Promise((resolve,reject)=>{
                product.updateOne({_id:new ObjectId(proId)},{$set:editproduct}).then((data)=>{
                    if(data.acknowledged){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
            })
        }else{
            const editproduct={
                name:data.name,
                category:data.category,
                price:data.price,
                stock:data.stock,
                colour:data.colour,
                description:data.description,
                storage:data.storage
            }
        return new Promise((resolve,reject)=>{
            product.updateOne({_id:new ObjectId(proId)},{$set:editproduct}).then((data)=>{
                if(data.acknowledged){
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            })
        })
       }
    },

    getImages:(proId)=>{
        return new Promise((resolve,reject)=>{
            product.findOne({_id:new ObjectId(proId)}).then((product)=>{
               resolve(product.images)
            })
        })
    },

    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            product.updateOne({_id:new ObjectId(proId)},{$set:{visiblity:false}}).then((data)=>{
               resolve(data)
            })
        })
    },

    getUser:()=>{
        return new Promise((resolve,reject)=>{
            user.find().sort({createdAt:-1}).then((data)=>{
               resolve(data)
            })
        })
    },

    blockUser:(userId,status)=>{
        return new Promise(async(resolve,reject)=>{
            const findUser=await user.findOne({_id:new ObjectId(userId)})
            if(findUser){
            user.updateOne({_id:new ObjectId(userId)},{$set:{status:status}}).then((data)=>{
                resolve()
            })
        }else{
            await googleAuth.updateOne({_id:new ObjectId(userId)},{$set:{status:status}}).then((data)=>{
                resolve()
            }) 
        }
        })
    },

    productByCategory:(cat)=>{
        return new Promise((resolve,reject)=>{
           if(cat=="all"){
            product.find({visiblity:true}).then((data)=>{
                 resolve(data)
               })
           }
           else{
            product.find({catType:cat,visiblity:true}).then((data)=>{
                 resolve(data)
               })
           }
        })
    },

    addCategory:(catName,imageUrl)=>{
        const categoryObj={
            name:catName,
            image:imageUrl,
            visiblity:true,
            isBlock:false
        }
        return new Promise(async(resolve,reject)=>{
            const findCategory=await category.collection.findOne({name:catName,visiblity:true})
            if(!findCategory){
            category.collection.insertOne(categoryObj).then(()=>{
                resolve()
            })
        }else{
            console.log("product already have")
            resolve()
        }
        })
    },

    findCategory:()=>{
        return new Promise((resolve,reject)=>{
            category.find({visiblity:true}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },

    findcatdetails:(catId)=>{
        return new Promise((resolve,reject)=>{
            category.findOne({_id:new ObjectId(catId)}).then((data)=>{
                resolve(data)
            })
        })
    },

    editCategory:(catName,imageurl,catId)=>{
        console.log(catId,catName,imageurl)
        return new Promise((resolve,reject)=>{
            if(imageurl.length==0){
                category.updateOne({_id:new ObjectId(catId)},{$set:{name:catName}}).then(()=>{
                    resolve()
                })
            }
            else{
                category.updateOne({_id:new ObjectId(catId)},{$set:{name:catName,image:imageurl}}).then(()=>{
                    resolve()
                })
            }
        })
    },

    deleteCategory:(catId)=>{
        return new Promise((resolve,reject)=>{
            category.updateOne({_id:new ObjectId(catId)},{$set:{visiblity:false}}).then(()=>{
                resolve()
            })
        })
    },

    blockCategory:(catId,value)=>{
        return new Promise((resolve,reject)=>{
            category.updateOne({_id:new ObjectId(catId)},{$set:{isBlock:value}}).then(()=>{
                    resolve()
            })
        })
    },

    getCatId:(cat)=>{

        cat=cat.charAt(0).toUpperCase() + cat.slice(1);
        return new Promise((resolve,reject)=>{
            category.findOne({name:cat}).then((data)=>{
                resolve(data._id)
            })
        })
    },

    getUserCount:()=>{
        return new Promise((resolve,reject)=>{
            user.find({}).then((data)=>{
                resolve(data.length)
            })
        })
    },


    findOrders:()=>{
        return new Promise((resolve,reject)=>{
           orderDetail.aggregate([
            {
                $sort:{
                    orderDate:-1
                }
            },
            // {
            //     $addFields: {
            //       totalPrice: {
            //         $sum: {
            //           $map: {
            //             input: "$orderedProducts",
            //             as: "product",
            //             in: { $multiply: ["$$product.price", "$$product.quantity"] }
            //           }
            //         }
            //       }
            //     }
            //   },
           ]).then((data)=>{
            console.log(data)
            resolve(data)
           })
        })
    },

    getOrderUserDetails:(orderId)=>{
        return new Promise((resolve,reject)=>{
            orderDetail.aggregate([{
                $match:{
                    _id:new ObjectId(orderId)
                }
            },
            {
                $lookup:{
                    from:"userdetails",
                    localField:"userId",
                    foreignField:"userId",
                    as:"userDetails"
                }
            },
            {
                $unwind:"$userDetails"
            },
            {
                $project:{
                    userName:"$userDetails.name",
                    email:"$userDetails.email",
                    number:"$userDetails.phoneNumber",
                    address1:"$address.addressLine1",
                    address2:"$address.addressLine2",
                    city:"$address.city",
                    state:"$address.state",
                    country:"$address.country",
                    pincode:"$address.pincode",
                    landmark:"$address.landmark"
                }
            }
           ]).then((data)=>{
            resolve(data)
           })
        })
    },

    getorderSummary:(orderId)=>{
        return new Promise((resolve,reject)=>{
            orderDetail.aggregate([{
                $match:{
                    _id:new ObjectId(orderId)
                }
            },
            {
                $unwind:"$orderedProducts"
            },
           ]).then((data)=>{
            resolve(data)
           })
        })
    },

    findOrderProductDetails:(orderId)=>{
        return new Promise((resolve,reject)=>{
          orderDetail.aggregate([{
            $match:{
                _id:new ObjectId(orderId)
            }
           },
           {
            $unwind:"$orderedProducts"
           },
           {
            $lookup:{
                from:"products",
                localField:"orderedProducts.productId",
                foreignField:"_id",
                as:"productDetails"
            }
           },
           {
            $unwind:"$productDetails"
           },
           {
            $project:{
                orderId:"$_id",
                productId:"$productDetails._id",
                quantity:"$orderedProducts.quantity",
                price:"$orderedProducts.price",
                name:"$orderedProducts.name",
                colour:"$productDetails.colour",
                images:"$productDetails.images",
                orderStatus:"$orderedProducts.orderStatus"
            }
           }
        ]).then((data)=>{
            resolve(data)
        })
        })
    },

    changeOrderStatus:(orderId,status)=>{
        return new Promise((resolve,reject)=>{
            if(status=="Shipped"){
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                let date=Date.now();
                const convertDate = new Date(date).toLocaleDateString('en-GB', options)
                orderDetail.updateOne({_id:new ObjectId(orderId)},{$set:{'orderedProducts.$[].orderStatus':status,'orderedProducts.$[].shippedDate':convertDate,orderStatus:status}}).then((data)=>{
                    if(data.acknowledged){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
            }
            if(status=="outForDelivery"){
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                let date=Date.now();
                const convertDate = new Date(date).toLocaleDateString('en-GB', options)
                orderDetail.updateOne({_id:new ObjectId(orderId)},{$set:{'orderedProducts.$[].orderStatus':status,'orderedProducts.$[].arrivedDate':convertDate,orderStatus:status}}).then((data)=>{
                    if(data.acknowledged){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
            }
            if(status=="Delivered"){
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                let date=Date.now();
                const convertDate = new Date(date).toLocaleDateString('en-GB', options)
                orderDetail.updateOne({_id:new ObjectId(orderId)},{$set:{'orderedProducts.$[].orderStatus':status,'orderedProducts.$[].deliveredDate':convertDate,orderStatus:status}}).then((data)=>{
                    if(data.acknowledged){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
            }

        })
    },

    findAllCoupons:()=>{
        return new Promise((resolve,reject)=>{
            couponData.find({isActive:true}).then((data)=>{
                resolve(data)
            })
        })
    },

    addCoupon:(data)=>{
        return new Promise(async(resolve,reject)=>{
            const findCoupon=await couponData.findOne({code:data.code,isActive:true})
            if(findCoupon){
                resolve({status:false,message:"Coupon with same coupon code exist"})
            }else{
                const dataObj=new couponData(data)
                dataObj.save().then((data)=>{
                if(data){
                    resolve({status:true})
                }else{
                    resolve({status:false,message:"Coupon not addedd"})
                }
            })
            }
        })
    },

    findCouponToEdit:(couponCode)=>{
        return new Promise((resolve,reject)=>{
            couponData.findOne({code:couponCode,isActive:true}).then((data)=>{
                resolve(data)
            })
        })
    },

    editCoupon:(data,couponCode)=>{
        console.log(couponCode)
        return new Promise((resolve,reject)=>{
            couponData.updateOne({code:couponCode,isActive:true},{$set:data}).then((data)=>{
                if(data.acknowledged){
                    resolve({status:true,message:"Coupon edited successfully"})
                }else{
                    resolve({status:false,message:"Coupon not edited"})
                }
            })
        })
    },

    deleteCoupon:(couponCode)=>{
        return new Promise((resolve,reject)=>{
            couponData.updateOne({code:couponCode},{$set:{isActive:false}}).then((data)=>{
                if(data.acknowledged){
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            })
        })
    },

    getOrderTotalAmount:()=>{
        return new Promise(async(resolve,reject)=>{
            const orders =await orderDetail.find()
            let total=0
            orders.map((data)=>{
                total+=data.totalPrice
            })
            resolve(total)
        })
    },

    getOrderTotal:()=>{
        return new Promise(async(resolve,reject)=>{
            const orders =await orderDetail.find()
            resolve(orders.length)
        })
    },

    getTotalProductsCount:()=>{
        return new Promise(async(resolve,reject)=>{
            const orders =await orderDetail.find()
            let totalProductsCount=0
            orders.map((data)=>{
                totalProductsCount+=data.orderedProducts.length
            })
            resolve(totalProductsCount)
        })
    },

    getAllOrderDetails:()=>{
        return new Promise((resolve,reject)=>{
            orderDetail.find().then((data)=>{
                console.log(data)
                let obj=data.map((details,index)=>{
                    let date=new Date(details.orderDate).toISOString().split('T')[0]
                    return {
                        orderId:details.orderId,
                        total:details.totalPrice,
                        status:details.paymentMethod,
                        key:index+1,
                        date:date
                    }
                })
                resolve(obj)
            })
        })
    },

    getOfferDiscountTotal:()=>{
        let total=0
        return new Promise((resolve,reject)=>{
            orderDetail.find().then((data)=>{
                console.log(data)
                data.map((data)=>{
                    total+=data.offerDiscount
                })
                resolve(total)
            })
        })
    },

    deleteProductImage:(productId,index)=>{
        return new Promise((resolve,reject)=>{
            product.updateOne({_id:new ObjectId(productId)},{$unset:{[`images.${index}`]:1}}).then(()=>{
                product.updateOne({_id:new ObjectId(productId)},{$pull:{images:null}}).then((data)=>{
                    if(data.acknowledged){
                        resolve({status:true})
                    }else{
                        resolve({status:true})
                    }
                })
            })
        })
    },

    getProduct:(productId)=>{
        return new Promise((resolve,reject)=>{
            product.findOne({_id:new ObjectId(productId)}).then((data)=>{
                resolve(data)
            })
        })
    },

    getDateData:(from,end)=>{
        const startDate = new Date(from);
        const endDate = new Date(end);
        return new Promise((resolve,reject)=>{
            endDate.setHours(23, 59, 59, 999);
            orderDetail.find({orderDate:{$gte:startDate,$lte:endDate}}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    }
      
}