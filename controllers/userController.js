const userhelper=require('../helpers/usershelpers')
const producthelper=require('../helpers/producthelpers');
const { response } = require('express');
const crypto = require('crypto');
const razorpay=require('../config/razorpay')

module.exports={

    loginsection:(req,res)=>{
      try {
        const errorMessage = req.session.errorMessage;
        const newPassMessage = req.session.newPassMessage;

        req.session.errorMessage = null;

        res.render("users/login", { message: errorMessage || newPassMessage || null });
    } catch (error) {
        console.error("Error in loginsection:", error);

        req.session.errorMessage = "An unexpected error occurred. Please try again.";

        res.redirect('/login');
    }
   },

   loginsubmission:async(req,res)=>{
    try {
      const response = await userhelper.checkUser(req.body);
      if(response.status){
        req.session.user=response.user
        res.status(200).json({status:true})
      }else{
        res.status(400).json({status:false,message:response.message})
      }
  } catch (err) {
      console.error(err);
      req.session.errorMessage = "An error occurred during login. Please try again.";
      res.redirect('/users/login');
  }
 },

 signupsection:(req, res) => {
  try {
    const errorMessage = req.session.errorMessage;
    const formData = req.session.formData || {};

    req.session.errorMessage = null;
    req.session.formData = null;

    res.render('users/signup', {

        message: errorMessage || null,
        formData: formData
    });
} catch (error) {
    console.error("Error in signupsection:", error);
    res.redirect('/users/signup');
}
  },

  signupsubmission: async (req, res) => {
    req.session.email = req.body.email;
    req.session.referalCode=req.body.referalCode
    try {
      const addUserResponse = await userhelper.addUser(req.body);
      if (addUserResponse.status){
        const otpResponse = await userhelper.otpGenerate(req.body.email);
        if (otpResponse.status) {
          setTimeout(async() => {
            const deleteOTP=await userhelper.deleteOTP(req.session.email)
          }, 60000);
          res.status(200).json({status:true,message:otpResponse.message})
        } 
      }else{
        res.status(400).json({status:false,message:addUserResponse.message})
      } 
    } catch (error) {
      req.session.errorMessage = error.message;
      res.redirect('/users/signup');
    }
  },

  signupOtpPage:(req,res)=>{
    try {
      const otpError = req.session.otpError;
      req.session.otpError = null;

      res.render('users/signupOtpVerification', { message: otpError || null });
  } catch (error) {
      console.error("Error in otpVerificationSection:", error);

      //res.redirect('/users/signupOtpVerification');
  }
  },

  resendOtp:async(req,res)=>{
    try {
      const response = await userhelper.resendOtpGenerate(req.session.email);

      if (response.status) {
        setTimeout(async() => {
          const deleteOTP=await userhelper.deleteOTP(req.session.email)
        }, 60000);
          res.json({success: true,message:"OTP has been resend check it in your email"});
      } else {
          res.json({success: false, message: "Failed to Send OTP please try again"});
      }
  } catch (error) {
      console.error("Error in resendOtp:", error);
      res.json({ success: false, message: "An error occurred. Please try again." });
  }
  },

  signupOtpVerification:async(req,res)=>{
    try {
      const otp = req.body.first + req.body.second + req.body.third + req.body.fourth;
      const response = await userhelper.signupOtpVerification(req.session.email, otp);

      if (response.status) {
          const checkReferalCode=await userhelper.checkReferal(req.session.referalCode)
          res.status(200).json({status:true,message:response.message})
      } else {
          res.status(400).json({status:false,message:response.message})
      }
  } catch (error) {
      console.error("Error in otpVerification:", error);
      req.session.otpError = "An error occurred. Please try again.";
      res.redirect('/users/signupOtpVerification');
  }
  },

  forgotPasswordPage:(req,res)=>{
    try {
      res.render("users/forgottenPassword");
  } catch (error) {
      console.error("Error in forgotPasswordPage:", error);
      //res.redirect('/users/forgottenPassword');
  }
  },

  forgotPasswordSubmission:async(req,res)=>{
    try {
      const response = await userhelper.forgotPasswordOtpGenerate(req.body.email);

      if (response.status) {
          req.session.email = req.body.email;
          setTimeout(async() => {
            const deleteOTP=await userhelper.deleteOTP(req.session.email)
          }, 60000);
          res.redirect("/users/forgottenPassword-Otp-Verification");
      } else {
          res.redirect('/users/forgottenPassword');
      }
  } catch (error) {
      console.error("Error in forgotPasswordOtpGenerate:", error);
      res.redirect('/users/forgottenPassword');
  }
   },

   forgotPasswordOtpVerificationPage:(req,res)=>{
    try {
      res.render("users/otpVerification");
  } catch (error) {
      console.error("Error in forgotPasswordOtpVerificationPage:", error);
      res.redirect('/users/otpVerification');
  }
   },

   forgotPasswordOtpVerification:async(req,res)=>{
    try {
      const OTP = req.body.first + req.body.second + req.body.third + req.body.fourth;
      const response = await userhelper.forgotPasswordOtpVerification(OTP, req.session.email);

      if (response.status) {
          res.redirect('/users/resetPassword');
      } else {
          res.redirect('/users/forgottenPassword-Otp-Verification');
      }
  } catch (error) {
      console.error("Error in forgotPasswordOtpVerification:", error);
      res.redirect('/users/forgottenPassword-Otp-Verification');
  }
   },

  resetPasswordPage:(req,res)=>{
    try {
      res.render("users/newpasswordPage");
  } catch (error) {
      console.error("Error in resetPasswordPage:", error);
      res.redirect('/users/resetPassword');
  }
  },

  resetPasswordSubmission:async(req,res)=>{
    try {
     userhelper.changePassword(req.body, req.session.email).then((response)=>{
      if(response.status){
        res.status(200).json({status:true})
      }else{
        res.status(400).json({status:false})
      }
     })
  } catch (error) {
      console.error("Error in resetPasswordSubmission:", error);
      res.redirect('/users/resetPassword');
  }
  },

  userResetSubmission:async(req,res)=>{
    userhelper.changeUserNewPassword(req.body, req.session.user.email).then((response)=>{
      if(response.status){
        req.session.destroy();
        res.status(200).json({status:true,message:response.message})
      }else{
        res.status(400).json({status:false,message:response.message})
      }
    })
  },

  userResetPage:(req,res)=>{
    try {
      res.render('users/resetPasswordPage')
    } catch (error) {
      res.status(500).send("Error occured page not rendering")
    }
  },

  logoutSection:(req,res)=>{
    try {
      if(req.session.user){
        delete req.session.user;
        res.redirect('/')
      }
  } catch (error) {
      console.error("Error in logoutSection:", error);
      res.redirect('/');
  }
  },

  userDetailsPage:async(req,res)=>{
    try {
      const userData=await userhelper.getuserData(req.session.user._id)
      const referalCode=await userhelper.getReferalCode(req.session.user._id)
      if(userData){
        const plainObj={
          name:userData.name,
          email:userData.email,
          image:userData.image,
          userId:userData.userId,
          available:false
        }
        res.render('users/userdetailsPage', { user: req.session.user,userdata:plainObj,referalCode})
      }else{
        const plainObj={
          available:true
        }
        res.render('users/userdetailsPage', { user: req.session.user,userdata:plainObj,referalCode})
      }
  } catch (error) {
      console.error("Error in userDetailsPage:", error);
      res.redirect('/');
  }
  },

  googleAuthenticationVerification:async(req, res) => {
    try {
      const response = await userhelper.googleAuthUserAdd(req.user);
      if (response.status) {
          req.session.user = response.userData;
          res.redirect('/');
      } else {
          req.session.errorMessage = response.message;
          res.redirect('/users/signup');
      }
  } catch (error) {
      console.error("Error in googleAuthenticationVerification:", error);
      req.session.errorMessage = "An error occurred during Google authentication.";
      res.redirect('/users/signup');
  }
   },

   userHomePage:async(req, res) => {
    try {
      let cartLength=0;
      let wishlistLength=0;
      const products = await producthelper.getProducts()
      if(req.session.user){
      cartLength=await producthelper.getCartLength(req.session.user._id)
      wishlistLength=await userhelper.findWishListLength(req.session.user._id)
      }
      const plainProducts = await Promise.all(
        products.map(async (product) => {
          if (req.session.user != undefined) {
            const findwish = await userhelper.findWishProduct(req.session.user._id, product._id);
            return {
              _id: product._id,
              name: product.name,
              description: product.description,
              price: product.price,
              images: product.images,
              isOnWishList:findwish,
              offerPrice:product.offerPrice ? product.offerPrice :false,
              isOutOfStock:product.stock==0
            };
          } else {
            return {
              _id: product._id,
              name: product.name,
              description: product.description,
              price: product.price,
              images: product.images,
              isOnWishList:false,
              offerPrice:product.offerPrice ? product.offerPrice :false,
              isOutOfStock:product.stock==0
            };
          }
        })
      );      
      let userprofile
      if(req.session.user){
      userprofile=await userhelper.findUserProfile(req.session.user._id);
      req.session.user.image=userprofile;
      }
      if(userprofile){
      res.render('users/index', { user: req.session.user, products: plainProducts,cartLength,wishlistLength});
      }
      else{
        res.render('users/index', { user: req.session.user, products: plainProducts,cartLength,wishlistLength});
      }
  } catch (error) {
      console.error("Error in userHomePage:", error);
      res.redirect('/');
  }
},

  addUserDetails:(req,res)=>{
    const{name,email,phone,gender}=req.body;
    const userId=req.session.user._id;
    const image=req.file.path;
    const userObj={
      name:name,
      email:email,
      phoneNumber:phone,
      gender:gender,
      image:image,
      userId:userId
    }
    userhelper.addUserDetails(userObj).then(()=>{
      res.redirect('/')
    })
  },

  addUserDetailsPage:(req,res)=>{
    try {
      res.render('users/adduserDetailsPage',{user:req.session.user})
    } catch (error) {
      res.status(500).send("Error occured page not rendering")
    }
  },

  editUserDetailPage:async(req,res)=>{
    try {
      const userData=await userhelper.editUserDetails(req.session.user._id)
      const gender=userData.gender
      const plainObj={
        name:userData.name,
        phone:userData.phoneNumber,
        ismale:gender=="male",
        isfemale:gender=="female",
        isother:gender=="other",
        image:userData.image,
        userId:userData.userId
      }
      res.render('users/edituserDetailsPage',{user:req.session.user,userdata:plainObj})
    } catch (error) {
     res.status(500).send("Error occured page not rendering")
    }
  },

  updateUserDetails:(req,res)=>{
    try {
      let obj
      const userId=req.params.userId
      const{name,email,phone,gender}=req.body
      const image=req.file ? req.file.path:null
      if(image!=null){
        obj={
          name:name,
          email:email,
          phoneNumber:phone,
          image:image
        }
      }else{
        obj={
          name:name,
          email:email,
          phoneNumber:phone,
        }
      }
      userhelper.updateUserDetails(userId,obj).then(()=>{
        res.redirect('/users/userdetails')
      })
    } catch (error) {
      console.log(error)
      res.status(500).send("Error occured")
    }
  },

  addressPage:async(req,res)=>{
    try {
      const userAddress=await userhelper.findUserAddress(req.session.user._id)
      if(userAddress){
        const plainObj=userAddress.map((data,index)=>{
          return{
            key:index+1,
            address1:data.addressLine1,
            address2:data.addressLine2,
            userId:req.session.user._id,
            addressId:data._id
          }
        })
        res.render('users/addressPage',{user:req.session.user,data:plainObj})
      }else{
        res.render('users/addressPage',{user:req.session.user})
      }
    } catch (error) {
      res.status(500).send("Error occured page not rendering")
    }
  },

  addAddressPage:(req,res)=>{
    try {
      res.render('users/addAddressPage',{user:req.session.user})
    } catch (error) {
      res.status(500).send("Error occured page not rendering")
    }
  },

  addAddress:(req,res)=>{
    try {
      const{addressType,addressLine1,addressLine2,city,state,country,pincode,landmark}=req.body
      const userId=req.session.user._id
      const addressObj={
        addressType,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        pincode,
        landmark,
      }
      userhelper.addAddress(userId,addressObj).then(()=>{
        res.redirect('/users/address')
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  addAddressFromCart:(req,res)=>{
    try {
      const{addressType,addressLine1,addressLine2,city,state,country,pincode,landmark}=req.body
      console.log(req.body.addressType)
      const userId=req.session.user._id
      const addressObj={
        addressType,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        pincode,
        landmark,
      }
      userhelper.addAddress(userId,addressObj).then((response)=>{
        if(response.status){
          res.status(200).json({status:true})
        }else{
          res.status(400).json({status:false})
        }
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  editAddressPage:async(req,res)=>{
    try {
      const address=await userhelper.getAddress(req.params.userId,req.params.addressId)
      const addressObj={
        addressLine1:address.addressLine1,
        addressLine2:address.addressLine2,
        city:address.city,
        state:address.state,
        country:address.country,
        pincode:address.pincode,
        landmark:address.landmark,
        addressId:address._id,
        userId:req.session.user._id,
        isPermanent:address.addressType==="permanent",
        isTemporary:address.addressType==="temporary"
      }
      res.render('users/editAddressPage',{user:req.session.user,data:addressObj})
    } catch (error) {
      res.status(500).send("Error occured page not rendering")
    }
  },

  editAddress:(req,res)=>{
    try {
      const userId=req.params.userId
      const addressId=req.params.addressId
      const{addressType,addressLine1,addressLine2,city,state,country,pincode,landmark}=req.body
      const obj={
        addressType,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        pincode,
        landmark
      }
      userhelper.editAddress(userId,addressId,obj).then(()=>{
        res.redirect('/users/address')
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  deleteAddress:(req,res)=>{
    try {
      const{userId,addressId}=req.params
      userhelper.deleteAddress(userId,addressId).then((response)=>{
        if(response.status){
          res.json({status:true})
        }else{
          res.json({status:false})
        }
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  addToCart:async(req,res)=>{
    try {
      if (!req.session.user) {
        return res.status(401).json({ status: false, message: 'Please login to add products to the cart.' });
      }
        userhelper.getProductDetails(req.params.productId).then((productDetails)=>{
          const productObj={
            productId:productDetails._id,
            quantity:1,
            description:productDetails.description,
            price:productDetails.price,
            image:productDetails.images,
            offerPrice:productDetails.offerPrice ? productDetails.offerPrice : false,
            offerDiscount:productDetails.offerPrice ? productDetails.price-productDetails.offerPrice : 0
          }
          const cartObj={
            userId:req.session.user._id,
            products:[productObj],
          }
          userhelper.addToCart(cartObj).then(()=>{
            res.status(200).json({status:true})
          })
        }).catch(error => {
        res.status(500).json({ status: false, message: 'Failed to add product to cart.' });
      });
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  deleteCartProduct:(req,res)=>{
    try {
      userhelper.deleteCartProduct(req.session.user._id,req.params.productId).then((response)=>{
        if(response.status){
          res.json({status:true})
        }else{
          res.json({status:false})
        }
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  updateProductQuantity:(req,res)=>{
    try {
      userhelper.updateProductQuantity(req.session.user._id,req.params.productId,req.params.value).then((response)=>{
        if(response.status){
          res.json({status:true})
        }else{
          res.json({status:false})
        }
    })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  checkOutPage:async(req,res)=>{
    let couponCode=req.params.couponCode
    try {
      let cartLength=0;
            if(req.session.user){
                cartLength=await producthelper.getCartLength(req.session.user._id)
            }
            const cartProducts=await producthelper.getCartProducts(req.session.user._id)
            const addresses=await userhelper.getAllAddress(req.session.user._id)
            if(addresses!=0){
              const plainAddress=addresses.map((data,index)=>{
                return{
                  addressId:data._id,
                  addressType:data.addressType,
                  addressLine1:data.addressLine1,
                  addressLine2:data.addressLine2,
                  city:data.city,
                  state:data.state,
                  country:data.country,
                  pincode:data.pincode,
                  landmark:data.landmark,
                  key:index+1,
                  offerPrice:data.offerPrice ? data.offerPrice : false
                }
              })
              let totalAmount=150
              let subTotal=0
              let total=cartProducts.map((data)=>{
                  let value=data.offerPrice ? data.offerPrice *data.quantity : data.price*data.quantity
                  totalAmount+=value
                  subTotal+=value
              })
              totalAmount=req.params.totalAmount
              const plainObj=cartProducts.map((data)=>{
                  return{
                      cartId:data._id,
                      productId:data.productId,
                      productName:data.productName,
                      description:data.description,
                      category:data.category,
                      price:data.price,
                      quantity:data.quantity,
                      images:data.images,
                      totalPrice:data.price*data.quantity,
                      offerPrice:data.offerPrice ? data.offerPrice : false
                  }
              })
              res.render('users/checkoutPage', { user: req.session.user,data:plainObj,totalAmount,subTotal,cartLength,address:plainAddress,couponCode});
            }else{
              let totalAmount=150
              let subTotal=0
              let total=cartProducts.map((data)=>{
                  let value=data.price*data.quantity
                  totalAmount+=value
                  subTotal+=value
              })
              totalAmount=req.params.totalAmount
              const plainObj=cartProducts.map((data)=>{
                  return{
                      cartId:data._id,
                      productId:data.productId,
                      productName:data.productName,
                      description:data.description,
                      category:data.category,
                      price:data.price,
                      quantity:data.quantity,
                      images:data.images,
                      totalPrice:data.price*data.quantity,
                  }
              })
              res.render('users/checkoutPage', { user: req.session.user,data:plainObj,totalAmount,subTotal,cartLength,couponCode});
            }
    } catch (error) {
      res.status(500).send("Error occured page not rendering")
    }
  },

  placeCartOrder:async(req,res)=>{
    try {
      const{addressId,cartId,totalAmount,payment,couponCode}=req.body
      const userId=req.session.user._id
      const userDetail=await userhelper.findUserDetails(userId)
      if(userDetail){
      const cartProducts=await userhelper.getCartProducts(cartId)
      const applyCoupon=await userhelper.addCoupon(userId,couponCode)
      let discountTotal=0
      let couponDiscount=0
      if(couponCode!="null"){
        let couponAmount=await userhelper.findCouponAmount(couponCode)
        couponDiscount=Math.floor(couponAmount/cartProducts.length)
      }
      const cartProductsObj=cartProducts.map((data)=>{
          return{
            productId:data.productId,
            name:data.productName,
            catType:data.productCategory,
            description:data.description,
            quantity:data.quantity,
            price:data.offerPrice ? data.offerPrice : data.price,
            discountPrice:data.offerPrice ? (data.offerPrice*data.quantity)-couponDiscount: (data.price*data.quantity)-couponDiscount,
            images:data.images,
            orderStatus:"Placed",
            orderedDate:Date.now()
          }  
      })
      cartProducts.map((data)=>{
        discountTotal+=data.offerDiscount
      })
      const addressDetails=await userhelper.getOrderAddress(addressId,userId)
      const addressObj={
        addressType:addressDetails[0].addressType,
        addressLine1:addressDetails[0].addressLine1,
        addressLine2:addressDetails[0].addressLine2,
        city:addressDetails[0].city,
        state:addressDetails[0].state,
        country:addressDetails[0].country,
        pincode:addressDetails[0].pincode,
        landmark:addressDetails[0].landmark,      
      }
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      const orderId=`#${randomNumber}`
      const orderObj={
        orderId:orderId,
        userId:userId,
        orderedProducts:cartProductsObj,
        address:addressObj,
        totalPrice:totalAmount,
        paymentMethod:payment,
        couponCode:couponCode=="null" ? "No coupon" : couponCode,
        offerDiscount:discountTotal,
        orderStatus:"Placed"
      }
      userhelper.placeCartOrder(orderObj,userId).then((response)=>{
        if(response.status===true){
          userhelper.updateProductStock(cartProducts).then((response)=>{
            if(response.status){
              res.json({status:true})
            }
          })
        }else if(response.status==="PENDING_PAYMENT"){
          res.json({status:response.status,orderId:response.orderId,key:response.key,amount:response.amount,data:response.data})
        }else if(response.status===false){
          res.json({status:false,message:response.message})
        }
      })
      }else{
        res.json({noUserDetail:true})
      }
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  orderPage:async(req,res)=>{
    try {
      const fullOrders=await userhelper.getOrders(req.session.user._id)
      if(fullOrders.length!=0){
      const plainObj=fullOrders.map((data,index)=>{
        return{
          key:index+1,
          _id:data._id,
          orderId:data.orderId,
          isNotReturned:data.orderedProducts.every((product)=>product.orderStatus!="Return"),
          isNotDelivered:data.orderedProducts.every((product)=>product.orderStatus!="Delivered"),
          isCheck:data.orderedProducts.some((product)=>product.orderStatus=="Placed" || product.orderStatus=="Shipped" || product.orderStatus=="outForDelivery" || product.orderStatus=="Delivered") && data.orderedProducts.length>=1 ? true :false,
          isPending:data.orderStatus=="Pending",
          products:data.orderedProducts.map((product)=>{
            return{
              productId:product.productId,
              name:product.name,
              quantity:product.quantity,
              totalPrice:product.price*product.quantity,
              image:product.images,
              category:product.catType,
              isPlaced:product.orderStatus=="Placed",
              isShipped:product.orderStatus=="Shipped",
              isOutForDelivery:product.orderStatus=="outForDelivery",
              isPending:product.orderStatus=="Pending",
              isDelivered:product.orderStatus=="Delivered",
              isCancelled:product.orderStatus=="Cancelled",
              isReturned:product.orderStatus=="Return",
              isNotPending:product.orderStatus!="Pending",
            }
          })
        }
      })
      res.render('users/orderPage',{user:req.session.user,data:plainObj})
     }else{
      res.render('users/orderPage',{user:req.session.user})
     }
    } catch (error) {
      console.log(error)
      res.status(500).send("Error occured page not rendering")
    }
  },

  viewOrderDetailsPage:async(req,res)=>{
    try {
      const order=await userhelper.getSingleProductFromOrder(req.params.orderId)
      const date=new Date(order.orderDate).toISOString().split('T')[0]
      const orderObj={
          _id:order._id,
          orderId:order.orderId,
          orderItems:order.orderedProducts.length,
          orderStatus:order.orderStatus,
          orderDate:date,
          products:order.orderedProducts.map((product)=>{
            let expectDate=new Date(product.orderedDate)
            expectDate.setDate(expectDate.getDate()+7)
            let formatExpectDate=new Date(expectDate).toISOString().split("T")[0]
            return{
              name:product.name,
              category:product.catType,
              productStatus:product.orderStatus,
              price:product.price,
              quantity:product.quantity,
              image:product.images,
              expectedDate:formatExpectDate,
              deliveredDate:product.deliveredDate
            }
          })
        }
      const orderAddress=await userhelper.getOrderSingleProductAddress(req.params.orderId)
      const orderTrackDetails=await userhelper.trackOrderDetails(req.params.orderId)
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const orderDate = new Date(orderTrackDetails.orderDate)
      orderDate.setDate(orderDate.getDate() + 7)
      const expectedDate = orderDate.toLocaleDateString('en-GB', options)
      const orderTrackObj={
        status:orderTrackDetails.orderStatus,
        date:date,
        isPlaced:orderTrackDetails.orderStatus=="Placed",
        isShipped:orderTrackDetails.orderStatus=="Shipped",
        isOutForDelivery:orderTrackDetails.orderStatus=="outForDelivery",
        isDelivered:orderTrackDetails.orderStatus=="Delivered",
        isPending:orderTrackDetails.orderStatus=="Pending",
        shippedDate:orderTrackDetails.orderedProducts[0].shippedDate,
        arrivedDate:orderTrackDetails.orderedProducts[0].arrivedDate,
        deliveredDate:orderTrackDetails.orderedProducts[0].deliveredDate,
        placedDate:new Date(orderTrackDetails.orderDate).toISOString().split('T')[0],
        expectedDate:expectedDate,
        paymentMethod:orderTrackDetails.paymentMethod,
        subTotal:orderTrackDetails.totalPrice-150,
        totalPrice:orderTrackDetails.totalPrice,
      }
      res.render('users/orderviewPage',{user:req.session.user,address:orderAddress,data:orderObj,track:orderTrackObj})
    } catch (error) {
      console.log(error)
      res.status(500).send("Error occured page not rendering")
    }
  },

  cartOrderCancel:async(req,res)=>{
    try {
      const updateProductCount=await userhelper.updateProductCount(req.params.productId,req.params.quantity)
      userhelper.findOrderPaymentMethod(req.params.orderId).then((response)=>{
        if(response=="Online"){
          userhelper.addToWallet(req.params.productId,req.params.orderId,req.session.user._id,"Cancelled").then((response)=>{
            userhelper.updateOrderTotalPrice(req.params.orderId).then((response)=>{
              userhelper.cartOrderCancel(req.params.productId,req.params.orderId,req.params.reason).then((response)=>{
                userhelper.returnProductUpdateQuantity(req.params.productId,req.params.quantity).then((response)=>{
                  if(response.status){
                    res.json({status:true})
                  }else{
                    res.json({status:false})
                  }
                })
              })
            })
          })
        }else{
          userhelper.cartOrderCancel(req.params.productId,req.params.orderId,req.params.reason).then((response)=>{
            userhelper.returnProductUpdateQuantity(req.params.productId,req.params.quantity).then((response)=>{
              userhelper.updateOrderTotalPrice(req.params.orderId).then((response)=>{
              if(response.status){
                res.json({status:true})
              }else{
                res.json({status:false})
              }
            })
          })
        })
        }
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  fullOrderCancel:(req,res)=>{
    try {
      userhelper.fullOrderCancel(req.params.orderId,req.params.reason).then((response)=>{
        if(response.status){
          res.status(200).json({status:true,message:response.message})
        }else{
          res.status(400).json({status:false,message:response.message})
        }
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  returnOrder:async(req,res)=>{
    try {
      const updateProductCount=await userhelper.updateProductCount(req.params.productId,req.params.quantity)
      userhelper.returnOrder(req.params.productId,req.params.orderId,req.params.reason).then((response)=>{
        userhelper.returnProductUpdateQuantity(req.params.productId,req.params.quantity).then((response)=>{
          userhelper.addToWallet(req.params.productId,req.params.orderId,req.session.user._id,"Return").then((response)=>{
            if(response.status){
              res.json({status:true})
            }
          })
        })
      })
    } catch (error) {
      res.status(500).send(`Error occured ${error}`)
    }
  },

  addToWishlist:async(req,res)=>{
    try {
      if(req.session.user==undefined){
        res.json({status:false,message:"Can't add product to wislist"})
      }else{
        userhelper.addToWishlist(req.session.user._id,req.params.productId).then((response)=>{
          if(response.status){
            res.status(200).json({status:true})
          }else{
            res.status(400).json({status:false,message:"Product not addedd to wishlist"})
          }
        })
      }
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  removeFromWish:(req,res)=>{
    try {
      userhelper.removeFromWish(req.session.user._id,req.params.productId).then((response)=>{
        if(response.status){
          res.json({status:true,message:"Product removed from wishlist"})
        }else{
          res.json({status:false,message:"Product not removed from wishlist"})
        }
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  getAllCoupon:(req,res)=>{
    try {
      userhelper.getAllCoupon().then((data)=>{
        plainObj=data.map((data)=>{
          const startDate=new Date(data.startDate)
          const endDate=new Date(data.endDate)
          const formatStartDate=startDate.toISOString().split('T')[0]
          const formatEndDate=endDate.toISOString().split('T')[0]
          return{
              _id:data._id,
              name:data.name,
              code:data.code,
              discountValue:data.discountValue,
              startDate:formatStartDate,
              endDate:formatEndDate
          }
      })
      res.status(200).json(plainObj)
      })
    } catch (error) {
      res.status(400).send("Error occured")
    }
  },

  applyCoupon:(req,res)=>{
    try {
      userhelper.applyCoupon(req.params.couponCode,req.session.user._id,req.params.totalAmount).then((response)=>{
        if(response.status){
          res.status(200).json({status:true,amount:response.amount})
        }else{
          res.status(400).json({status:false,message:response.message})
        }
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  verifyPayment:async(req,res)=>{
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature,data} = req.body;

    try {
        const hmac = crypto.createHmac('sha256', razorpay.key_secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest('hex');

       
        if (generatedSignature === razorpay_signature) {
          userhelper.addOrder(data,req.session.user._id).then(async(response)=>{
            if(response.status){
              const products=await userhelper.findRepayOrder(data)
              userhelper.updateProductStock(products.orderedProducts).then((response)=>{
                if(response.status){
                  res.json({status:true, message: 'Payment verified successfully!'});
                }
              })
            }
          })
        } else {

            res.status(400).json({ status:false, message: 'Payment verification failed!'});
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({status: 'failure', message: 'Server error during payment verification'});
    }
  },

  walletPage:async(req,res)=>{
    try {
      const walletAmount=await userhelper.findWalletAmount(req.session.user._id)
      const walletHistory=await userhelper.getWalletHistory(req.session.user._id)
      let plainObj
      if(walletHistory.length!=0){
        plainObj=walletHistory.map((data)=>{
          let date=new Date(data.date).toISOString().split('T')[0]
          return{
            date:date,
            description:data.description,
            amountType:data.amountType,
            amount:data.amount
          }
        })
      }
      res.render('users/walletPage',{walletAmount,data:plainObj,user:req.session.user})
    } catch (error) {
      console.log(error)
      res.status(500).send("Error occured page not rendering")
    }
  },

  removeCoupon:(req,res)=>{
    try {
      userhelper.removeCoupon(req.session.user._id).then((response)=>{
        if(response.status){
          res.status(200).json({status:true,message:"Coupon removed"})
        }else{
          res.status(200).json({status:false,message:"Coupon not removed"})
        }
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  },

  rePayment:async(req,res)=>{
    try {
      const data=await userhelper.findOrder(req.params.orderId)
      const razorpayOrder = await razorpay.orders.create({
        amount: data.totalPrice * 100,
        currency: "INR",
        receipt: `receipt_${new Date().getTime()}`
    })
    res.json({status: 'PENDING_PAYMENT',
      orderId: razorpayOrder.id,
      key: razorpay.key_id,amount:data.totalPrice*100,data:data.orderId})
    } catch (error) {
      res.status(500).send("Error occured")
    }
  }
}