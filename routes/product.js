const express = require('express');
const router = express.Router();
const productcontroller=require('../controllers/productController')

router.get('/productlist',productcontroller.productList)

router.get('/productsByCategory/:cat',productcontroller.productByCategory)

router.get('/productPage/:id',productcontroller.productPage)

router.get('/productSearch',productcontroller.productSearch)

router.get('/wishlist',productcontroller.wishList)

router.get('/offerSection',productcontroller.offerPage)

router.get('/cartPage',productcontroller.cartPage)





module.exports = router;
