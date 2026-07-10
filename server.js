/********************************************************************************
* WEB322 – Assignment 02
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
* Published URL: https://web-322-assignment2-dub33m1.vercel.app
*
********************************************************************************/

const express = require("express");
const path = require("path");

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

const projectData = require("./modules/projects");

const HTTP_PORT = process.env.PORT || 8080;

projectData.initialize()
.then(function () {

    // Home
    app.get("/", function (req, res) {

        res.render("home");

    });

    // About
    app.get("/about", function (req, res) {

        res.render("about");

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

    app.listen(HTTP_PORT, function () {

        console.log("Server listening on port: " + HTTP_PORT);

    });

})
.catch(function (err) {

    console.log(err);

});