const { accommodations } = require("./db");
const db = require("../models/db");
const Event = db.event;
const User = db.user;

module.exports = (sequelize, DataTypes) => {
    const CommentsEvents = sequelize.define("comments_events", {
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User, key: 'id',
                },
            allowNull: false,
            validate: { notNull: { msg: "User ID can not be empty!" } } 
        },
        event_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Event, key: 'id',
                },
            allowNull: false,
            validate: { notNull: { msg: "Event ID can not be empty!" } } 
        },
        comment: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Comment can not be empty!" } } 
        },
        
    }, {
        timestamps: false
    });
    return CommentsEvents;
};