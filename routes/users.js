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

router.get('/userdetails',usercontroller.userDetailsPage)

router.post('/userdetails',upload.single('image'),usercontroller.addUserDetails)

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