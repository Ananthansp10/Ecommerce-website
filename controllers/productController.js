const producthelpers = require('../helpers/producthelpers');

module.exports={
    productList:async(req,res)=>{
        try {
            const products = await producthelpers.getAllProducts();
            const plainProducts = products.map(product => ({
                _id: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                images: product.images,
                isDisabled:product.stock==0
            }));
            res.render('products/productlist', { user: req.session.user, products: plainProducts });
        } catch (error) {
            res.status(500).send('Error rendering product list');
        }
    },
    
    productByCategory:async(req,res)=>{
        try {
            const products = await producthelpers.productByCat(req.params.cat);
            const plainProducts = products.map(product => ({
                _id: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                images: product.images
            }));
            res.render('products/productlist', { user: req.session.user, products: plainProducts });
        } catch (error) {
            res.status(500).send('Error retrieving products by category');
        }
     },

     productPage:async(req,res)=>{
        try {
            const productDetails = await producthelpers.viewProductDetails(req.params.id);
            let isMobile;
            if(productDetails.category){
                isMobile=true;
            }
            const stockSize=productDetails.stock
            let outOfStock;
            let inStock;
            if(stockSize<=5){
                outOfStock=true;
            }
            else{
                inStock=true;
            }
            const plainProduct = {
                _id: productDetails._id,
                name: productDetails.name,
                price: productDetails.price,
                description: productDetails.description,
                images: productDetails.images,
                stock: productDetails.stock,
                isOut:outOfStock,
                inStock:inStock
            };
            
            const colours = await producthelpers.getColourVariant(productDetails.name);
            let productColours = colours.map(prod => prod.images);
            
            res.render('products/productviewpage', { user: req.session.user, product: plainProduct, colours: productColours });
        } catch (error) {
            res.status(500).send('Error retrieving product details');
        }
    },
    
    productSearch:(req,res)=>{
        try {
            res.render('products/productSearchPage', { user: req.session.user });
        } catch (error) {
            res.status(500).send('Error rendering product search page');
        }
    },

    wishList:(req,res)=>{
        try {
            res.render('products/wishlist', { user: req.session.user });
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
            const cartProducts=await producthelpers.getCartProducts(req.session.user._id)
            let totalAmount=150
            let subTotal=0
            let total=cartProducts.map((data)=>{
                let value=data.price*data.quantity
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
                    totalPrice:data.price*data.quantity,
                    isQuantityGreaterThanOne:data.quantity>1
                }
            })
            res.render('users/cartPage', { user: req.session.user,data:plainObj,totalAmount,subTotal});
        } catch (error) {
            res.status(500).send('Error rendering cart page');
        }
    },

    searchProducts:async(req,res)=>{
        try {
           const item=req.params.item
           req.session.product=item
           var searchProducts=await producthelpers.getSearchProducts(item)
           var plainProduct=searchProducts.map((data)=>{
            return{
                name:data.name,
                description:data.description,
                image:data.images,
                price:data.price,
                _id:data._id,
                isDisabled:data.stock==0
            }
           })
            res.render('products/productSearchPage',{user:req.session.user,products:plainProduct,item:req.session.product})
        } catch (error) {
          res.status(500).send('Error occured')  
        }
    },

    sortProductByPrice:async(req,res)=>{
        try {
            var products=await producthelpers.sortProductByPrice(req.params.value)
            const plainProducts = products.map(product => ({
                _id: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                images: product.images
            }));
            res.render('products/productlist',{products:plainProducts,user:req.session.user})
        } catch (error) {
            res.status(500).send('Error occured')
        }
    },

    sortSearchProductByPrice:async(req,res)=>{
        try {
            const item=req.params.item
            req.session.product=item
            var sortSearchProducts=await producthelpers.sortSearchProducts(req.params.value,item)
            var plainProduct=sortSearchProducts.map((data)=>{
             return{
                _id:data._id,
                 name:data.name,
                 description:data.description,
                 image:data.images,
                 price:data.price,
                 isDisabled:data.stock==0
             }
            })
            res.render('products/productSearchPage',{products:plainProduct,user:req.session.user,item:req.session.product})
         } catch (error) {
           res.status(500).send('Error occured')  
         }
     },

     filterProducts:async(req,res)=>{
        try {
           const filteredProducts=await producthelpers.filterProducts(req.params.cat,req.params.price)
           const plainProducts = filteredProducts.map(product => ({
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            images: product.images,
            isDisabled:product.stock==0
        }));
           res.render('products/productlist',{user:req.session.user,products:plainProducts})
        } catch (error) {
            res.status(500).send("Error occured page not rendering")
        }
     }
}