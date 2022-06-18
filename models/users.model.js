module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Username can not be empty!" } } 
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Email can not be empty!" } } 
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Password can not be empty!" } } 
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "First name can not be empty!" } } 
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Last name can not be empty!" } } 
        },
        user_role: {
            type: DataTypes.INTEGER
        },
        user_banned: {
            type: DataTypes.INTEGER
        },
    }, {
        timestamps: false
    });
    return User;
};