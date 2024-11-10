const adminhelper=require('../helpers/adminhelpers')

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
            res.render('admin/dashboardPage', {admin:true,usersCount});
        } catch (error) {
            res.status(500).send('Error rendering dashboard page');
        }
    },

    customerPage:async(req,res)=>{
        try {
            const user = await adminhelper.getUser();
            const userplainObj = user.map(data => {
                const status = data.status; 
                return {
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    verified: data.verified,
                    status: data.status,
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
            const{ name, catType, price, stock, colour, description } = req.body;
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
                visiblity: true
            };
    
            const response = await adminhelper.addProduct(newProduct);
            if (response.status) {
                res.redirect('/admin/products');
            } else {
                res.status(400).send('Failed to add product');
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
                images: productDetails[0].images
            };
        
            const categoryOption = {
                isMobile: productDetails[0].catType === "mobile",
                isAccessories: productDetails[0].catType === "accessories"
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
            adminhelper.editProduct(productId,data,imageUrls).then(()=>{
                res.redirect('/admin/products')
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

    adminOrderListPage:(req,res)=>{
        try {
            res.render('admin/orderlistPage', { admin: true });
        } catch (error) {
            res.status(500).send('Error rendering order list page');
        }
    },

    adminOrderEditPage:(req,res)=>{
        try {
            res.render('admin/ordereditPage', { admin: true });
        } catch (error) {
            res.status(500).send('Error rendering order edit page');
        }
    },

    couponPage:(req,res)=>{
        try {
            res.render('admin/couponaddPage', { admin: true });
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
                res.render('admin/categoryaddpage',{admin:true})
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
        }
    
}