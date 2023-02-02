const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const { getTeam, getTeams, deleteTeam, addTeam, updateTeam, getTeamFull, getTeamsFull } = require('./team.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getTeams)
router.get('/:id', getTeam)
router.post('/',  requireAuth, addTeam)
router.put('/:id',  requireAuth, updateTeam)
// router.delete('/:id',  requireAuth, requireAdmin, deleteTeam)
router.delete('/:id',   deleteTeam)

module.exports = router