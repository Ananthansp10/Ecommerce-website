const express = require('express');
const router = express.Router();
const usercontroller=require('../controllers/userController')
const userhelper=require('../helpers/usershelpers')

//middleware for user checking

function userCheck(req,res,next){
  if(req.session.user){
    next()
  }
  else{
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.redirect('/')
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
  

router.get('/',checkUserStatus, usercontroller.userHomePage)

module.exports = router;
