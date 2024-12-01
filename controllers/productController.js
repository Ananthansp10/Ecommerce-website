const producthelpers = require('../helpers/producthelpers');
const usershelpers = require('../helpers/usershelpers');

module.exports={
    productList:async(req,res)=>{
        try {
            let cartLength=0;
            if(req.session.user){
                cartLength=await producthelpers.getCartLength(req.session.user._id)
            }
            const products = await producthelpers.getAllProducts();
            const plainProducts =await Promise.all(
                products.map(async(product)=>{
                    if(req.session.user!=undefined){
                        const findwish=await usershelpers.findWishProduct(req.session.user._id,product._id)
                        return{
                            _id: product._id,
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            images: product.images,
                            isDisabled:product.stock==0,
                            isOnWishList:findwish,
                            offerPrice:product.offerPrice ? product.offerPrice : false
                        }
                    }else{
                        return{
                            _id: product._id,
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            images: product.images,
                            isDisabled:product.stock==0,
                            isOnWishList:false,
                            offerPrice:product.offerPrice ? product.offerPrice : false
                        }
                    }
                })
            )
            res.render('products/productlist', { user: req.session.user, products: plainProducts,cartLength });
        } catch (error) {
            res.status(500).send('Error rendering product list');
        }
    },
    
    productByCategory:async(req,res)=>{
        try {
            let cartLength=0;
            if(req.session.user){
                cartLength=await producthelpers.getCartLength(req.session.user._id)
            }
            const products = await producthelpers.productByCat(req.params.cat)
            const plainProducts =await Promise.all(
                products.map(async(product)=>{
                    if(req.session.user!=undefined){
                        const findwish=await usershelpers.findWishProduct(req.session.user._id,product._id)
                        return{
                            _id: product._id,
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            images: product.images,
                            isOnWishList:findwish,
                            offerPrice:product.offerPrice ? product.offerPrice : false
                        }
                    }else{
                        return{
                            _id: product._id,
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            images: product.images,
                            isOnWishList:false,
                            offerPrice:product.offerPrice ? product.offerPrice : false
                        }
                    }
                })
            )
            res.render('products/productlist', { user: req.session.user, products: plainProducts,cartLength });
        } catch (error) {
            res.status(500).send('Error retrieving products by category');
        }
     },

     productPage:async(req,res)=>{
        try {
            let cartLength=0;
            if(req.session.user){
                cartLength=await producthelpers.getCartLength(req.session.user._id)
            }
            const productDetails = await producthelpers.viewProductDetails(req.params.id);
            let isMobile;
            if(productDetails.catType=="mobile"){
                isMobile=true;
            }
            const stockSize=productDetails.stock
            let outOfStock;
            let inStock;
            if(stockSize==0){
                outOfStock=true;
            }
            else{
                inStock=true;
            }
            let findwish
            if(req.session.user!=undefined){
                findwish=await usershelpers.findWishProduct(req.session.user._id,req.params.id)
            }
            const plainProduct = {
                _id: productDetails._id,
                name: productDetails.name,
                price: productDetails.price,
                description: productDetails.description,
                images: productDetails.images,
                isMobile:productDetails.catType=="mobile",
                stock: productDetails.stock,
                outOfStock:productDetails.stock==0,
                inStock:productDetails.stock>5,
                limitedStock:productDetails.stock<=5 && productDetails.stock>0,
                isOnWishList:findwish?findwish:false,
                offerPrice:productDetails.offerPrice ? productDetails.offerPrice :false
            };
            
            const colours = await producthelpers.getColourVariant(productDetails.name);
            let productColours = colours.map(prod => prod.images);
            
            res.render('products/productviewpage', { user: req.session.user, product: plainProduct, colours: productColours,cartLength });
        } catch (error) {
            res.status(500).send('Error retrieving product details');
        }
    },
    
    productSearch:async(req,res)=>{
        try {
            let cartLength=0;
            if(req.session.user){
                cartLength=await producthelpers.getCartLength(req.session.user._id)
            }
            res.render('products/productSearchPage', { user: req.session.user,cartLength });
        } catch (error) {
            res.status(500).send('Error rendering product search page');
        }
    },

    wishList:async(req,res)=>{
        try {
            const products=await usershelpers.getWishProducts(req.session.user._id)
            if(products!=0){
                const plainProducts=products.map((product)=>{
                    return{
                        productId:product.productId,
                        name:product.name,
                        price:product.price,
                        colour:product.colour,
                        images:product.images,
                        offerPrice:product.offerPrice ? product.offerPrice : false
                    }
                })
                res.render('products/wishlist', { user: req.session.user,products:plainProducts})
            }else{
                res.render('products/wishlist', { user: req.session.user})
            }
        } catch (error) {
            res.status(500).send('Error rendering wishlist page');
        }
    },
    
    offerPage:(req,res)=>{
        try {
            res.render('products/offerPage', { user: req.session.user });
        } catch (error) {
            res.status(500).send('Error rendering offer page');
        }
    },

    cartPage:async(req,res)=>{
        try {
            let cartLength=0;
            if(req.session.user){
                cartLength=await producthelpers.getCartLength(req.session.user._id)
            }
            const cartProducts=await producthelpers.getCartProducts(req.session.user._id)
            let totalAmount=150
            let subTotal=0
            let total=cartProducts.map((data)=>{
                let value=data.offerPrice ? data.offerPrice*data.quantity :data.price*data.quantity
                totalAmount+=value
                subTotal+=value
            })
            const plainObj=cartProducts.map((data)=>{
                return{
                    _id:data._id,
                    productId:data.productId,
                    productName:data.productName,
                    description:data.description,
                    category:data.category,
                    price:data.price,
                    quantity:data.quantity,
                    images:data.images,
                    inStock:data.stock>5,
                    limitedStock:data.stock<=5 && data.stock>=1,
                    outofStock:data.stock==0,
                    totalPrice:data.offerPrice ? data.offerPrice*data.quantity : data.price*data.quantity,
                    isQuantityGreaterThanOne:data.quantity>1,
                    isIncrementButtonLessThanStock:data.quantity<data.stock,
                    isMinimumStockExceded:data.quantity==data.stock
                }
            })
            res.render('users/cartPage', { user: req.session.user,data:plainObj,totalAmount,subTotal,cartLength});
        } catch (error) {
            console.log(error)
            res.status(500).send('Error rendering cart page');
        }
    },

    searchProducts:async(req,res)=>{
        try {
            let cartLength=0;
            if(req.session.user){
                cartLength=await producthelpers.getCartLength(req.session.user._id)
            }
           const item=req.params.item
           req.session.product=item
           var searchProducts=await producthelpers.getSearchProducts(item)
           var plainProduct=await Promise.all(
            searchProducts.map(async(product)=>{
                if(req.session.user!=undefined){
                    const findwish=await usershelpers.findWishProduct(req.session.user._id,product._id)
                    return{
                        _id: product._id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        images: product.images,
                        isOnWishList:findwish,
                        offerPrice:product.offerPrice ? product.offerPrice : false
                    }
                }else{
                    return{
                        _id: product._id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        images: product.images,
                        isOnWishList:false,
                        offerPrice:product.offerPrice ? product.offerPrice : false
                    }
                }
            })
        )
            res.render('products/productSearchPage',{user:req.session.user,products:plainProduct,item:req.session.product,cartLength})
        } catch (error) {
          res.status(500).send('Error occured')  
        }
    },

    sortProductByPrice:async(req,res)=>{
        try {
            let cartLength=0;
            if(req.session.user){
                cartLength=await producthelpers.getCartLength(req.session.user._id)
            }
            var products=await producthelpers.sortProductByPrice(req.params.value)
            const plainProducts =await Promise.all(
                products.map(async(product)=>{
                    if(req.session.user!=undefined){
                        const findwish=await usershelpers.findWishProduct(req.session.user._id,product._id)
                        return{
                            _id: product._id,
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            images: product.images,
                            isOnWishList:findwish,
                            offerPrice:product.offerPrice ? product.offerPrice : false
                        }
                    }else{
                        return{
                            _id: product._id,
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            images: product.images,
                            isOnWishList:false,
                            offerPrice:product.offerPrice ? product.offerPrice : false
                        }
                    }
                })
            )
            res.render('products/productlist',{products:plainProducts,user:req.session.user,cartLength})
        } catch (error) {
            res.status(500).send('Error occured')
        }
    },

    sortSearchProductByPrice:async(req,res)=>{
        try {
            let cartLength=0;
            if(req.session.user){
                cartLength=await producthelpers.getCartLength(req.session.user._id)
            }
            const item=req.params.item
            req.session.product=item
            var sortSearchProducts=await producthelpers.sortSearchProducts(req.params.value,item)
            var plainProduct=await Promise.all(
                sortSearchProducts.map(async(product)=>{
                    if(req.session.user!=undefined){
                        const findwish=await usershelpers.findWishProduct(req.session.user._id,product._id)
                        return{
                            _id: product._id,
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            images: product.images,
                            isOnWishList:findwish,
                            offerPrice:product.offerPrice ? product.offerPrice : false
                        }
                    }else{
                        return{
                            _id: product._id,
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            images: product.images,
                            isOnWishList:false,
                            offerPrice:product.offerPrice ? product.offerPrice : false
                        }
                    }
                })
            )
            res.render('products/productSearchPage',{products:plainProduct,user:req.session.user,item:req.session.product,cartLength})
         } catch (error) {
           res.status(500).send('Error occured')  
         }
     },

     filterProducts:async(req,res)=>{
        try {
            let cartLength=0;
            if(req.session.user){
                cartLength=await producthelpers.getCartLength(req.session.user._id)
            }
           const filteredProducts=await producthelpers.filterProducts(req.params.cat,req.params.price)
           const plainProducts =await Promise.all(
            filteredProducts.map(async(product)=>{
                if(req.session.user!=undefined){
                    const findwish=await usershelpers.findWishProduct(req.session.user._id,product._id)
                    return{
                        _id: product._id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        images: product.images,
                        isDisabled:product.stock==0,
                        isOnWishList:findwish,
                        offerPrice:product.offerPrice ? product.offerPrice : false
                    }
                }else{
                    return{
                        _id: product._id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        images: product.images,
                        isDisabled:product.stock==0,
                        isOnWishList:false,
                        offerPrice:product.offerPrice ? product.offerPrice : false
                    }
                }
            })
        )
           res.render('products/productlist',{user:req.session.user,products:plainProducts,cartLength})
        } catch (error) {
            res.status(500).send("Error occured page not rendering")
        }
     }
}