const { accommodations } = require("./db");
const db = require("../models/db");
const Accommodation = db.accommodation;
const User = db.user;

module.exports = (sequelize, DataTypes) => {
    const RatingsAccommodations = sequelize.define("ratings", {
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User, key: 'id',
                },
            allowNull: false,
            validate: { notNull: { msg: "User ID can not be empty!" } } 
        },
        accommodation_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Accommodation, key: 'id',
                },
            allowNull: false,
            validate: { notNull: { msg: "Accommodation ID can not be empty!" } } 
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { notNull: { msg: "Rating can not be empty!" } } 
        },
        
    }, {
        timestamps: false
    });
    return RatingsAccommodations;
};