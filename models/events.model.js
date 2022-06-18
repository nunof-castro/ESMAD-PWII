module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define("events", {
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Address can not be empty!" } } 
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: { notNull: { msg: "Date can not be empty!" } } 
        },
        event_type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Event Type can not be empty!" } } 
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: { notNull: { msg: "Price can not be empty!" } } 
        },
    }, {
        timestamps: false
    });
    return Event;
};