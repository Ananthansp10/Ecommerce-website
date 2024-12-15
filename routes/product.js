const express = require('express');
const router = express.Router();
const productcontroller=require('../controllers/productController')
const userhelper=require('../helpers/usershelpers')

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

router.get('/productlist',checkUserStatus,productcontroller.productList)

router.get('/productsByCategory/:cat',checkUserStatus,productcontroller.productByCategory)

router.get('/productPage/:id',checkUserStatus,productcontroller.productPage)

router.get('/productSearch',checkUserStatus,productcontroller.productSearch)

router.get('/wishlist',isAuthenticated,productcontroller.wishList)

router.get('/offerSection',productcontroller.offerPage)

router.get('/cartPage',isAuthenticated,checkUserStatus,productcontroller.cartPage)

router.get('/searchproducts/:item',checkUserStatus,productcontroller.searchProducts)

router.get('/sortproduct/:value',productcontroller.sortProductByPrice)

router.get('/sortSearchProduct/:value/:item',productcontroller.sortSearchProductByPrice)

router.get('/filterproducts/:cat/:price',productcontroller.filterProducts)

router.get('/viewvariant/:productId/:variantId',productcontroller.viewVariant)




module.exports = router;
