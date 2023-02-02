const userService = require('./user.service')
const logger = require('../../services/logger.service')

async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (error) {
        res.status(404).end()
    }
}

async function getUsers(req, res) {
    try {
        const users = await userService.query(req.query)
        res.send(users)
    } catch (error) {
        res.status(404).end()
    }
}

async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.status(200).end()
    } catch (error) {
        res.status(404).end()
    }
}

async function updateUser(req, res) {
    try {
        const user = req.body;
        await userService.update(user)
        res.send(user)
    } catch (error) {
        res.status(404).end()   
    }
}

module.exports = {
    getUser,
    getUsers,
    deleteUser,
    updateUser
}