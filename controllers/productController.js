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
                images: product.images
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

    cartPage:(req,res)=>{
        try {
            res.render('users/cartPage', { user: req.session.user });
        } catch (error) {
            res.status(500).send('Error rendering cart page');
        }
    }
}