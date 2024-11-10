const express = require('express');
const router = express.Router();
const productcontroller=require('../controllers/productController')

function isAuthenticated(req, res, next) {
    if (req.session.user) {
       next(); 
    } else {
      res.redirect('/users/login');
    }
  }

router.get('/productlist',productcontroller.productList)

router.get('/productsByCategory/:cat',productcontroller.productByCategory)

router.get('/productPage/:id',productcontroller.productPage)

router.get('/productSearch',productcontroller.productSearch)

router.get('/wishlist',productcontroller.wishList)

router.get('/offerSection',productcontroller.offerPage)

router.get('/cartPage',isAuthenticated,productcontroller.cartPage)

router.get('/searchproducts/:item',productcontroller.searchProducts)

router.get('/sortproduct/:value',productcontroller.sortProductByPrice)

router.get('/sortSearchProduct/:value/:item',productcontroller.sortSearchProductByPrice)

router.get('/filterproducts/:cat/:price',productcontroller.filterProducts)




module.exports = router;
