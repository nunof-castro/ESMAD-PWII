const dbConfig = require('../config/db.config.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect
    ,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const db = {};
db.sequelize = sequelize;


db.user = require("./users.model.js")(sequelize, DataTypes);
db.accommodation = require("./accommodations.model.js")(sequelize, DataTypes);
db.userAccommodation = require("./user_accommodations.model")(sequelize, DataTypes)
db.event = require("./events.model.js")(sequelize, DataTypes);
db.userEvent = require("./user_events.model")(sequelize, DataTypes)
db.commentAccommodation = require("./comments_accommodations.model")(sequelize, DataTypes)

db.user.hasMany(db.accommodation)
db.accommodation.belongsTo(db.user)

db.accommodation.belongsToMany(db.user , {through: db.userAccommodation, as :'reservations', foreignKey:"accommodation_id"})
db.user.belongsToMany(db.accommodation , {through: db.userAccommodation, as :'reservations', foreignKey:"user_id"})

db.accommodation.belongsToMany(db.user, {through: db.commentAccommodation, as: "comments_accommodation", foreignKey:"accommodation_id"})
db.user.belongsToMany(db.accommodation , {through: db.commentAccommodation, as :'comments_accommodation', foreignKey:"user_id"})

db.user.hasMany(db.event)
db.event.belongsTo(db.user)

db.event.belongsToMany(db.user , {through: db.userEvent, as :'registrations', foreignKey:"event_id"})
db.user.belongsToMany(db.event , {through: db.userEvent, as :'registrations', foreignKey:"user_id"})



module.exports = db;