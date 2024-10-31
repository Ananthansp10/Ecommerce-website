const product=require('../databaseSchemas/productSchema');
const Admin=require('../databaseSchemas/adminSchema');
const user=require('../databaseSchemas/usersSchemas');
const category=require('../databaseSchemas/categorySchema');
const googleAuth=require('../databaseSchemas/googleAuthSchemas');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; 
module.exports={
    adminLogin:(data)=>{
       return new Promise(async(resolve,reject)=>{
        const admin=await Admin.collection.findOne({email:data.email,password:data.password})
        if(admin){
            resolve({status:true})
        }
        else{
            resolve({status:false})
        }
       })
    },

    addProduct:(data)=>{
        return new Promise((resolve,reject)=>{
            product.collection.insertOne(data).then(()=>{
                resolve({status:true})
            })
        })
    },

    getProducts:()=>{
        return new Promise((resolve,reject)=>{
            product.find({visiblity:true}).then((products)=>{
                resolve(products)
            })
        })
    },

    findProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            product.find({_id:new ObjectId(prodId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    editProduct:(proId,data,images)=>{
        if(images.length==4){
            const editproduct={
                name:data.name,
                category:data.category,
                price:data.price,
                stock:data.stock,
                colour:data.colour,
                description:data.description,
                images:images
            }
            return new Promise((resolve,reject)=>{
                product.updateOne({_id:new ObjectId(proId)},{$set:editproduct}).then(()=>{
                    resolve()
                })
            })
        }else{
            const editproduct={
                name:data.name,
                category:data.category,
                price:data.price,
                stock:data.stock,
                colour:data.colour,
                description:data.description,
            }
        return new Promise((resolve,reject)=>{
            product.updateOne({_id:new ObjectId(proId)},{$set:editproduct}).then(()=>{
                resolve()
            })
        })
       }
    },

    getImages:(proId)=>{
        return new Promise((resolve,reject)=>{
            product.findOne({_id:new ObjectId(proId)}).then((product)=>{
               resolve(product.images)
            })
        })
    },

    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            product.updateOne({_id:new ObjectId(proId)},{$set:{visiblity:false}}).then((data)=>{
               resolve(data)
            })
        })
    },

    getUser:()=>{
        let userArray=[];
        return new Promise((resolve,reject)=>{
            user.find({}).then((data)=>{
                googleAuth.find({}).then((googleData)=>{
                    userArray=[...data,...googleData]
                    resolve(userArray)
                })
            })
        })
    },

    blockUser:(userId,status)=>{
        return new Promise(async(resolve,reject)=>{
            const findUser=await user.findOne({_id:new ObjectId(userId)})
            if(findUser){
            user.updateOne({_id:new ObjectId(userId)},{$set:{status:status}}).then((data)=>{
                resolve()
            })
        }else{
            await googleAuth.updateOne({_id:new ObjectId(userId)},{$set:{status:status}}).then((data)=>{
                console.log(data)
                resolve()
            }) 
        }
        })
    },

    productByCategory:(cat)=>{
        return new Promise((resolve,reject)=>{
           product.find({catType:cat,visiblity:true}).then((data)=>{
            console.log(data)
             resolve(data)
           })
        })
    },

    addCategory:(catName,imageUrl)=>{
        const categoryObj={
            name:catName,
            image:imageUrl,
            visiblity:true,
            isBlock:false
        }
        return new Promise((resolve,reject)=>{
            category.collection.insertOne(categoryObj).then(()=>{
                resolve()
            })
        })
    },

    findCategory:()=>{
        return new Promise((resolve,reject)=>{
            category.find({visiblity:true}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },

    findcatdetails:(catId)=>{
        return new Promise((resolve,reject)=>{
            category.findOne({_id:new ObjectId(catId)}).then((data)=>{
                resolve(data)
            })
        })
    },

    editCategory:(catName,imageurl,catId)=>{
        console.log(catId,catName,imageurl)
        return new Promise((resolve,reject)=>{
            if(imageurl.length==0){
                category.updateOne({_id:new ObjectId(catId)},{$set:{name:catName}}).then(()=>{
                    resolve()
                })
            }
            else{
                category.updateOne({_id:new ObjectId(catId)},{$set:{name:catName,image:imageurl}}).then(()=>{
                    resolve()
                })
            }
        })
    },

    deleteCategory:(catId)=>{
        return new Promise((resolve,reject)=>{
            category.updateOne({_id:new ObjectId(catId)},{$set:{visiblity:false}}).then(()=>{
                resolve()
            })
        })
    },

    blockCategory:(catId,value)=>{
        return new Promise((resolve,reject)=>{
            category.updateOne({_id:new ObjectId(catId)},{$set:{isBlock:value}}).then(()=>{
                    resolve()
            })
        })
    },

    getCatId:(cat)=>{

        cat=cat.charAt(0).toUpperCase() + cat.slice(1);
        return new Promise((resolve,reject)=>{
            category.findOne({name:cat}).then((data)=>{
                resolve(data._id)
            })
        })
    },

    getUserCount:()=>{
        return new Promise((resolve,reject)=>{
            user.find({}).then((data)=>{
                resolve(data.length)
            })
        })
    }
}