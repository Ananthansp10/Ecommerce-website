const express=require('express');
const router=express.Router();
const upload=require('../config/cloudinary');
const adminhelper=require('../helpers/adminhelpers');
const admincontroller=require('../controllers/adminController');

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

router.post('/deleteProduct/:id',admincontroller.adminDeleteProduct)

router.get('/category',admincontroller.categoryPage)

router.get('/orderlist',admincontroller.adminOrderListPage)

router.get('/orderedit',admincontroller.adminOrderEditPage)

router.get('/coupon',admincontroller.couponPage)

router.get('/productcategory/:value',admincontroller.productByCategory)

router.get('/addCategory',admincontroller.addcategoryPage)

router.post('/addcategory',upload.array('images',4),admincontroller.categorysubmission)

router.get('/editcategory/:id',admincontroller.editCategoryPage)

router.post('/editcategory/:id',upload.array('image',4),admincontroller.editCategory)

router.post('/deletecategory/:id',admincontroller.deleteCategory)

router.post('/blockcategory/:id/:value',admincontroller.blockCategory)


module.exports=router;