const teamService = require('./team.service')
const logger = require('../../services/logger.service')

async function getTeam(req, res) {
    try {
        const team = await teamService.getById(req.params.id)
        if (team) res.send(team)
        res.end()
    } catch (error) {
        res.status(404).end()
    }
}

async function getTeams(req, res) {
    try {
        const {id, name, description, creatorId, projectId, userId, invited, interested} = req.query
        const criteria = {id, name, description, creatorId, projectId}
        const relatedCriteria = {userId, invited, interested} 
        const teams = await teamService.query(criteria, relatedCriteria)
        res.send(teams)
    } catch (error) {
        res.status(404).end()
    }
}

async function deleteTeam(req, res) {
    try {
        await teamService.remove(req.params.id)
        res.send()
    } catch (error) {
        res.status(404).end()
    }
}

async function updateTeam(req, res) {
    try {
        const team = req.body;
        await teamService.update(team)
        res.send(team)
    } catch (error) {
     res.status(404).end()   
    }
}


async function addTeam(req, res) {
    var team = req.body;
    // team.creatorId = req.session?.user?._id || null
    team.creatorId = req.session?.user?._id || 1
    team = await teamService.add(team)
    res.send(team)
}


module.exports = {
    getTeam,
    getTeams,
    deleteTeam,
    addTeam,
    updateTeam,
}