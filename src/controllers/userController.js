const { P } = require("pino");
const { logger } = require("../../logger");
const { registerUser, loginUser, userLogout, passwordForgot, passwordReset, passwordUpdate } = require("../services/userService");
const fastifyCookie = require('fastify-cookie');
const fastify=require("fastify")()
fastify.register(fastifyCookie)
const postUser = async (request, reply) => {
  logger.info("data: ", request.body)
  try {
    const user = await registerUser(request.body);
    return reply.send(user);
  } catch (error) {
    return reply.status(500).send(error);
  }
};

const checkUser=async(req,res)=>{
  
  try {
    const user = await loginUser(req.body);
    return res.setCookie("token",user.token).status(user.status).send({
      message: user.message,
      success:user.success,
      token:user.token
    })
    
  } catch (error) {
    return res.status(500).send({
      message:error?.response?.data?.message,
      success:false,
    })
  }
}
const logoutUser=async(req,res)=>{
  try {
    const user= await userLogout(req,res)
    return res.status(user.status).setCookie("token",user.token).send({
      success:user.success,
      message:user.message
    })
  } catch (error) {
    return res.status(500).send({
      success:false,
      message:error?.response?.data?.message,

    })
  }
}

const forgotPassword=async(req,res)=>{
  try {
    const user=await passwordForgot(req,res)
    return res.status(user.status).send({
      success:user.success,
      message:user.message
    })
  } catch (error) {
    return res.status(500).send({
      success:false,
      message:"Invalid Server Error",

    })
  }
}


const resetPassword=async(req,res)=>{
  try {
    const user= await passwordReset(req,res)
    return res.status(user.status).send({
      success:user.success,
      message:user.message,
      token:user.token
    })
  } catch (error) {
    return  res.status(500).send({
      success:false,
      message:error?.response?.data?.message
    })
  }
}


const updatePassword=async(req,res)=>{
  try {
    const user=await passwordUpdate(req,res)
    return res.status(user.status).send({
      success:user.success,
      message:user.message
    })
  } catch (error) {
    return res.status(500).send({
      success:false,
      message:error?.response?.data?.message
    })
  }
}
module.exports = {
  postUser,
  checkUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  updatePassword
};