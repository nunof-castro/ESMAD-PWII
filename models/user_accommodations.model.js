const { accommodations } = require("./db");
const db = require("../models/db");
const Accommodation = db.accommodation;
const User = db.user;

module.exports = (sequelize, DataTypes) => {
    const UserAccommodations = sequelize.define("user_accommodations", {
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
        validation: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { notNull: { msg: "Validation can not be empty!" } } 
        },
        
    }, {
        timestamps: false
    });
    return UserAccommodations;
};