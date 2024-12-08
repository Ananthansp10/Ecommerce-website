const { response } = require('express')
const offerhelper=require('../helpers/offerhelpers')

module.exports={

    addCategoryOffer:(req,res)=>{
        const{title,description,discountType,discountValue,minimumPrice,applicable,startDate,endDate}=req.body
        const image=req.files[0].path
        const obj={
            title,
            description,
            discountType,
            discountValue,
            minimumPrice,
            applicable,
            image,
            startDate,
            endDate,
            isActive:true,
            isUsed:false
        }
        offerhelper.addCategoryOffer(obj).then((response)=>{
            if(response.status){
                res.status(200).json({status:true,message:"Category Offer addedd"})
            }else{
                res.status(400).json({status:false,message:"Category offer cannot addedd"})
            }
        })
    },

    addCategoryOfferPage:(req,res)=>{
        try {
           res.render('admin/categoryOfferAddPage',{admin:true}) 
        } catch (error) {
           res.status(500).send("Error occured page not rendering") 
        }
    },

    applyOffer:(req,res)=>{
        try {
            offerhelper.applyOffer(req.params.offerId).then((response)=>{
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

    deletOffer:(req,res)=>{
        try {
           offerhelper.deletOffer(req.params.offerId).then((response)=>{
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

    addProductOffer:(req,res)=>{
        try {
            const{title,description,discountType,discountValue,minimumPrice,applicable,startDate,endDate}=req.body
        const image=req.files[0].path
        const obj={
            title,
            description,
            discountType,
            discountValue,
            minimumPrice,
            applicable,
            image,
            startDate,
            endDate,
            isActive:true,
            isUsed:false
        }
           offerhelper.addProductOffer(obj).then((response)=>{
            if(response.status){
                res.status(200).json({status:true,message:"Product Offer addedd"})
            }else{
                res.status(400).json({status:false,message:"Product Offer cannot addedd"})
            }
           }) 
        } catch (error) {
           res.status(500).send("Error occured") 
        }
    },

    applyProductOffer:(req,res)=>{
        try {
            offerhelper.applyProductOffer(req.params.offerId).then((response)=>{
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

    deleteProductOffer:(req,res)=>{
        try {
            offerhelper.deleteProductOffer(req.params.offerId).then((response)=>{
                if(response.status){
                    res.status(200).json({status:true,message:response.message})
                }else{
                    res.status(400).json({status:false,message:response.message})
                }
            })
        } catch (error) {
            res.status(400).send("Error occured")
        }
    }
}