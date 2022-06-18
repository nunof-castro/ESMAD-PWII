module.exports = (sequelize, DataTypes) => {
    const Accommodation = sequelize.define("accommodations", {
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Address can not be empty!" } } 
        },
        time_available: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: { notNull: { msg: "Time Available can not be empty!" } } 
        },
        price_range: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Price range can not be empty!" } } 
        },
        beds_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { notNull: { msg: "Beds number can not be empty!" } } 
        },
        people_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { notNull: { msg: "People number can not be empty!" } } 
        },
        room_type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Room type can not be empty!" } }
        },
    }, {
        timestamps: false
    });
    return Accommodation;
};