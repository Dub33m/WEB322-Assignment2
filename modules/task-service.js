const { Sequelize } = require("sequelize");
const TaskModel = require("../models/Task");

let sequelize;
let Task;

function initialize(connectionString) {

    return new Promise(async (resolve, reject) => {

        try {

            sequelize = new Sequelize(connectionString, {
                dialect: "postgres",
                protocol: "postgres",
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false
                    }
                },
                logging: false
            });

            Task = TaskModel(sequelize);

            await sequelize.sync();

            console.log("PostgreSQL Connected");

            resolve();

        } catch (err) {

            reject(err);

        }

    });

}

function getAllTasks(userId) {

    return Task.findAll({
        where: {
            userId: userId
        }
    });

}

function addTask(taskData) {

    return Task.create(taskData);

}

function getTaskById(id) {

    return Task.findByPk(id);

}

function updateTask(id, taskData) {

    return Task.update(taskData, {
        where: {
            id: id
        }
    });

}

function deleteTask(id) {

    return Task.destroy({
        where: {
            id: id
        }
    });

}

function updateTaskStatus(id, status) {

    return Task.update(
        {
            status: status
        },
        {
            where: {
                id: id
            }
        }
    );

}

module.exports = {
    initialize,
    getAllTasks,
    addTask,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus
};