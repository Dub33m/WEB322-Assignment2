/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Christian Chidubem
* Student ID: 114351240
* Date: 2026-07-10
*
* Published URL: https://web-322-assignment3-dub33m1.vercel.app
*
********************************************************************************/


const express = require("express");
const path = require("path");

const dotenv = require("dotenv");
const clientSessions = require("client-sessions");

const projectData = require("./modules/projects");
const userService = require("./modules/user-service");
const taskService = require("./modules/task-service");

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: "session",
    secret: "web322_assignment3_secret",
    duration: 20 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));

app.use(function (req, res, next) {

    res.locals.session = req.session;

    next();

});

function ensureLogin(req, res, next) {

    if (!req.session.user) {

        return res.redirect("/login");

    }

    next();

}

app.set("view engine", "ejs");

const HTTP_PORT = process.env.PORT || 8080;

// This promise is created once, when the module first loads. On a
// serverless platform like Vercel, the module can be reused across
// multiple requests in the same warm instance, so every request just
// awaits this same promise instead of re-connecting every time.
const dbReady = Promise.all([
    projectData.initialize(),
    userService.initialize(process.env.MONGODB_CONNECTION_STRING),
    taskService.initialize(process.env.POSTGRES_CONNECTION_STRING)
])
.then(function () {

    console.log("All data sources connected");

})
.catch(function (err) {

    console.log("Data source initialization failed:", err);

    // Re-throw so any request awaiting dbReady also sees the rejection
    // instead of hanging forever.
    throw err;

});

// Every request waits here until the databases are ready before it
// reaches any route below. Routes themselves are registered immediately
// (synchronously) so Vercel can see them as soon as the module loads.
app.use(function (req, res, next) {

    dbReady

    .then(function () {

        next();

    })

    .catch(function (err) {

        res.status(500).send("Service temporarily unavailable. Please try again shortly.");

    });

});

// Home
app.get("/", function (req, res) {

    res.render("home");

});

// About
app.get("/about", function (req, res) {

    res.render("about");

});

// Register Page
app.get("/register", function (req, res) {

    res.render("register", {
        errorMessage: ""
    });

});

app.post("/register", function (req, res) {

    userService.registerUser(req.body)

    .then(function () {

        res.redirect("/login");

    })

    .catch(function (err) {

        res.render("register", {
            errorMessage: err
        });

    });

});

// Login Page
app.get("/login", function (req, res) {

    res.render("login");

});

app.post("/login", function (req, res) {

    userService.checkUser(req.body)

    .then(function (user) {

        req.session.user = {
            _id: user._id,
            userName: user.userName,
            email: user.email
        };

        res.redirect("/dashboard");

    })

    .catch(function (err) {

        res.render("login", {
            errorMessage: err,
            userName: req.body.userName
        });

    });

});

// Logout
app.get("/logout", function (req, res) {

    req.session.reset();

    res.redirect("/");

});

// Dashboard
app.get("/dashboard", ensureLogin, function (req, res) {

    res.render("dashboard", {
        user: req.session.user
    });

});

// Tasks
app.get("/tasks", ensureLogin, function (req, res) {

    taskService.getAllTasks(req.session.user._id)

    .then(function (tasks) {

        res.render("tasks", {
            tasks: tasks
        });

    })

    .catch(function (err) {

        res.render("tasks", {
            tasks: [],
            errorMessage: err
        });

    });

});

// Add Task Page
app.get("/tasks/add", ensureLogin, function (req, res) {

    res.render("addTask");

});

// Save Task
app.post("/tasks/add", ensureLogin, function (req, res) {

    req.body.userId = req.session.user._id;

    taskService.addTask(req.body)

    .then(function () {

        res.redirect("/tasks");

    })

    .catch(function (err) {

        res.send(err);

    });

});

// Delete Task
app.post("/tasks/delete/:id", ensureLogin, function (req, res) {

    taskService.deleteTask(req.params.id)

    .then(function () {

        res.redirect("/tasks");

    })

    .catch(function (err) {

        res.send(err);

    });

});

// Edit Task Page
app.get("/tasks/edit/:id", ensureLogin, function (req, res) {

    taskService.getTaskById(req.params.id)

    .then(function (task) {

        res.render("editTask", {
            task: task
        });

    })

    .catch(function (err) {

        res.send(err);

    });

});

// Save Edited Task
app.post("/tasks/edit/:id", ensureLogin, function (req, res) {

    taskService.updateTask(req.params.id, req.body)

    .then(function () {

        res.redirect("/tasks");

    })

    .catch(function (err) {

        res.send(err);

    });

});

// All Projects / Filter by Sector
app.get("/solutions/projects", function (req, res) {

    if (req.query.sector) {

        projectData.getProjectsBySector(req.query.sector)

        .then(function (projects) {

            res.render("projects", {
                projects: projects
            });

        })

        .catch(function () {

            res.status(404).render("404", {
                message: "No projects found for sector: " + req.query.sector
            });

        });

    }
    else {

        projectData.getAllProjects()

        .then(function (projects) {

            res.render("projects", {
                projects: projects
            });

        })

        .catch(function (err) {

            res.status(404).render("404", {
                message: err
            });

        });

    }

});

// Single Project
app.get("/solutions/projects/:id", function (req, res) {

    projectData.getProjectById(req.params.id)

    .then(function (project) {

        res.render("project", {
            project: project
        });

    })

    .catch(function (err) {

        res.status(404).render("404", {
            message: err
        });

    });

});

// 404
app.use(function (req, res) {

    res.status(404).render("404", {
        message: "I'm sorry, we're unable to find what you're looking for."
    });

});

if (require.main === module) {

    app.listen(HTTP_PORT, function () {

        console.log("Server listening on port: " + HTTP_PORT);

    });

}

module.exports = app;