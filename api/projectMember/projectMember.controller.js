const projectMemberService = require('./projectMember.service')
const logger = require('../../services/logger.service')

async function getProjectMember(req, res) {
    const projectMember = await projectMemberService.getById(req.params.id)
    res.send(projectMember)
}
  
async function getProjectMembers(req, res) {
    console.log(req.query);
    const projectMembers = await projectMemberService.query(req.query)
    res.send(projectMembers)
}

async function deleteProjectMember(req, res) {
    await projectMemberService.remove(req.params.id)
    res.send()
}

async function updateProjectMember(req, res) {
    const projectMember = req.body;
    await projectMemberService.update(projectMember)
    res.send(projectMember)
}


async function addProjectMember(req, res) {
    var projectMember = req.body;
    // projectMember.creatorId = req.session?.user?._id || null
    projectMember.creatorId = req.session?.user?._id || 1
    projectMember = await projectMemberService.add(projectMember)
    res.send(projectMember)
}


module.exports = {
    getProjectMember,
    getProjectMembers,
    deleteProjectMember,
    addProjectMember,
    updateProjectMember
}