const express = require('express');
const router = express.Router();
const usercontroller=require('../controllers/userController')
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
router.get('/', usercontroller.userHomePage)

module.exports = router;
