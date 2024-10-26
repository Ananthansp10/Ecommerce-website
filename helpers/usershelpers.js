const { promises } = require('nodemailer/lib/xoauth2');
const user=require('../databaseSchemas/usersSchemas')
const bcrypt=require('bcrypt')
const {generateOTP}=require('../utils/sendEmail')
const {sendEmail}=require('../utils/sendEmail')
const OTPschema=require('../databaseSchemas/otpSchema');
const { promise } = require('bcrypt/promises');
const otpSchema = require('../databaseSchemas/otpSchema');
const googleAuthSchema=require('../databaseSchemas/googleAuthSchemas');
const userDetail=require('../databaseSchemas/userDetailSchema')
const mongoose=require('mongoose')
const { ObjectId } = mongoose.Types;
module.exports={
    addUser: (userdata) => {
        const userData = new user({
            name: userdata.name,
            email: userdata.email,
            password: userdata.password,
            confirmPassword: userdata.confirmPassword,
            verified:false,
            status:"Unblock"
        });
    
        return new Promise((resolve, reject) => {
            userData.save()
                .then(() => {
                    resolve({ status: true });
                })
                .catch((err) => {
                    console.log(err.errors)
                    // Check if it's a validation error
                    if (err.errors && err.errors.confirmPassword) {
                        reject({ status: false, message: err.errors.confirmPassword.message });
                    } else if (err.errors && err.errors.password) {
                        reject({ status: false, message:err.errors.password.message});
                    } else if (err.errors && err.errors.email) {
                        reject({ status: false, message:err.errors.email.message});
                    } else if(err.errors && err.errors.password) {
                        reject({ status: false, message:err.errors.password.message});
                    }
                    else{
                        reject({status:false,message:"error occured"})
                    }
                });
        });
    },
    checkUser:async(userdata)=>{
        return new Promise(async(resolve,reject)=>{
            const userDetails=await user.collection.findOne({email:userdata.email})
            if(!userDetails){
                resolve({status:false,message:"User not found"})
            }
            else{
                const passwordMatch=await bcrypt.compare(userdata.password,userDetails.password)
                if(passwordMatch){
                    if(userDetails.status==="Block"){
                        resolve({status:false,message:"User has been blocked cant't login"})
                    }
                    resolve({status:true,user:userDetails})
                }
                else{
                    resolve({status:false,message:"password wrong"})
                }
            }
        }).catch((err)=>{
            reject(err)
        })
    },

    otpGenerate:(email)=>{
        return new Promise(async(resolve,reject)=>{
            const OTP=generateOTP();
            const subject="your OTP code"
            const text=`OTP : ${OTP}`

            sendEmail(email,subject,text).then(()=>{
                OTPschema.collection.insertOne({email:email,otp:OTP}).then(()=>{
                    resolve({status:true,userotp:OTP,message:"OTP send successfully"})
                }).catch((err)=>{
                    console.log("OTP not send error occured" +err)
                    reject({message:"OTP not send error occured"})
                })
            })
        })
    },

    signupOtpVerification:(email,otp)=>{
        console.log(otp,email)
        return new Promise(async(resolve,reject)=>{
            const dbOTP= await OTPschema.collection.findOne({email:email})
            console.log(dbOTP)
            if(dbOTP.otp==otp){
                await user.collection.updateOne({email:email},{$set:{verified:true}}).then(()=>{
                    resolve({status:true})
                })
            }
            else{
                resolve({status:false})
            }
        })
    },

    updateUserOtp:(email,newOtp)=>{
        return new Promise((resolve,reject)=>{
            otpSchema.collection.updateOne({email:email},{$set:{otp:newOtp}}).then(()=>{
                resolve({status:true})
            })
        })
    },

    resendOtpGenerate:(email)=>{
        return new Promise(async(resolve,reject)=>{
            const OTP=generateOTP();
            const subject="your OTP code"
            const text=`OTP : ${OTP}`

            sendEmail(email,subject,text).then(()=>{
                OTPschema.collection.updateOne({email:email},{$set:{otp:OTP}}).then(()=>{
                    resolve({status:true})
                }).catch((err)=>{
                    console.log("OTP not send error occured" +err)
                    reject({message:"OTP not send error occured"})
                })
            })
        })
    },

    googleAuthUserAdd:(userDetails)=>{
        const googleUserData={
            googleId:userDetails.id,
            name:userDetails.displayName,
            email:userDetails.emails[0].value,
            image:userDetails.photos[0].value
        }
        return new Promise(async(resolve,reject)=>{
            const userDetail=await user.collection.findOne({email:userDetails.emails[0].value})
            if(userDetail){
                resolve({status:false,message:"user with this email already exist"})
            }
            else{
                const googleUser=await googleAuthSchema.collection.findOne({email:userDetails.emails[0].value})
                if(googleUser){
                    resolve({status:true,message:"user already logedIn",userData:googleUserData})
                }
                else{
                    googleAuthSchema.collection.insertOne(googleUserData).then(()=>{
                        resolve({status:true,userData:googleUserData})
                    })
                }
            }
        })
    },

    forgotPasswordOtpGenerate:(email)=>{
        return new Promise(async(resolve,reject)=>{
            const OTP=generateOTP();
            const subject="your OTP code"
            const text=`OTP : ${OTP}`

            sendEmail(email,subject,text).then(()=>{
                OTPschema.collection.updateOne({email:email},{$set:{otp:OTP}}).then(()=>{
                    resolve({status:true})
                }).catch((err)=>{
                    console.log("OTP not send error occured" +err)
                    reject({message:"OTP not send error occured"})
                })
            })
        })
    },

    forgotPasswordOtpVerification:(otp,email)=>{
        return new Promise(async(resolve,reject)=>{
           const dbOTP=await OTPschema.collection.findOne({email:email})
           if(dbOTP.otp==otp){
             resolve({status:true})
           }
           else{
            resolve({status:false,message:"OTP you enterd is wrong"})
           }
        })
    },

    changePassword:async(passwords,email)=>{
        const salt = await bcrypt.genSalt(10);
        passwords.newPassword = await bcrypt.hash(passwords.newPassword, salt);
        return new Promise((resolve,reject)=>{
            user.collection.updateOne({email:email},{$set:{password:passwords.newPassword}}).then(()=>{
                resolve()
            })
        })
    },

    addUserDetails:(data)=>{
        return new Promise((resolve,reject)=>{
            const userData=new userDetail({
                name:data.name,
                phoneNumber:data.phoneNumber,
                location:data.location,
                houseNumber:data.houseNumber,
                pincode:data.pincode,
                city:data.city,
                state:data.state,
                country:data.country,
                addressType:data.addressType,
                image:data.image,
                userId:data.userId 
            })
            userData.save().then(()=>{
                resolve()
            })
        })
    },

    findUserProfile:(userId)=>{
        return new Promise((resolve,reject)=>{
            userDetail.find({userId:new ObjectId(userId)}).then((data)=>{
                const length=data.length;
                if(length!=0){
                    resolve(data[0].image)
                }
                else{
                    resolve()
                }
            })
        })
    }
    
}