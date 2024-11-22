const { createUser, userLogin, deleteCookie, sendEmailForPassword, checkResetToken, userPasswordUpdate } = require("../repositories/userRepository");

const registerUser = async (userInfo) => {
  return await createUser(userInfo);
};

const loginUser=async (userInfo)=>{
  
  return await userLogin(userInfo)
}

const userLogout=async(req,res)=>{
  return await deleteCookie(req,res)
}

const passwordForgot=async(req,res)=>{
  return await sendEmailForPassword(req,res)
}

const passwordReset=async(req,res)=>{
  return await checkResetToken(req,res)
}

const passwordUpdate=async(req,res)=>{
  return await userPasswordUpdate(req,res)
}
module.exports = {
  registerUser,
  loginUser,
  userLogout,
  passwordForgot,
  passwordReset,
  passwordUpdate
};