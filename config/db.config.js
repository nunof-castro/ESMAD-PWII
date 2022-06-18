
require("dotenv").config()
const config = {
    /* don't expose password or any sensitive info, done only for demo */
    // if environment variables are not defined, use default values
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME,
    // NEW
    dialect: "mysql",
    // pool is optional, it will be used for Sequelize connection pool configuration
    pool: {
        max: 5, // maximum number of connections in pool
        min: 0, // minimum number of connections in pool
        acquire: 30000, // maximum time, in miliseconds, that pool will try to get connection before throwing error
        idle: 10000 // maximum time, in miliseconds, that a connection can be idle before being released
    }
};
module.exports = config;
