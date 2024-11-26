const product=require('../databaseSchemas/productSchema');
const Admin=require('../databaseSchemas/adminSchema');
const user=require('../databaseSchemas/usersSchemas');
const category=require('../databaseSchemas/categorySchema');
const googleAuth=require('../databaseSchemas/googleAuthSchemas');
const orderDetail=require('../databaseSchemas/orderSchema');
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
                images:images
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
        let userArray=[];
        return new Promise((resolve,reject)=>{
            user.find({}).then((data)=>{
                googleAuth.find({}).then((googleData)=>{
                    userArray=[...data,...googleData]
                    console.log(userArray)
                    resolve(userArray)
                })
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
           orderDetail.aggregate([{
            $lookup:{
                from:"users",
                localField:"userId",
                foreignField:"_id",
                as:"userDetails"
            }
           },
           {
            $unwind:"$userDetails"
           },
           {
            $unwind:"$orderedProducts"
           },
           {
            $group: {
              _id: "$_id",                         
              userId:{ $first: "$userId" },         
              userName:{ $first: "$userDetails.name" },
              totalPrice:{ $first: "$totalPrice" },   
              orderDate:{ $first: "$orderedProducts.orderedDate"},
              orderStatus:{ $first: "$orderedProducts.orderStatus"},      
            }
          },
          {
            $project: {
              orderId: "$_id",                   
              userId: 1,                          
              userName: 1,                       
              totalPrice: 1,                                    
              orderDate: 1, 
              orderStatus:1                                      
            }
          }
        ]).then((data)=>{
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
                    email:"$userDetail.email",
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
            {
                $project:{
                    orderDate:"$orderedProducts.orderedDate",
                    totalPrice:"$totalPrice"
                }
            }
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
                orderDetail.updateOne({_id:new ObjectId(orderId)},{$set:{'orderedProducts.$[].orderStatus':status,'orderedProducts.$[].shippedDate':convertDate}}).then((data)=>{
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
                orderDetail.updateOne({_id:new ObjectId(orderId)},{$set:{'orderedProducts.$[].orderStatus':status,'orderedProducts.$[].arrivedDate':convertDate}}).then((data)=>{
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
                orderDetail.updateOne({_id:new ObjectId(orderId)},{$set:{'orderedProducts.$[].orderStatus':status,'orderedProducts.$[].deliveredDate':convertDate}}).then((data)=>{
                    if(data.acknowledged){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
            }

        })
    }
}