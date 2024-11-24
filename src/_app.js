const fastify = require('fastify');
const dataSource = require('../Infrastructure/postgres');
const { logger } = require('../logger');
const { fastifyOptions } = require('../fastifyOpts');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const fastifyCookie = require('fastify-cookie');
dotenv.config();
const startServer = async () => {
    const app = fastify(fastifyOptions);
    app.register(fastifyCookie)
    app.get('/', async (req, res) => {
        const result = { 
            code: 200,
            status: 'OK',
            message: 'Fastify server is running '
        }
        res.send(result)
    })
    app.register(userRoutes)
    try {
        await app.listen({port: process.env.SERVER_PORT, host:process.env.SERVER_HOST});
        await dataSource.initialize()
        .then((conn) => {
          logger.info("Database connection has beed established ...");
        })
        .catch(error => {
          logger.error(error);
        })
        logger.info(`Server is Listening on ${process.env.SERVER_PORT}`)

    } catch (error) {
        logger.error(error.message);
        process.exit(1);
    }
};

module.exports = startServer;


