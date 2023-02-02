const projectService = require('./project.service')
const logger = require('../../services/logger.service')

async function getProject(req, res) {
    const project = await projectService.getById(req.params.id)
    res.send(project)
}
  
async function getProjects(req, res) {
    console.log(req.query);
    const projects = await projectService.query(req.query)
    res.send(projects)
}

async function deleteProject(req, res) {
    await projectService.remove(req.params.id)
    res.send()
}

async function updateProject(req, res) {
    const project = req.body;
    await projectService.update(project)
    res.send(project)
}


async function addProject(req, res) {
    var project = req.body;
    // project.creatorId = req.session?.user?._id || null
    project.creatorId = req.session?.user?._id || 1
    project = await projectService.add(project)
    res.send(project)
}


module.exports = {
    getProject,
    getProjects,
    deleteProject,
    addProject,
    updateProject
}