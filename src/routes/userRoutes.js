const { isAuthenticated } = require("../../Infrastructure/isAuthenticated");
const { postUser, checkUser, logoutUser, forgotPassword, resetPassword, updatePassword } = require("../controllers/userController");

const userRoutes = async (fastify, options) => {
  fastify.post('/create-user', postUser);
  fastify.post('/login-user',checkUser);
  fastify.get("/logout-user",logoutUser);
  fastify.post("/forgot-password",forgotPassword)
  fastify.post("/reset-password/:token",resetPassword)
  fastify.post("/update-password",{preHandler:isAuthenticated},updatePassword)
};

module.exports = userRoutes;

