const offer=require('../databaseSchemas/offerSchema');
const product=require('../databaseSchemas/productSchema');
const productOffer=require('../databaseSchemas/productOfferSchema');
const mongoose=require('mongoose')
const { ObjectId } = mongoose.Types;

module.exports={

    addCategoryOffer:(data)=>{
        return new Promise((resolve,reject)=>{
            const obj=new offer(data)
            obj.save().then((data)=>{
                if(data){
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            })
        })
    },

    findAllOffer:()=>{
        return new Promise((resolve,reject)=>{
            offer.find({isActive:true}).then((data)=>{
                resolve(data)
            })
        })
    },

    findAllProductOffer:()=>{
      return new Promise((resolve,reject)=>{
          productOffer.find({isActive:true}).then((data)=>{
              resolve(data)
          })
      })
    },

    applyOffer: (offerId) => {
      return new Promise(async (resolve, reject) => {
        try {
          const offerDetail = await offer.findOne({ _id: new ObjectId(offerId) });
          const percentage = parseInt(offerDetail.discountValue.replace('%', ''));
          const date = new Date();
    
          if (new Date(offerDetail.startDate).toISOString().split('T')[0] > new Date(date).toISOString().split('T')[0]) {
            return resolve({ status: false, message: "Offer not yet started" });
          }
    
          if (new Date(offerDetail.endDate).toISOString().split('T')[0] < new Date(date).toISOString().split('T')[0]) {
            return resolve({ status: false, message: "Offer Expired" });
          }
          let products
          if(offerDetail.applicable=="All"){
            products=await product.find()

          for (const item of products) {
            let offerPrice = (percentage / 100) * item.price;
            offerPrice=Math.floor(offerPrice)
    
            const updateResult = await product.updateOne(
              {_id:new ObjectId(item._id),price:{$gte:offerDetail.minimumPrice}},
              {
                $set: {
                  offerPrice: offerPrice,
                },
              }
            );
    
            if (!updateResult.acknowledged) {
              return resolve({ status: false, message: "Offer not added. Try again." });
            }
          }
          offer.updateOne({_id:new ObjectId(offerId)},{$set:{isUsed:true}}).then(()=>{
            resolve({ status: true, message: "Offer added successfully" });
          })
          }
          else{
          const data = await product.find({
            catType: { $regex: new RegExp(`^${offerDetail.applicable}$`, 'i') }
          });

          if(data.length==0){
            resolve({status:false,message:"No category found"})
          }
    
          for (const item of data) {
            let offerPrice = (percentage / 100) * item.price;
            offerPrice=Math.floor(offerPrice)
    
            const updateResult = await product.updateOne(
              { _id: new ObjectId(item._id),price:{$gte:offerDetail.minimumPrice}},
              {
                $set: {
                  offerPrice: offerPrice,
                },
              }
            );
    
            if (!updateResult.acknowledged) {
              return resolve({ status: false, message: "Offer not added. Try again." });
            }
          }
          offer.updateOne({_id:new ObjectId(offerId)},{$set:{isUsed:true}}).then(()=>{
            resolve({ status: true, message: "Offer added successfully" });
          })
        }
    
        } catch (error) {
          reject({ status: false, message: error.message });
        }
      });
    },

    deletOffer:(offerId)=>{
      return new Promise(async(resolve,reject)=>{
        const offerDetail=await offer.findOne({_id:new ObjectId(offerId)})
        if(offerDetail.applicable=="All"){
          product.updateMany({},{$unset:{offerPrice:""}}).then(()=>{
            offer.updateOne({_id:new ObjectId(offerId)},{$set:{isActive:false}}).then((data)=>{
              if(data.acknowledged){
                resolve({status:true,message:"Offer deleted successfully"})
              }else{
                resolve({status:false,message:"Offer not deleted try again"})
              }
            })
          })
        }else{
        const products=await product.find({catType:{$regex: new RegExp(`^${offerDetail.applicable}$`, 'i')}})
        for(const data of products ){
          const updateResult=await product.updateOne({_id:new ObjectId(data._id)},{$unset:{offerPrice:""}})
        }
        offer.updateOne({_id:new ObjectId(offerId)},{$set:{isActive:false}}).then((data)=>{
          if(data.acknowledged){
            resolve({status:true,message:"Offer deleted successfully"})
          }else{
            resolve({status:false,message:"Offer not deleted try again"})
          }
        })
      }
      })
    },

    addProductOffer:(data)=>{
      return new Promise((resolve,reject)=>{
        const obj=new productOffer(data)
        obj.save().then((data)=>{
          if(data){
            resolve({status:true})
          }else{
            resolve({status:false})
          }
        })
      })
    },

    applyProductOffer:(offerId)=>{
      return new Promise(async(resolve,reject)=>{
        const offerDetail = await productOffer.findOne({ _id: new ObjectId(offerId) });
          const percentage = parseInt(offerDetail.discountValue.replace('%', ''));
          const date = new Date();
    
          if (new Date(offerDetail.startDate).toISOString().split('T')[0] > new Date(date).toISOString().split('T')[0]) {
            return resolve({ status: false, message: "Offer not yet started" });
          }
    
          if (new Date(offerDetail.endDate).toISOString().split('T')[0] < new Date(date).toISOString().split('T')[0]) {
            return resolve({ status: false, message: "Offer Expired" });
          }

          const products=await product.findOne({name:{$regex: new RegExp(`^${offerDetail.applicable}$`, 'i')}})

          let offerPrice = (percentage / 100) * products.price;
          offerPrice=Math.floor(offerPrice)

          product.updateOne({name:products.name,price:{$gte:offerDetail.minimumPrice}},{$set:{offerPrice:offerPrice}}).then(()=>{
            productOffer.updateOne({_id:new ObjectId(offerId)},{$set:{isUsed:true}}).then((data)=>{
              if(data.acknowledged){
                resolve({status:true,message:"Offer addedd"})
              }else{
                resolve({status:false,message:"Offer not addedd"})
              }
            })
          })
      })
    },

    deleteProductOffer:(offerId)=>{
      return new Promise(async(resolve,reject)=>{
        const offer=await productOffer.findOne({_id:new ObjectId(offerId)})
        product.updateOne({name:{$regex: new RegExp(`^${offer.applicable}$`, 'i')}},{$unset:{offerPrice:""}}).then(()=>{
          productOffer.updateOne({_id:new ObjectId(offerId)},{$set:{isActive:false}}).then((data)=>{
            if(data.acknowledged){
              resolve({status:true,message:"Offer deleted"})
            }else{
              resolve({status:false,message:"Offer not deleted"})
            }
          })
        })
      })
    }
          
}