const express=require('express');
const router=express.Router();
const upload=require('../config/cloudinary');
const admincontroller=require('../controllers/adminController');
const offercontroller=require('../controllers/offerController');

router.get('/',admincontroller.adminLogin,admincontroller.adminDashboardSection)

router.get('/customers',admincontroller.adminLogin,admincontroller.customerPage)

router.post('/blockuser/:id/:status',admincontroller.userControl)

router.get('/login',admincontroller.adminLoginPage)

router.post('/login',admincontroller.adminLoginSubmission)

router.get('/products',admincontroller.adminLogin,admincontroller.adminProductPage)

router.get('/addProducts',admincontroller.adminAddProductPage)

router.post('/addProducts',upload.array('images', 4),admincontroller.adminProductSubmission)

router.get('/editProducts/:id',admincontroller.adminEditProductPage)

router.post('/editProducts/:id',upload.array('images', 4),admincontroller.adminEditProductSubmission)

router.post('/deleteproductimage/:productId/:index',admincontroller.deleteProductImage)

router.post('/deleteProduct/:id',admincontroller.adminDeleteProduct)

router.get('/productcategory/:value',admincontroller.productByCategory)

router.get('/orderlist',admincontroller.adminOrderListPage)

router.get('/orderview/:orderId',admincontroller.adminOrderViewPage)

router.get('/coupon',admincontroller.couponPage)

router.post('/addcoupon',admincontroller.addCoupon)

router.get('/category',admincontroller.categoryPage)

router.get('/addCategory',admincontroller.addcategoryPage)

router.post('/addcategory',upload.array('images',4),admincontroller.categorysubmission)

router.get('/editcategory/:id',admincontroller.editCategoryPage)

router.post('/editcategory/:id',upload.array('image',4),admincontroller.editCategory)

router.post('/deletecategory/:id',admincontroller.deleteCategory)

router.post('/blockcategory/:id/:value',admincontroller.blockCategory)

router.post('/changeorderstatus/:orderId/:status',admincontroller.changeOrderStatus)

router.get('/editcoupon/:couponCode',admincontroller.editCouponPage)

router.post('/editcoupon/:couponCode',admincontroller.editCoupon)

router.post('/deletecoupon/:couponCode',admincontroller.deleteCoupon)

router.get('/offer',admincontroller.offerPage)

router.get('/addoffer',admincontroller.addOfferPage)

router.get('/categoryoffer',offercontroller.addCategoryOfferPage)

router.post('/addcategoryoffer',upload.array('image',1),offercontroller.addCategoryOffer)

router.post('/applyoffer/:offerId',offercontroller.applyOffer)

router.post('/deleteoffer/:offerId',offercontroller.deletOffer)

router.get('/salesreport',admincontroller.salesReportPage)

router.get('/addvariant/:productId/:productName',admincontroller.addVariantPage)

router.get('/productoffer',admincontroller.productOfferPage)

router.post('/addproductoffer',upload.array('image',1),offercontroller.addProductOffer)

router.get('/datesort/:from/:end',admincontroller.getDateData)

router.get('/productofferlist',admincontroller.productOfferListPage)

router.post('/applyproductoffer/:offerId',offercontroller.applyProductOffer)

router.post('/deleteproductoffer/:offerId',offercontroller.deleteProductOffer)


module.exports=router;