const { logger } = require("../../logger");
const dataSource = require("../../Infrastructure/postgres");
const bcrypt = require('bcrypt');
const jwt=require("jsonwebtoken");
const crypto=require("crypto")
const {sendEmail}=require("../../Infrastructure/nodemailer")
const createUser = async (userInfo) => {
  const {name,email,password,active}=userInfo
  const userRepository = dataSource.getRepository("User");
  const hashedPassword = await bcrypt.hash(userInfo.password, 10);
  const user = userRepository.create({name,email,password:hashedPassword,active});
  await userRepository.save(user);

  return user;
};

const userLogin=async(userInfo)=>{
  try {
    const {email,password}=userInfo
    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({where:{email}});
    if (!user) {
      return {success:false,message:"User Not Found",status:404}
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {success:false,message:"Invalid Password",status:404}
    }
    const token=jwt.sign({userId:user.id},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRES})
    return {success:true,message:"User Login Success",token,status:200}
  
  } catch (error) {
    return {success:false,message:error.message,status:500}
  }

}

const deleteCookie=async(req,res)=>{
  try {
    return {
      success: true,
      token:"",
      message: "User Logout successfully",
      status:200
    }
  } catch (error) {
    return {success:false,message:error.message,status:500}
  }
}

const sendEmailForPassword=async(req,res)=>{
  try {
    const {email}=req.body
    const userRepository = dataSource.getRepository("User");
    const user = await userRepository.findOne({where:{email}});
    if (!user) {
      return {
        success:false,
        message:"User Not Found",
        status:404
      }
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 600000; 
    user.resetToken=resetToken;
    user.resetTokenExpiry=resetTokenExpiry/1000;
    await userRepository.save(user);
    const resetUrl=`http://[::1]:5000/reset-password/?token=${resetToken}`

    const message=`Your Reset Password Token is:- \n\n ${resetUrl} \n\n If you have not requested for this, please ignore`
    try {
      await sendEmail({
        email:user.email,
        subject:"E-Invoice App Email Password Reset",
        message,

      })

      return {
        success:true,
        message:"Email Sent Successfully",
        status:200
      }
    } catch (error) {
      return {
        success: false,
        message: "Error sending email",
        status:500
      }
    }

  } catch (error) {

    return {
      sucess:false,
      message:`Error From sendEmail ${error.message}`,
      status:500
    }
  }
}


const checkResetToken=async(req,res)=>{
  try {
    const {token}=req.params
    const {newPassword,confirmNewPassword}=req.body
    const userRepository=dataSource.getRepository("User")
    const userFound=await userRepository.findOne({where:{resetToken:token}})


    if(!newPassword || !confirmNewPassword){
      return {
        success:false,
        message:"Please enter a password",
      }
    }
    if(newPassword !==confirmNewPassword){
      return {
        success:false,
        message:"Passwords do not match", 
        status:400
      }
    }

    if (!userFound || userFound.resetTokenExpiry < Date.now()) {
      return {
        message: 'Invalid or expired reset token',
        success:false,
        status:404
      };
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userFound.password = hashedPassword;
    userFound.resetToken = null;  
    userFound.resetTokenExpiry =null;  
    await userRepository.save(userFound);

    return {
      success: true,
      message: 'Password reset successfully',
      status:200,
      userFound
    }

  } catch (error) {
    return {
      success:false,
      message:error.message,
      status:500
    }
  }
}


const userPasswordUpdate=async(req,res)=>{
  try {
    const {oldPassword,newPassword,confirmNewPassword}=req.body
    const userRepository=dataSource.getRepository("User")
    const userFound=await userRepository.findOne({where:{id:req.userId}})
    if(!userFound){
      return {
        success:false,
        message:"User not found",
        status:404
      }
    }
    const isValidPassword=await bcrypt.compare(oldPassword,userFound.password)
    if(!isValidPassword){
      return {
        success:false,
        message:"Invalid old password",
        status:401
      }
    }
    if(newPassword!==confirmNewPassword){
      return {
        success:false,
        message:"Passwords do not match",
        status:400
      }
    }
    const hashedPassword=await bcrypt.hash(newPassword,10)
    userFound.password=hashedPassword
    await userRepository.save(userFound);
    return {
      success: true,
      message: 'Password updated successfully',
      status:200
    }

  } catch (error) {
    return {
      success:false,
      message:error.message,
      status:500
    }
  }
}
module.exports = {
  createUser,
  userLogin,
  deleteCookie,
  sendEmailForPassword,
  checkResetToken,
  userPasswordUpdate
};