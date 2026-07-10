const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
    return new Promise((resolve, reject) => {

        projectData.forEach(function(project) {

            let matchingSector = sectorData.find(function(sector) {
                return sector.id === project.sector_id;
            });

            project.sector = matchingSector.sector_name;

            projects.push(project);
        });

        console.log("Projects loaded:", projects.length);
        console.log("First project:", projects[0]);

        resolve();
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        resolve(projects);
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject) => {

        let project = projects.find(function(project) {
            return project.id == projectId;
        });

        if (project) {
            resolve(project);
        } else {
            reject("Unable to find requested project");
        }
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {

        let matchingProjects = projects.filter(function(project) {
            return project.sector
                .toLowerCase()
                .includes(sector.toLowerCase());
        });

        if (matchingProjects.length > 0) {
            resolve(matchingProjects);
        } else {
            reject("Unable to find requested projects");
        }
    });
}

module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector
};