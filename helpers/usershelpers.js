const { promises } = require('nodemailer/lib/xoauth2');
const user=require('../databaseSchemas/usersSchemas')
const bcrypt=require('bcrypt')
const {generateOTP}=require('../utils/sendEmail')
const {sendEmail}=require('../utils/sendEmail')
const OTPschema=require('../databaseSchemas/otpSchema');
const { promise } = require('bcrypt/promises');
const otpSchema = require('../databaseSchemas/otpSchema');
const googleAuthSchema=require('../databaseSchemas/googleAuthSchemas');
const userDetail=require('../databaseSchemas/userDetailSchema');
const addressDetail=require('../databaseSchemas/addressSchema');
const product=require('../databaseSchemas/productSchema');
const cartDetail=require("../databaseSchemas/cartSchema");
const orderDetail=require('../databaseSchemas/orderSchema');
const wishlist=require('../databaseSchemas/wishListSchema');
const couponData=require('../databaseSchemas/couponSchema');
const useCoupon=require('../databaseSchemas/couponUsesSchema');
const wallet=require('../databaseSchemas/walletSchema');
const razorpay=require('../config/razorpay');
const mongoose=require('mongoose')
const { ObjectId } = mongoose.Types;
module.exports={
    addUser: (userdata) => {
        const userData = new user({
            name: userdata.name,
            email: userdata.email,
            password: userdata.password,
            confirmPassword: userdata.confirmPassword,
            verified:false,
            status:"Unblock"
        });
        return new Promise(async(resolve, reject) => {
            const userFind=await user.findOne({email:userdata.email})
            if(userFind){
                resolve({status:false,message:"User with same email already exist"})
            }else{
                userData.save().then((data)=>{
                    if(data){
                        resolve({status:true,message:"User Created Successfully"})
                    }else{
                        resolve({status:false,message:"Error occured try again"})
                    }
                })
            }
        });
    },
    checkUser:async(userdata)=>{
        return new Promise(async(resolve,reject)=>{
            const userDetails=await user.collection.findOne({email:userdata.email})
            if(!userDetails){
                resolve({status:false,message:"User not found"})
            }
            else{
                const passwordMatch=await bcrypt.compare(userdata.password,userDetails.password)
                if(passwordMatch){
                    if(userDetails.status==="Block"){
                        resolve({status:false,message:"User has been blocked cant't login"})
                    }
                    resolve({status:true,user:userDetails})
                }
                else{
                    resolve({status:false,message:"password wrong"})
                }
            }
        }).catch((err)=>{
            reject(err)
        })
    },

    otpGenerate:(email)=>{
        return new Promise(async(resolve,reject)=>{
            const OTP=generateOTP();
            const subject="your OTP code"
            const text=`OTP : ${OTP}`

            sendEmail(email,subject,text).then(()=>{
                OTPschema.collection.insertOne({email:email,otp:OTP}).then(()=>{
                    resolve({status:true,userotp:OTP,message:"OTP Send Successfully to your email"})
                }).catch((err)=>{
                    console.log("OTP not send error occured" +err)
                    reject({message:"OTP not send error occured"})
                })
            })
        })
    },

    signupOtpVerification:(email,otp)=>{
        console.log(otp,email)
        return new Promise(async(resolve,reject)=>{
            const dbOTP= await OTPschema.collection.findOne({email:email})
            if(dbOTP.otp==otp){
                await user.collection.updateOne({email:email},{$set:{verified:true}}).then(()=>{
                    resolve({status:true,message:"User Signed Successfully"})
                })
            }
            else{
                resolve({status:false,message:"User Signup Failed Wrong OTP"})
            }
        })
    },

    updateUserOtp:(email,newOtp)=>{
        return new Promise((resolve,reject)=>{
            otpSchema.collection.updateOne({email:email},{$set:{otp:newOtp}}).then(()=>{
                resolve({status:true})
            })
        })
    },

    resendOtpGenerate:(email)=>{
        return new Promise(async(resolve,reject)=>{
            const OTP=generateOTP();
            const subject="your OTP code"
            const text=`OTP : ${OTP}`

            sendEmail(email,subject,text).then(()=>{
                OTPschema.collection.updateOne({email:email},{$set:{otp:OTP}}).then(()=>{
                    resolve({status:true})
                }).catch((err)=>{
                    console.log("OTP not send error occured" +err)
                    reject({message:"OTP not send error occured"})
                })
            })
        })
    },

    googleAuthUserAdd:(userDetails)=>{
        const googleUserData={
            googleId:userDetails.id,
            name:userDetails.displayName,
            email:userDetails.emails[0].value,
            image:userDetails.photos[0].value,
            verified:true,
            status:"Unblock"
        }
        return new Promise(async(resolve,reject)=>{
            const userDetail=await user.collection.findOne({email:userDetails.emails[0].value})
            if(userDetail){
                resolve({status:false,message:"user with this email already exist"})
            }
            else{
                const googleUser=await googleAuthSchema.collection.findOne({email:userDetails.emails[0].value})
                if(googleUser){
                    resolve({status:true,message:"user already logedIn",userData:googleUserData})
                }
                else{
                    googleAuthSchema.collection.insertOne(googleUserData).then(()=>{
                        resolve({status:true,userData:googleUserData})
                    })
                }
            }
        })
    },

    forgotPasswordOtpGenerate:(email)=>{
        return new Promise(async(resolve,reject)=>{
            const OTP=generateOTP();
            const subject="your OTP code"
            const text=`OTP : ${OTP}`

            sendEmail(email,subject,text).then(()=>{
                OTPschema.collection.updateOne({email:email},{$set:{otp:OTP}}).then(()=>{
                    resolve({status:true})
                }).catch((err)=>{
                    console.log("OTP not send error occured" +err)
                    reject({message:"OTP not send error occured"})
                })
            })
        })
    },

    forgotPasswordOtpVerification:(otp,email)=>{
        return new Promise(async(resolve,reject)=>{
           const dbOTP=await OTPschema.collection.findOne({email:email})
           if(dbOTP.otp==otp){
             resolve({status:true})
           }
           else{
            resolve({status:false,message:"OTP you enterd is wrong"})
           }
        })
    },

    changePassword:async(passwords,email)=>{
        const salt = await bcrypt.genSalt(10);
        passwords.newPassword = await bcrypt.hash(passwords.newPassword, salt);
        return new Promise((resolve,reject)=>{
            user.collection.updateOne({email:email},{$set:{password:passwords.newPassword}}).then(()=>{
                resolve()
            })
        })
    },

    addUserDetails:(data)=>{
        return new Promise((resolve,reject)=>{
            const userData=new userDetail({
                name:data.name,
                email:data.email,
                phoneNumber:data.phoneNumber,
                gender:data.gender,
                image:data.image,
                userId:data.userId 
            })
            userData.save().then(()=>{
                resolve()
            })
        })
    },

    findUserProfile:(userId)=>{
        return new Promise((resolve,reject)=>{
            userDetail.find({userId:new ObjectId(userId)}).then((data)=>{
                const length=data.length;
                if(length!=0){
                    resolve(data[0].image)
                }
                else{
                    resolve()
                }
            })
        })
    },

    getuserData:(userId)=>{
        return new Promise((resolve,reject)=>{
            userDetail.findOne({userId:new ObjectId(userId)}).then((data)=>{
                resolve(data)
            })
        })
    },

    editUserDetails:(userId)=>{
        return new Promise((resolve,reject)=>{
           userDetail.findOne({userId:new ObjectId(userId)}).then((data)=>{
           resolve(data)
           })
        })
    },

    updateUserDetails:(userId,data)=>{
        return new Promise((resolve,reject)=>{
            userDetail.updateOne({userId:new ObjectId(userId)},{$set:data}).then(()=>{
                resolve()
            })
        })
    },

    addAddress:(userId,data)=>{
        return new Promise(async(resolve,reject)=>{
            const userAddress=await addressDetail.findOne({userId:new ObjectId(userId)})
            if(userAddress){
                userAddress.address.push(data)
                await userAddress.save().then(()=>{
                    resolve()
                })
            }else{
            const dataObj=new addressDetail({
                userId,
                address:[data]
            })
            dataObj.save().then(()=>{
                resolve()
            })
        }
        })
    },

    findUserAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           const data=await addressDetail.findOne({userId:new ObjectId(userId)})
           if(data){
            resolve(data.address)
           }else{
            resolve()
           }
        })
    },

    getAddress:(userId,addressId)=>{
        return new Promise((resolve,reject)=>{
            addressDetail.aggregate([
                {
                    $match:{userId:new ObjectId(userId)}
                },
                {
                    $unwind:"$address"
                },
                {
                    $match:{'address._id':new ObjectId(addressId)}
                }
            ]).then((data)=>{
                resolve(data[0].address)
            })
        })
    },
    
    editAddress:(userId,addressId,data)=>{
        return new Promise((resolve,reject)=>{
           addressDetail.updateOne({userId:new ObjectId(userId)},{
            $set:{
                "address.$[elem].addressType":data.addressTpe,
                "address.$[elem].addressLine1":data.addressLine1,
                "address.$[elem].addressLine2":data.addressLine2,
                "address.$[elem].city":data.city,
                "address.$[elem].state":data.state,
                "address.$[elem].country":data.country,
                "address.$[elem].pincode":data.pincode,
                "address.$[elem].landmark":data.landmark
            },
           },
           {
            arrayFilters:[{"elem._id":new ObjectId(addressId)}]
           }
          ).then(()=>{
            resolve()
          }).catch((err)=>{
            console.log(err)
          })
        })
    },

    deleteAddress:(userId,addressId)=>{
        return new Promise((resolve,reject)=>{
            addressDetail.updateOne({userId:new ObjectId(userId)},{$pull:{address:{_id:new ObjectId(addressId)}}}).then((data)=>{
                if(data.acknowledged){
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            })
        })
    },

    getProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
            product.findOne({_id:new ObjectId(productId)}).then((data)=>{
                resolve(data)
            })
        })
    },

    addToCart:(data)=>{
        return new Promise(async(resolve,reject)=>{
           const cartUser=await cartDetail.findOne({userId:new ObjectId(data.userId)})
           if (cartUser) {
            const productExists = cartUser.products.some((prod) => 
                prod.productId.equals(data.products[0].productId)
            );
            if (productExists) {
               cartDetail.updateOne({userId:new ObjectId(data.userId),"products.productId":new ObjectId(data.products[0].productId)},{$inc:{"products.$.quantity":1}}).then((data)=>{
               resolve()
               })
            } else {
                const obj={
                    productId:data.products[0].productId,
                    quantity:data.products[0].quantity,
                    price:data.products[0].price,
                    image:data.products[0].image,
                    offerPrice:data.products[0].offerPrice
                }
                cartDetail.updateOne({userId:new ObjectId(data.userId)},{$push:{products:obj}}).then(()=>{
                    resolve()
                })
            }
        } else {
            const cartObj=new cartDetail(data)
           cartObj.save().then(()=>{
             resolve()
           })
        }
        })
    },

    deleteCartProduct:(userId,productId)=>{
        return new Promise((resolve,reject)=>{
            cartDetail.updateOne({userId:new ObjectId(userId)},{$pull:{products:{productId:new ObjectId(productId)}}}).then((data)=>{
                if(data.acknowledged){
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            })
        })
    },

    updateProductQuantity:(userId,productId,value)=>{
        return new Promise((resolve,reject)=>{
           cartDetail.updateOne({userId:new ObjectId(userId),'products.productId':new ObjectId(productId)},{$inc:{'products.$.quantity':value}}).then((data)=>{
            if(data.acknowledged){
                resolve({status:true})
            }else{
                resolve({status:false})
            }
           })
        })
    },

    getAllAddress:(userId)=>{
        return new Promise((resolve,reject)=>{
            addressDetail.findOne({userId:new ObjectId(userId)}).then((data)=>{
                if(data){
                resolve(data.address)
                }else{
                    resolve(0)
                }
            })
        })
    },

    getCartProducts:(cartId)=>{
        return new Promise((resolve,reject)=>{
            cartDetail.aggregate([{
                $match:{
                    _id:new ObjectId(cartId)
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
                    productId:"$products.productId",
                    quantity:"$products.quantity",
                    price:"$products.price",
                    description:"$productDetails.description",
                    images:"$products.image",
                    productName:"$productDetails.name",
                    productCategory:"$productDetails.catType",
                    offerPrice:"$productDetails.offerPrice"
                }
            }
        ]).then((data)=>{
            resolve(data)
        })
        })
    },

    getOrderAddress:(addressId,userId)=>{
        return new Promise((resolve,reject)=>{
            addressDetail.findOne({userId:new ObjectId(userId),'address._id':new ObjectId(addressId)},{'address.$':1}).then((data)=>{
                resolve(data.address)
            })
        })
    },

    placeCartOrder:(data,userId)=>{
        return new Promise(async(resolve,reject)=>{
            if(data.paymentMethod=="Cash On Delivery"){
                const order=new orderDetail(data)
                order.save().then(()=>{
                    cartDetail.updateOne({userId:new ObjectId(userId)},{$set:{products:[]}}).then(()=>{
                        resolve({status:true})
                    })
                })
            }else if(data.paymentMethod==="Online"){
                try {
                    const razorpayOrder = await razorpay.orders.create({
                        amount: data.totalPrice * 100,
                        currency: "INR",
                        receipt: `receipt_${new Date().getTime()}`
                    })

                    resolve({status: 'PENDING_PAYMENT',
                        orderId: razorpayOrder.id,
                        key: razorpay.key_id,amount:data.totalPrice*100,data:data})

                } catch (error) {
                    console.log(error)
                    reject(error);
                }
            }
        })
    },

    getOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           const userOrder=await orderDetail.findOne({userId:new ObjectId(userId)})
           if(userOrder){
            orderDetail.aggregate([{
                $match:{
                    userId:new ObjectId(userId)
                }
            },
            {
                $project:{
                    orderedProducts:1,
                    totalPrice:1
                }
            },
            {
                $unwind:"$orderedProducts"
            }
          ]).then((data)=>{
            resolve(data)
          })
           }else{
            resolve([])
           }
        })
    },

    getSingleProductFromOrder: (orderId, productId) => {
        return new Promise((resolve, reject) => {
            orderDetail.findOne(
                { 
                    _id: new ObjectId(orderId), 
                    'orderedProducts.productId': new ObjectId(productId) 
                },
                {
                    totalPrice: 1,
                    orderedProducts: { 
                        $elemMatch: { productId: new ObjectId(productId) } 
                    }
                }
            ).then((data) => {
                console.log(data);
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        });
    },
    
    getOrderSingleProductAddress:(orderId)=>{
        return new Promise((resolve,reject)=>{
            orderDetail.findOne({_id:new ObjectId(orderId)}).lean().then((data)=>{
                resolve(data.address)
            })
        })
    },

    trackOrderDetails:(orderId,productId)=>{
        return new Promise((resolve,reject)=>{
            orderDetail.aggregate([{
                $match:{
                    _id:new ObjectId(orderId),
                }
            },
            {
                $unwind:"$orderedProducts"
            },
            {
                $match:{"orderedProducts.productId":new ObjectId(productId)}
            },
            {
                $project:{
                    orderStatus:"$orderedProducts.orderStatus",
                    orderDate:"$orderedProducts.orderedDate",
                    shippedDate:"$orderedProducts.shippedDate",
                    arrivedDate:"$orderedProducts.arrivedDate",
                    deliveredDate:"$orderedProducts.deliveredDate"
                }
            }
        ]).then((data)=>{
            console.log(data)
            resolve(data)
        })
        })
    },

    cartOrderCancel:(productId,orderId)=>{
        console.log(productId,orderId)
        return new Promise((resolve,reject)=>{
            orderDetail.updateOne({_id:new ObjectId(orderId)},{$pull:{orderedProducts:{productId:new ObjectId(productId)}}}).then((data)=>{
               if(data.acknowledged){
                orderDetail.findOne({_id:new ObjectId(orderId)}).then((data)=>{
                    if(data.orderedProducts.length==0){
                        orderDetail.deleteOne({_id:new ObjectId(orderId)}).then(()=>{
                            resolve({status:true})
                        })
                    }else{
                        resolve({status:true})
                    }
                })
               }else{
                resolve({status:false})
               }
            })
        })
    },

    findUserDetails:(userId)=>{
        return new Promise((resolve,reject)=>{
            userDetail.findOne({userId:new ObjectId(userId)}).then((data)=>{
                resolve(data)
            })
        })
    },

    returnOrder:(productId,orderId)=>{
        return new Promise((resolve,reject)=>{
            orderDetail.updateOne({_id:new ObjectId(orderId)},{$set:{'orderedProducts.$[].orderStatus':"Return"}}).then((data)=>{
                if(data.acknowledged){
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            })
        })
    },

    updateProductStock: (cartProducts) => {
        return new Promise((resolve, reject) => {
          const stockUpdates = cartProducts.map((data) => {
            return {
              updateOne: {
                filter: { _id: new ObjectId(data.productId) },
                update: { $inc: { stock: -data.quantity } },
              },
            };
          });
          product
            .bulkWrite(stockUpdates)
            .then((data) => {
              resolve({status:true});
            })
            .catch((err) => {
              console.error("Error updating stock:", err);
              reject(err);
            });
        });
      },
      
      returnProductUpdateQuantity:(productId,quantity)=>{
        return new Promise((resolve,reject)=>{
            product.updateOne({_id:new ObjectId(productId)},{$inc:{stock:quantity}}).then((data)=>{
                if(data.acknowledged){
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            })
        })
      },

      addToWishlist:async(userId,productId)=>{
        const prod=await product.findOne({_id:new ObjectId(productId)})
        const obj={
            productId:prod._id,
            name:prod.name,
            description:prod.description,
            colour:prod.colour,
            price:prod.price,
            images:prod.images,
            isOnWishList:true,
            offerPrice:prod.offerPrice ? prod.offerPrice : false
        }
        return new Promise(async(resolve,reject)=>{
            const findUser=await wishlist.findOne({userId:new ObjectId(userId)})
            if(findUser){
                await wishlist.updateOne({userId:new ObjectId(userId)},{$push:{products:obj}}).then((res)=>{
                    if(res.acknowledged){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
            }else{
                const wish=new wishlist({
                    userId:userId,
                    products:obj
                })
                wish.save().then((data)=>{
                    if(data){
                        resolve({status:true})
                    }else{
                        resolve({status:false})
                    }
                })
            }
        })
      },

      getWishProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            const findUser=await wishlist.findOne({userId:new ObjectId(userId)})
            if(findUser){
                wishlist.findOne({userId:userId}).then((data)=>{
                    resolve(data.products)
                })
            }else{
                resolve(0)
            }
        })
      },

      findWishProduct:(userId,productId)=>{
        return new Promise(async(resolve,reject)=>{
            const findUser=await wishlist.findOne({userId:new ObjectId(userId)})
            if(findUser){
                wishlist.findOne({userId:new ObjectId(userId),'products.productId':new ObjectId(productId)}).then((data)=>{
                    if(data){
                        resolve(true)
                    }else{
                        resolve(false)
                    }
                })
            }else{
                resolve(false)
            }
        })
      },

      findWishListLength:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            const findUser=await wishlist.findOne({userId:new ObjectId(userId)})
            if(findUser){
                wishlist.findOne({userId:new ObjectId(userId)}).then((data)=>{
                    resolve(data.products.length)
                })
            }else{
                resolve()
            }
        })
      },

      removeFromWish:(userId,productId)=>{
        return new Promise((resolve,reject)=>{
            wishlist.updateOne({userId:new ObjectId(userId)},{$pull:{products:{productId:new ObjectId(productId)}}}).then((data)=>{
               if(data.acknowledged){
                resolve({status:true})
               }else{
                resolve({status:false})
               }
            })
        })
      },

      getAllCoupon:()=>{
        return new Promise((resolve,reject)=>{
            couponData.find({isActive:true}).then((data)=>{
                resolve(data)
            })
        })
      },

      applyCoupon:(couponCode,userId,totalAmount)=>{
        return new Promise(async(resolve,reject)=>{
            const findcoupon = await couponData.findOne({code:couponCode,isActive:true})
            const date=new Date().toISOString().split('T')[0].trim()
            if(findcoupon){
                const couponStartDate=new Date(findcoupon.startDate).toISOString().split('T')[0].trim()
                const couponEndDate=new Date(findcoupon.endDate).toISOString().split('T')[0].trim()
                if(date < couponStartDate && date!=couponStartDate){
                    resolve({status:false,message:"Coupon cannot addedd beacause coupon not yet started"})
                }
                if(date > couponEndDate && date!=couponEndDate){
                    resolve({status:false,message:"Coupon expires cannot add"})
                }
                if(totalAmount<findcoupon.minimumPrice){
                    resolve({status:false,message:"This Coupon cannot addedd for this amount"})
                }
                const findUser= await useCoupon.findOne({userId:userId})
                if(findUser){
                    const isUsed=findUser.usedCoupons.some((data)=>data==couponCode)
                    if(isUsed){
                        resolve({status:false,message:"Coupon cannot add its already used"})
                    }else{
                        resolve({status:true,amount:findcoupon.discountValue})
                    }
                }
                else{
                    resolve({status:true,amount:findcoupon.discountValue})
                }
            }else{
                resolve({status:false,message:"No coupon found !"})
            }
        })
      },

      addCoupon:(userId,couponCode)=>{
        return new Promise(async(resolve,reject)=>{
            const findUser=await useCoupon.findOne({userId:new ObjectId(userId)})
            if(findUser){
                if(couponCode=="no"){
                    resolve()
                }
                useCoupon.updateOne({userId:new ObjectId(userId)},{$push:{usedCoupons:couponCode}}).then(()=>{
                    resolve()
                })
            }else{
                if(couponCode=="no"){
                    resolve()
                }else{
                    let obj={
                        userId:userId,
                        usedCoupons:[
                          couponCode
                      ]
                    }
                    let data=new useCoupon(obj)
                    data.save().then((data)=>{
                        if(data){
                            resolve()
                        }
                    })
                }
            }
        })
      },

      addOrder:(data,userId)=>{
        return new Promise((resolve,reject)=>{
            const obj=new orderDetail(data)
            obj.save().then((data)=>{
                if(data){
                cartDetail.updateOne({userId:new ObjectId(userId)},{$set:{products:[]}}).then(()=>{
                    resolve({status:true})
                })
                }else{
                    resolve({status:false})
                }
            })
        })
      },

    //   addToWallet:(productId,orderId,userId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         const product=await orderDetail.findOne({_id:new ObjectId(orderId),'orderedProducts.productId':new ObjectId(productId)})
    //         const orderedProduct = product.orderedProducts.find(p => p.productId.toString() === productId.toString());
    //         console.log(orderedProduct)
    //         const userExist=await wallet.findOne({userId:new ObjectId(userId)})
    //         if(userExist){
    //             let obj={
    //                 userId:userId,
    //                 balanceAmount:orderedProduct.price
    //             }
    //             let data=new wallet(obj)
    //             data.save().then((data)=>{
    //                 console.log(data)
    //                 resolve({status:true})
    //             })
    //         }else{
    //             wallet.updateOne({userId:new ObjectId(userId)},{$inc:{balanceAmount:orderedProduct.price}}).then(()=>{
    //                 resolve({status:true})
    //             })
    //         }
    //     })
    //   }

    addToWallet: async (productId, orderId, userId) => {
        return new Promise(async(resolve,reject)=>{
            try {
                const product = await orderDetail.findOne({
                  _id: new ObjectId(orderId),
                  'orderedProducts.productId': new ObjectId(productId)
                });
            
                if (!product) {
                  return reject(new Error('Order not found or product not in the order'));
                }
            
                const orderedProduct = product.orderedProducts.find(p => p.productId.toString() === productId.toString());
            
                if (!orderedProduct) {
                  return reject(new Error('Product not found in the order'));
                }
            
                const userExist = await wallet.findOne({ userId: new ObjectId(userId) });
            
                if (userExist) {
                  await wallet.updateOne(
                    { userId: new ObjectId(userId) },
                    { $inc: { balanceAmount: orderedProduct.price } }
                  );
                  return resolve({ status: true });
                } else {
                  const newWallet = new wallet({
                    userId: new ObjectId(userId),
                    balanceAmount: orderedProduct.price
                  });
                  await newWallet.save();
                  return resolve({ status: true });
                }
              } catch (error) {
                console.error('Error adding to wallet:', error);
                return reject(error);
              }
        })
      },

      findWalletAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            const userExist=await wallet.findOne({userId:new ObjectId(userId)})
            if(userExist){
                wallet.findOne({userId:new ObjectId(userId)}).then((data)=>{
                    resolve(data.balanceAmount)
                })
            }else{
                resolve()
            }
        })
      }
}