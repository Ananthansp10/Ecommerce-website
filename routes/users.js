const express=require('express');
const router=express.Router();
const usercontroller=require('../controllers/userController')
const passport=require('passport');
const upload=require('../config/cloudinary');
//middleware for user checking

function userCheck(req,res,next){
    if(!req.session.user){
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      next()
    }
    else{
      res.redirect('/')
    }
  }

  function isAuthenticated(req, res, next) {
    if (req.session.user) {
       next(); 
    } else {
      res.redirect('/users/login');
    }
  }

  function checkUserStatus(req,res,next){
    if(req.session.user){
      userhelper.checkUserStatus(req.session.user._id).then((response)=>{
        if(response.status=="Unblock"){
          next()
        }else if(response.status=="Block"){
          req.session.destroy()
          res.redirect('/users/login')
        }
      })
    }else{
      next()
    }
  }
  
//route for login

router.get('/login',userCheck,usercontroller.loginsection)

// route after login submission
router.post('/login',usercontroller.loginsubmission)

//route for signup
router.get('/signup',usercontroller.signupsection)

//route after signup submission
router.post('/signup',usercontroller.signupsubmission)

// route for signup otp page
router.get('/signupOtpVerification',usercontroller.signupOtpPage)

router.post('/resend-signup-otp',usercontroller.resendOtp)

//route for signup otp verification
router.post("/signup-otp-verification",usercontroller.signupOtpVerification)

//route for forgott password page
router.get('/forgottenPassword',usercontroller.forgotPasswordPage)

//route after otp send
router.post('/forgottenPassword',usercontroller.forgotPasswordSubmission)

//route for forgott otp verification page
router.get('/forgottenPassword-Otp-Verification',usercontroller.forgotPasswordOtpVerificationPage)

//route for forgott password otp verification
router.post('/forgottenPassword-Otp-Verification',usercontroller.forgotPasswordOtpVerification)

//route for reset password page
router.get('/resetPassword',usercontroller.resetPasswordPage)

//route for reset password submission
router.post('/resetPassword',usercontroller.resetPasswordSubmission)

//route for user logout
router.get('/logout',usercontroller.logoutSection)

router.get('/userdetails',isAuthenticated,usercontroller.userDetailsPage)

router.get('/adduserdetails',usercontroller.addUserDetailsPage)

router.post('/adduserdetails',upload.single('image'),usercontroller.addUserDetails)

router.get('/edituserdetails',usercontroller.editUserDetailPage)

router.post('/edituserdetails/:userId',upload.single('image'),usercontroller.updateUserDetails)

router.get('/address',usercontroller.addressPage)

router.get('/addaddress',usercontroller.addAddressPage)

router.post('/addaddress',usercontroller.addAddress)

router.get('/editaddress/:userId/:addressId',usercontroller.editAddressPage)

router.post('/editaddress/:userId/:addressId',usercontroller.editAddress)

router.post('/deleteaddress/:userId/:addressId',usercontroller.deleteAddress)

router.get('/addtocart/:productId',usercontroller.addToCart)

router.post('/deletecartproduct/:productId',usercontroller.deleteCartProduct)

router.post('/updateproductquantity/:productId/:value',usercontroller.updateProductQuantity)

router.get('/checkout/:couponCode/:totalAmount',usercontroller.checkOutPage)

router.post('/addAddressFromCart',usercontroller.addAddressFromCart)

router.post('/placecartorder',usercontroller.placeCartOrder)

router.get('/orders',usercontroller.orderPage)

router.get('/vieworder/:productId/:orderId',usercontroller.viewOrderDetailsPage)

router.post('/cartordercancel/:productId/:orderId/:quantity/:reason',usercontroller.cartOrderCancel)

router.post('/returnorder/:productId/:orderId/:quantity/reason',usercontroller.returnOrder)

router.post('/addtowishlist/:productId',usercontroller.addToWishlist)

router.post('/removefromwish/:productId',usercontroller.removeFromWish)

router.get('/getallcoupons',usercontroller.getAllCoupon)

router.post('/applycoupon/:couponCode/:totalAmount',usercontroller.applyCoupon)

router.post('/removecoupon',usercontroller.removeCoupon)

router.post('/verify-payment',usercontroller.verifyPayment)

router.get('/wallet',usercontroller.walletPage)

router.post('/repayment/:orderId',usercontroller.rePayment)


//route for google authentication
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

//route for ggogle authentication verification
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/users/signup' }),
    usercontroller.googleAuthenticationVerification
)
  
  

module.exports=router;