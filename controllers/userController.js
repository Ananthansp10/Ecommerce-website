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

  userDetailsPage:(req,res)=>{
    try {
      res.render('users/userdetailsPage', { user: req.session.user });
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
      const products = await producthelper.getProducts();
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
      }
      if(userprofile){
      res.render('users/index', { user: req.session.user, products: plainProducts,userprofile });
      }
      else{
        res.render('users/index', { user: req.session.user, products: plainProducts});
      }
  } catch (error) {
      console.error("Error in userHomePage:", error);
      res.redirect('/');
  }
},

  addUserDetails:(req,res)=>{
    const{name,phone,addressType,location,houseNumber,pincode,city,state,country}=req.body;
    const userId=req.session.user._id;
    const image=req.file.path;
    const userObj={
      name:name,
      phoneNumber:phone,
      location:location,
      houseNumber:houseNumber,
      pincode:pincode,
      city:city,
      state:state,
      country:country,
      addressType:addressType,
      image:image,
      userId:userId
    }
    userhelper.addUserDetails(userObj).then(()=>{
      res.redirect('/')
    })
  }
}