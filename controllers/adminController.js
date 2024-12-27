const { response } = require('express');
const adminhelper=require('../helpers/adminhelpers')
const offerhelper=require('../helpers/offerhelpers')

module.exports={
    adminLogin:(req,res,next)=>{
        if(req.session.adminLoggedIn){
            next();
        }
        else{
            res.redirect('/admin/login')
        }
    },
    adminDashboardSection:async(req,res)=>{
        try {
            const usersCount=await adminhelper.getUserCount()
            const totalAmount=await adminhelper.getOrderTotalAmount()
            const monthlyAmount=await adminhelper.getMonthlyRevenue()
            const topProducts=await adminhelper.findTopProducts()
            const topCategories=await adminhelper.findTopCategories()
            const salesChart=await adminhelper.getSalesChart()
            const plainObj=topProducts.map((data)=>{
                return{
                    name:data.name,
                    images:data.images,
                    count:data.purchaseCount
                }
            })
            const obj=topCategories.map((data)=>{
                return{
                    name:data.name,
                    count:data.purchaseCount,
                    image:data.image
                }
            })
            res.render('admin/dashboardPage', {admin:true,usersCount,top:plainObj,cat:obj,totalAmount,monthlyAmount,salesChart: JSON.stringify(salesChart)})
        } catch (error) {
            console.log(error)
            res.status(500).send('Error rendering dashboard page');
        }
    },

    customerPage:async(req,res)=>{
        try {
            const user = await adminhelper.getUser();
            const userplainObj = user.map(data => {
                const options = {day: '2-digit', month: '2-digit', year: 'numeric'}
                const date=new Date(data.createdAt).toLocaleDateString('en-GB',options)
                const status = data.status; 
                return {
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    verified: data.verified,
                    status: data.status,
                    date:date,
                    isBlock: status === "Block",
                    isUnBlock: status === "Unblock"
                };
            });
            res.render('admin/customersPage', { admin: true, user: userplainObj });
        } catch (error) {
            res.status(500).send('Error rendering customers page');
        }
    },

    userControl:async(req,res)=>{
        try {
            await adminhelper.blockUser(req.params.id, req.params.status);
            res.json(true);
        } catch (error) {
            res.status(500).json({ error: 'Error blocking/unblocking user' });
        }
    },

    adminLoginPage:(req,res)=>{
        try {
            const errorMessaggge = req.session.errorMessaggge;
            req.session.errorMessaggge = null;
            res.render('admin/adminLoginPage', {adminLog:true, message: errorMessaggge || null });
        } catch (error) {
            res.status(500).send('Error rendering admin login page');
        }
    },

    adminLoginSubmission:async(req,res)=>{
        try {
            const response = await adminhelper.adminLogin(req.body);
            if (response.status) {
                req.session.adminLoggedIn = true;
                res.redirect('/admin/');
            } else {
                req.session.errorMessaggge = "Not found";
                res.redirect('/admin/login');
            }
        } catch (error) {
            req.session.errorMessaggge = "An error occurred during login";
            res.redirect('/admin/login');
        }
    },

    adminLogout:(req,res)=>{
        try {
            if(req.session.adminLoggedIn){
                delete req.session.adminLoggedIn;
                res.redirect('/admin/login')
            }
        } catch (error) {
            res.status(500).send("Error occured")
        }
    },

    adminProductPage:async(req,res)=>{
        try {
            const products = await adminhelper.getProducts();
            const plainProducts = products.map(product => ({
                _id: product._id,
                name: product.name,
                catType:product.catType,
                images: product.images,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category
            }));
            res.render('admin/productPage', { admin: true, products: plainProducts });
        } catch (error) {
            res.status(500).send('Error rendering product page');
        }
    },

    adminAddProductPage:(req,res)=>{
        try {
            res.render('admin/addProductPage', { admin: true });
        } catch (error) {
            res.status(500).send('Error rendering add product page');
        }
    },

    adminProductSubmission:async(req,res)=>{
        try {
            const{name, catType, price, stock, colour, description,storage} = req.body;
            const newprice=parseInt(price)
            const newstock=parseInt(stock)
            const imageUrls = req.files.map(file => file.path);
            const findCatId=await adminhelper.getCatId(catType)
            const newProduct = {
                name,
                catType,
                category:findCatId,
                price:newprice,
                stock:newstock,
                colour,
                description,
                images: imageUrls,
                visiblity: true,
                storage
            };
    
            const response = await adminhelper.addProduct(newProduct);
            if (response.status) {
                res.status(200).json({status:true,message:"Product addedd successfully"})
            } else {
                res.status(400).json({status:false,message:"Product not addedd"})
            }
        } catch (error) {
            console.log(error)
            res.status(500).send('Error adding product');
        }
    },

    adminEditProductPage:async(req,res)=>{
        try {
            const productId = req.params.id;
            const productDetails = await adminhelper.findProduct(productId);
            
            const productObj = {
                _id: productDetails[0]._id,
                name: productDetails[0].name,
                category: productDetails[0].category,
                price: productDetails[0].price,
                stock: productDetails[0].stock,
                colour: productDetails[0].colour,
                description: productDetails[0].description,
                images: productDetails[0].images,
                storage:productDetails[0].storage
            };
        
            const categoryOption = {
                isMobile: productDetails[0].catType === "mobile",
                isAccessories: productDetails[0].catType === "accessory"
            };
            
            res.render('admin/editProductPage', { admin: true, product: productObj, categoryOption });
        } catch (error) {
            res.status(500).send('Error rendering edit product page');
        }
    },
    
    adminEditProductSubmission:async(req,res)=>{
        try {
            const productId = req.params.id;
            const data=req.body;
            const imageUrls=req.files.map(file=>file.path)
            adminhelper.editProduct(productId,data,imageUrls).then((response)=>{
               if(response.status){
                res.status(200).json({status:true,message:"Product edited successfully"})
               }else{
                res.status(400).json({status:false,message:"Product not edited"})
               }
            })
        } catch (error) {
            res.status(500).send('Error rendering edit product page');
        }
    },

    adminDeleteProduct:async(req,res)=>{
        try {
            const data = await adminhelper.deleteProduct(req.params.id);
            if (data.modifiedCount > 0) {
                res.json({ status: true });
            } else {
                res.json({ status: false });
            }
        } catch (error) {
            res.status(500).json({ status: false, error: 'Error deleting product' });
        }
    },

    adminOrderListPage:async(req,res)=>{
        try {
            const orders=await adminhelper.findOrders()
            const orderObj=orders.map((data,index)=>{
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                const date = new Date(data.orderDate).toLocaleDateString('en-GB', options);
                return{
                    orderId:data._id,
                    ordId:data.orderId,
                    userId:data.userId,
                    orderStatus:data.orderStatus,
                    orderDate:date,
                    totalPrice:data.totalPrice,
                    key:index+1
                }
            })
            res.render('admin/orderlistPage',{admin: true,data:orderObj});
        } catch (error) {
            console.log(error)
            res.status(500).send('Error rendering order list page');
        }
    },

    adminOrderViewPage:async(req,res)=>{
        try {
            const orderUserDetails=await adminhelper.getOrderUserDetails(req.params.orderId)
            if(orderUserDetails.length!=0){
                const orderUserDetailsObj={
                    userName:orderUserDetails[0].userName,
                    email:orderUserDetails[0].email,
                    number:orderUserDetails[0].number,
                    address1:orderUserDetails[0].address1,
                    address2:orderUserDetails[0].address2,
                    city:orderUserDetails[0].city,
                    state:orderUserDetails[0].state,
                    country:orderUserDetails[0].country,
                    pincode:orderUserDetails[0].pincode,
                    landmark:orderUserDetails[0].landmark
                }
                const orderSummary=await adminhelper.getorderSummary(req.params.orderId)
                const orderCount=orderSummary.length;
                let totalAmount=orderSummary[0].totalPrice
                const couponUsed=orderSummary[0].couponCode
                const paymentMethod=orderSummary[0].paymentMethod
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                const date = new Date(orderSummary[0].orderDate).toLocaleDateString('en-GB', options);
                const orderDate=date
                const orderProductDetails=await adminhelper.findOrderProductDetails(req.params.orderId)
                const statusObj=orderProductDetails.map((data)=>{
                    return{
                    orderId:data.orderId,
                    isPlaced:data.orderStatus=="Placed",
                    isShipped:data.orderStatus=="Shipped",
                    isOutForDelivery:data.orderStatus=="outForDelivery",
                    isDelivered:data.orderStatus=="Delivered"
                    }
                })
                const orderProductsObj=orderProductDetails.map((data)=>{
                    return{
                        orderId:data.orderId,
                        productId:data.productId,
                        name:data.name,
                        colour:data.colour,
                        price:data.price,
                        quantity:data.quantity,
                        images:data.images,
                        totalPrice:data.price*data.quantity,
                        isPlaced:data.orderStatus=="Placed",
                        isShipped:data.orderStatus=="Shipped",
                        isOutForDelivery:data.orderStatus=="outForDelivery",
                        isDelivered:data.orderStatus=="Delivered",
                        status:data.orderStatus
                    }
                })
                res.render('admin/orderviewPage',{admin:true,userdata:orderUserDetailsObj,orderCount,paymentMethod,couponUsed,totalAmount,orderDate,products:orderProductsObj,status:statusObj});
            }else{
                const orderSummary=await adminhelper.getorderSummary(req.params.orderId)
                const orderCount=orderSummary.length;
                const totalAmount=orderSummary[0].totalPrice
                const paymentMethod=orderSummary[0].paymentMethod
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                const date = new Date(orderSummary[0].orderDate).toLocaleDateString('en-GB', options);
                const orderDate=date
                const orderProductDetails=await adminhelper.findOrderProductDetails(req.params.orderId)
                const statusObj=orderProductDetails.map((data)=>{
                    return{
                    orderId:data.orderId,
                    isPlaced:data.orderStatus=="Placed",
                    isShipped:data.orderStatus=="Shipped",
                    isOutForDelivery:data.orderStatus=="outForDelivery",
                    isDelivered:data.orderStatus=="Delivered"
                    }
                })
                const orderProductsObj=orderProductDetails.map((data)=>{
                    return{
                        orderId:data.orderId,
                        productId:data.productId,
                        name:data.name,
                        colour:data.colour,
                        price:data.price,
                        quantity:data.quantity,
                        images:data.images,
                        totalPrice:data.price*data.quantity,
                        status:data.orderStatus
                    }
                })
                res.render('admin/orderviewPage',{admin:true,orderCount,totalAmount,couponUsed,paymentMethod,orderDate,products:orderProductsObj,status:statusObj});
            }
        } catch (error) {
            console.log(error)
            res.status(500).send('Error rendering order view page');
        }
    },

    couponPage:(req,res)=>{
        try {
            let plainObj
            adminhelper.findAllCoupons().then((data)=>{
                plainObj=data.map((data)=>{
                    const startDate=new Date(data.startDate)
                    const endDate=new Date(data.endDate)
                    const formatStartDate=startDate.toISOString().split('T')[0]
                    const formatEndDate=endDate.toISOString().split('T')[0]
                    return{
                        _id:data._id,
                        name:data.name,
                        code:data.code,
                        discountValue:data.discountValue,
                        startDate:formatStartDate,
                        endDate:formatEndDate
                    }
                })
                res.render('admin/couponaddPage', { admin: true,data:plainObj });
            })
        } catch (error) {
            res.status(500).send('Error rendering coupon add page');
            }    
        },

        productByCategory:(req,res)=>{
            try {
               adminhelper.productByCategory(req.params.value).then((products)=>{
                const plainobj=products.map((products)=>({
                        _id:products._id,
                        name:products.name,
                        catType:products.catType,
                        images:products.images,
                        stock:products.stock,
                        description:products.description,
                        price:products.price,
                        category:products.category
                    
                }))
                res.render('admin/productPage',{products:plainobj,admin:true})
               })
            } catch (error) {
                res.status(500).send('Error rendering product page');
            }
        },

        categoryPage:async(req,res)=>{
            try {
                const category= await adminhelper.findCategory()
                const plainObj=category.map((cat,index)=>({
                    _id:cat._id,
                    name:cat.name,
                    image:cat.image,
                    isBlock:cat.isBlock,
                    visiblity:cat.visiblity,
                    key:index+1
                }))
                res.render('admin/categoryPage',{admin:true,category:plainObj})
            } catch (error) {
                res.status(500).send("Error rendering category page")
            }
        },

        addcategoryPage:(req,res)=>{
            try {
                res.render('admin/categoryaddPage',{admin:true})
            } catch (error) {
                res.status(500).send("Error rendering category add page")
            }
        },

        categorysubmission:(req,res)=>{
            try {
                const{categoryName}=req.body
                const imageUrl=req.files.map(file=>file.path)
                adminhelper.addCategory(categoryName,imageUrl).then(()=>{
                    res.redirect('/admin/category')
                })
            } catch (error) {
                res.status(500).send("Error occur in category adding")
            }
        },

        editCategoryPage:async(req,res)=>{
            try {
                const catdetails= await adminhelper.findcatdetails(req.params.id)
                const plainObj={
                    _id:catdetails._id,
                    name:catdetails.name,
                    image:catdetails.image
                }
                res.render('admin/editCategoryPage',{admin:true,category:plainObj})
            } catch (error) {
               res.status(500).send("Error occured") 
            }
        },

        editCategory:(req,res)=>{
            try {
                const name=req.body.categoryName
                const imageUrl=req.files.map(file=>file.path)
                adminhelper.editCategory(name,imageUrl,req.params.id).then(()=>{
                    res.redirect('/admin/category')
                })
            } catch (error) {
                res.status(500).send("Error occured")
            }
        },

        deleteCategory:(req,res)=>{
            try {
                adminhelper.deleteCategory(req.params.id).then(()=>{
                    res.json({status:true})
                })
            } catch (error) {
                res.status(500).send("Error occured")
            }
        },

        blockCategory:(req,res)=>{
            try {
               adminhelper.blockCategory(req.params.id,req.params.value).then(()=>{
                res.json({status:true})
               })
            } catch (error) {
               res.status(500).send("Error occured") 
            }
        },

        changeOrderStatus:(req,res)=>{
            try {
                adminhelper.changeOrderStatus(req.params.orderId,req.params.status).then((response)=>{
                    if(response.status){
                        res.json({status:true})
                    }else{
                        res.json({status:false})
                    }
                })
            } catch (error) {
                res.status(500).send("Error occured")
            }
        },

        addCoupon:(req,res)=>{
            try {
                const obj={
                    name:req.body.name,
                    code:req.body.code,
                    discountValue:req.body.discountValue,
                    minimumPrice:req.body.minimumPrice,
                    startDate:req.body.startDate,
                    endDate:req.body.endDate,
                    description:req.body.description,
                    isActive:true
                }
                adminhelper.addCoupon(obj).then((response)=>{
                    if(response.status){
                        res.status(200).json({status:true,message:"Coupon addedd successfully"})
                    }else{
                        res.status(400).json({status:false,message:response.message})
                    }
                })
            } catch (error) {
               res.status(500).send("Error occured") 
            }
        },

        editCouponPage:async(req,res)=>{
            try {
                const findCouponToEdit=await adminhelper.findCouponToEdit(req.params.couponCode)
                const formatStartDate=findCouponToEdit.startDate.toISOString().split('T')[0]
                const formatEndDate=findCouponToEdit.endDate.toISOString().split('T')[0]
                const obj={
                    name:findCouponToEdit.name,
                    description:findCouponToEdit.description,
                    discountValue:findCouponToEdit.discountValue,
                    minimumPrice:findCouponToEdit.minimumPrice,
                    startDate:formatStartDate,
                    endDate:formatEndDate,
                    code:findCouponToEdit.code
                }
                let plainObj
                adminhelper.findAllCoupons().then((data)=>{
                plainObj=data.map((data)=>{
                    const startDate=new Date(data.startDate)
                    const endDate=new Date(data.endDate)
                    const formatStartDate=startDate.toISOString().split('T')[0]
                    const formatEndDate=endDate.toISOString().split('T')[0]
                    return{
                        _id:data._id,
                        name:data.name,
                        code:data.code,
                        discountValue:data.discountValue,
                        startDate:formatStartDate,
                        endDate:formatEndDate
                    }
                })
                res.render('admin/couponEditPage',{admin:true,data:plainObj,detail:obj})
            })
            } catch (error) {
               res.status(500).send("Error occured page not rendering") 
            }
        },

        editCoupon:(req,res)=>{
            try {
                const obj={
                    name:req.body.name,
                    code:req.body.code,
                    discountValue:req.body.discountValue,
                    minimumPrice:req.body.minimumPrice,
                    startDate:req.body.startDate,
                    endDate:req.body.endDate,
                    description:req.body.description,
                    isActive:true
                }
                adminhelper.editCoupon(obj,req.params.couponCode).then((response)=>{
                    if(response.status){
                        res.status(200).json({status:true,message:response.message})
                    }else{
                        res.status(400).json({status:response.message})
                    }
                })
            } catch (error) {
                res.status(500).send("Error occured")
            }
        },

        deleteCoupon:(req,res)=>{
            try {
               adminhelper.deleteCoupon(req.params.couponCode).then((response)=>{
                if(response.status){
                    res.status(200).json({status:true,message:"Coupon deleted"})
                }else{
                    res.status(400).json({status:false,message:"Coupon not deleted try again"})
                }
               }) 
            } catch (error) {
                res.status(500).send("Error occured")
            }
        },

        offerPage:async(req,res)=>{
            try {
                const offers=await offerhelper.findAllOffer()
                const plainObj=offers.map((data)=>{
                    return{
                        title:data.title,
                        description:data.description,
                        discountValue:data.discountValue,
                        image:data.image,
                        startDate:new Date(data.startDate).toISOString().split('T')[0],
                        endDate:new Date(data.endDate).toISOString().split('T')[0],
                        isActive:data.isActive,
                        category:data.applicable,
                        offerId:data._id,
                        isUsed:data.isUsed
                    }
                })
                res.render('admin/offersPage',{admin:true,offer:plainObj})
            } catch (error) {
               res.status(500).send("Error occured page not rendering") 
            }
        },

        addOfferPage:(req,res)=>{
            try {
                res.render('admin/offerAddPage',{admin:true})
            } catch (error) {
                res.status(500).send("Error occured page not rendering") 
            }
        },

        salesReportPage:async(req,res)=>{
            try {
                const totalAmount=await adminhelper.getOrderTotalAmount()
                const totalOrders=await adminhelper.getOrderTotal()
                const totalProducts=await adminhelper.getTotalProductsCount()
                const orderDetails=await adminhelper.getAllOrderDetails()
                const offerDiscountTotal=await adminhelper.getOfferDiscountTotal()
                res.render('admin/salesReportPage',{admin:true,totalAmount,totalOrders,totalProducts,orderDetails,offerDiscountTotal})
            } catch (error) {
                res.status(500).send("Error occured page not rendering")
            }
        },

        addVariantPage:async(req,res)=>{
            try {
               const isMobile=await adminhelper.getCategory(req.params.productId)
               console.log(isMobile)
               res.render('admin/addVariantPage',{admin:true,id:req.params.productId,name:req.params.productName,isMobile})
            } catch (error) {
                res.status(500).send("Error occured page not rendering")
            }
        },

        addVariant:(req,res)=>{
            try {
                const imageUrls=req.files.map((file)=>file.path)
                adminhelper.addVariant(req.body,req.params.productId,imageUrls).then((response)=>{
                    if(response.status){
                        res.status(200).json({status:true,message:response.message})
                    }else{
                        res.status(400).json({status:false,message:response.message})
                    }
                })
            } catch (error) {
                res.status(500).send("Error occured")
            }
        },

        deleteProductImage:(req,res)=>{
            try {
               adminhelper.deleteProductImage(req.params.productId,req.params.index).then((response)=>{
                if(response.status){
                    res.status(200).json({status:true})
                }else{
                    res.status(400).json({status:false})
                }
               })
            } catch (error) {
                res.status(500).send("Error occured")
            }
        },

        productOfferPage:(req,res)=>{
            try {
                res.render('admin/productOfferPage',{admin:true})
            } catch (error) {
                res.status(500).send("Error occured page not rendering")
            }
        },

        getDateData:async(req,res)=>{
            try {
              const data=await adminhelper.getDateData(req.params.from,req.params.end)
              let totalAmount=0
              let totalOrders=data.length
              let totalProducts=0
              let offerDiscountTotal=0
              let obj
              if(data.length!=0){
                obj=data.map((data,index)=>{
                    // totalAmount+=data.totalPrice
                    // offerDiscountTotal+=data.offerDiscount
                    totalAmount+=150
                    data.orderedProducts.map((products)=>{
                        if(products.orderStatus!=="Cancelled" && products.orderStatus!=="Return" && products.orderStatus!=="Pending"){
                            totalAmount+=products.price*products.quantity
                        }
                    })
                    data.orderedProducts.map((data)=>{
                        if(data.orderStatus!=="Cancelled" && data.orderStatus!=="Return" && data.orderStatus!=="Pending"){
                            totalProducts++
                        }
                    })
                    let date=new Date(data.orderDate).toISOString().split('T')[0]
                    return{
                        orderId:data.orderId,
                        status:data.paymentMethod,
                        date:date,
                        total:data.totalPrice,
                        key:index+1
                    }
                  })
                  res.render('admin/salesReportPage',{admin:true,orderDetails:obj,totalAmount,totalOrders,totalProducts,offerDiscountTotal})
              }else{
                res.render('admin/salesReportPage',{admin:true,orderDetails:obj})
              }
            } catch (error) {
               console.log(error)
               res.status(500).send("Error occured") 
            }
        },

        productOfferListPage:async(req,res)=>{
            try {
                const offers=await offerhelper.findAllProductOffer()
                const plainObj=offers.map((data)=>{
                    return{
                        title:data.title,
                        description:data.description,
                        discountValue:data.discountValue,
                        image:data.image,
                        startDate:new Date(data.startDate).toISOString().split('T')[0],
                        endDate:new Date(data.endDate).toISOString().split('T')[0],
                        isActive:data.isActive,
                        category:data.applicable,
                        offerId:data._id,
                        isUsed:data.isUsed
                    }
                })
                res.render('admin/productOfferList',{admin:true,offer:plainObj})
            } catch (error) {
                console.log(error)
                res.status(500).send("Error occured page not rendering")
            }
        },

        sortByOption:async(req,res)=>{
            try {
                const data=await adminhelper.sortByOption(req.params.value)
                let totalOrders=data.length
                let totalAmount=0
                let totalProducts=0
                let offerDiscountTotal=0
                let obj
                if(data.length!=0){
                    obj=data.map((data,index)=>{
                        totalAmount+=150
                        const date=new Date(data.orderDate).toISOString().split('T')[0]
                        data.orderedProducts.map((products)=>{
                            if(products.orderStatus!=="Cancelled" && products.orderStatus!=="Return" && products.orderStatus!=="Pending"){
                                totalAmount+=products.price*products.quantity
                                totalProducts++
                            }
                        })
                        // totalAmount+=data.totalPrice
                        offerDiscountTotal+=data.offerDiscount
                        // totalProducts+=data.orderedProducts.length
                        return{
                            orderId:data.orderId,
                            status:data.paymentMethod,
                            date:date,
                            total:data.totalPrice,
                            key:index+1
                        }
                    })
                }
                res.render('admin/salesReportPage',{admin:true,totalOrders,totalAmount,totalProducts,offerDiscountTotal,orderDetails:obj})
            } catch (error) {
                console.log(error)
                res.status(500).send("Error occured")
            }
        },

        sortChart:(req,res)=>{
            try {
               adminhelper.sortChart(req.params.value).then((data)=>{
                res.json(data)
               }) 
            } catch (error) {
               res.status(500).send("Error occured") 
            }
        }
    
}