const userhelper=require('../helpers/usershelpers')
const producthelper=require('../helpers/producthelpers');
const { response } = require('express');
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

      if (response.status) {
          req.session.user = response.user;
          req.session.loggedIn = true;
          res.redirect('/');
      } else {
          req.session.errorMessage = response.message;
          res.redirect('/users/login');
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
    try {
      const addUserResponse = await userhelper.addUser(req.body);
      if (addUserResponse.status) {
        const otpResponse = await userhelper.otpGenerate(req.body.email);
        if (otpResponse.status) {
          res.render('users/signupOtpVerification');
        } 
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
          res.json({ success: true });
      } else {
          res.json({ success: false, message: "Failed to send OTP" });
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
          res.redirect('/users/login');
      } else {
          req.session.otpError = "OTP is wrong";
          res.redirect('/users/signupOtpVerification');
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
      await userhelper.changePassword(req.body, req.session.email);
      res.redirect('/users/login');
  } catch (error) {
      console.error("Error in resetPasswordSubmission:", error);
      res.redirect('/users/resetPassword');
  }
  },

  logoutSection:(req,res)=>{
    try {
      req.session.destroy();
      res.redirect('/');
  } catch (error) {
      console.error("Error in logoutSection:", error);
      res.redirect('/');
  }
  },

  userDetailsPage:async(req,res)=>{
    try {
      const userData=await userhelper.getuserData(req.session.user._id)
      if(userData){
        const plainObj={
          name:userData.name,
          email:userData.email,
          image:userData.image,
          userId:userData.userId,
          available:false
        }
        res.render('users/userdetailsPage', { user: req.session.user,userdata:plainObj})
      }else{
        const plainObj={
          available:true
        }
        res.render('users/userdetailsPage', { user: req.session.user,userdata:plainObj})
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
      const products = await producthelper.getProducts()
      if(req.session.user){
      cartLength=await producthelper.getCartLength(req.session.user._id)
      }
      const plainProducts = products.map(product => ({
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images
      }));
      let userprofile
      if(req.session.user){
      userprofile=await userhelper.findUserProfile(req.session.user._id);
      req.session.user.image=userprofile;
      }
      if(userprofile){
      res.render('users/index', { user: req.session.user, products: plainProducts,cartLength});
      }
      else{
        res.render('users/index', { user: req.session.user, products: plainProducts,cartLength});
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
        res.redirect('/users/checkout')
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
            image:productDetails.images
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
                  key:index+1
                }
              })
              let totalAmount=150
              let subTotal=0
              let total=cartProducts.map((data)=>{
                  let value=data.price*data.quantity
                  totalAmount+=value
                  subTotal+=value
              })
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
              res.render('users/checkoutPage', { user: req.session.user,data:plainObj,totalAmount,subTotal,cartLength,address:plainAddress});
            }else{
              let totalAmount=150
              let subTotal=0
              let total=cartProducts.map((data)=>{
                  let value=data.price*data.quantity
                  totalAmount+=value
                  subTotal+=value
              })
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
              res.render('users/checkoutPage', { user: req.session.user,data:plainObj,totalAmount,subTotal,cartLength});
            }
    } catch (error) {
      res.status(500).send("Error occured page not rendering")
    }
  },

  placeCartOrder:async(req,res)=>{
    try {
      const{addressId,cartId,totalAmount,payment}=req.body
      const userId=req.session.user._id
      const userDetail=await userhelper.findUserDetails(userId)
      if(userDetail){
      const cartProducts=await userhelper.getCartProducts(cartId)
      let cartTotal=150;
      const cartProductsObj=cartProducts.map((data)=>{
        cartTotal+=data.quantity*data.price
        return{
          productId:data.productId,
          name:data.productName,
          catType:data.productCategory,
          description:data.description,
          quantity:data.quantity,
          price:data.price,
          images:data.images,
          orderStatus:"Placed",
          orderedDate:Date.now()
        }
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
      const orderObj={
        userId:userId,
        orderedProducts:cartProductsObj,
        address:addressObj,
        totalPrice:cartTotal,
        paymentMethod:payment,
      }
      userhelper.placeCartOrder(orderObj,userId).then((response)=>{
        if(response.status){
          res.json({status:true})
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
      let orders = [];
      if (fullOrders && fullOrders.orderedProducts && fullOrders.orderedProducts.length > 0) {
        orders = fullOrders.orderedProducts;
      }
      if(orders.length!=0){
      const plainObj=orders.map((data,index)=>{
        return{
          orderId:fullOrders._id,
          productId:data.productId,
          productName:data.name,
          description:data.description,
          price:data.price,
          quantity:data.quantity,
          images:data.images,
          orderStatus:data.orderStatus,
          key:index+1,
        }
      })
      res.render('users/orderPage',{user:req.session.user,data:plainObj})
     }else{
      res.render('users/orderPage',{user:req.session.user})
     }
    } catch (error) {
      res.status(500).send("Error occured page not rendering")
    }
  },

  viewOrderDetailsPage:async(req,res)=>{
    try {
      const orderProducts=await userhelper.getSingleProductFromOrder(req.session.user._id,req.params.productId)
      const orderProductsObj={
        productId:orderProducts[0].productId,
        productName:orderProducts[0].name,
        catType:orderProducts[0].catType,
        description:orderProducts[0].description,
        quantity:orderProducts[0].quantity,
        price:orderProducts[0].price,
        images:orderProducts[0].images,
        orderStatus:orderProducts[0].orderStatus,
        orderedDate:orderProducts[0].orderedDate
      }
      const orderAddress=await userhelper.getOrderSingleProductAddress(req.params.orderId)
      const orderTrackDetails=await userhelper.trackOrderDetails(req.params.orderId,req.params.productId)
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const date = new Date(orderTrackDetails[0].orderDate).toLocaleDateString('en-GB', options);
      const orderDate = new Date(orderTrackDetails[0].orderDate)
      orderDate.setDate(orderDate.getDate() + 7)
      const expectedDate = orderDate.toLocaleDateString('en-GB', options)
      console.log(expectedDate)
      const orderTrackObj={
        status:orderTrackDetails[0].orderStatus,
        date:date,
        isPlaced:orderTrackDetails[0].orderStatus=="Placed",
        isShipped:orderTrackDetails[0].orderStatus=="Shipped",
        isOutForDelivery:orderTrackDetails[0].orderStatus=="outForDelivery",
        isDelivered:orderTrackDetails[0].orderStatus=="Delivered",
        shippedDate:orderTrackDetails[0].shippedDate,
        arrivedDate:orderTrackDetails[0].arrivedDate,
        deliveredDate:orderTrackDetails[0].deliveredDate,
        expectedDate:expectedDate
      }
      res.render('users/orderviewPage',{user:req.session.user,data:orderProductsObj,address:orderAddress,trackDetails:orderTrackObj,orderId:req.params.orderId})
    } catch (error) {
      res.status(500).send("Error occured page not rendering")
    }
  },

  cartOrderCancel:(req,res)=>{
    try {
      userhelper.cartOrderCancel(req.params.productId,req.params.orderId).then((response)=>{
        if(response.status){
          res.json({status:true})
        }else{
          res.json({status:false})
        }
      })
    } catch (error) {
      res.status(500).send("Error occured")
    }
  }
}