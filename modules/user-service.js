const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

function initialize(connectionString) {

    return new Promise((resolve, reject) => {

        mongoose.connect(connectionString, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });

        const db = mongoose.connection;

        db.on("error", (err) => {
            reject(err);
        });

        db.once("open", () => {
            console.log("MongoDB Connected");
            resolve();
        });

    });

}

function registerUser(userData) {

    return new Promise(async (resolve, reject) => {

        try {

            const hash = await bcrypt.hash(userData.password, 10);

            userData.password = hash;

            const newUser = new User(userData);

            await newUser.save();

            resolve("User registered successfully");

        } catch (err) {

            if (err.code === 11000) {
                reject("User Name already taken");
            } else {
                reject("Unable to register user");
            }

        }

    });

}

function checkUser(userData) {

    return new Promise(async (resolve, reject) => {

        try {

            const user = await User.findOne({
                userName: userData.userName
            });

            if (!user) {
                reject("Unable to find user");
                return;
            }

            const match = await bcrypt.compare(userData.password, user.password);

            if (match) {
                resolve(user);
            } else {
                reject("Incorrect Password");
            }

        } catch (err) {
            reject("Unable to login");
        }

    });

}

module.exports = {
    initialize,
    registerUser,
    checkUser
};