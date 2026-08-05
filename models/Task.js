const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

    return sequelize.define("Task", {

        title: {
            type: DataTypes.STRING,
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT
        },

        dueDate: {
            type: DataTypes.DATE
        },

        status: {
    type: DataTypes.STRING,
    defaultValue: "pending"
},

        userId: {
            type: DataTypes.STRING
        }

    });

};