const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const { getProject, getProjects, deleteProject, addProject, updateProject } = require('./project.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getProjects)
router.get('/:id', getProject)
router.post('/',  requireAuth, addProject)
router.put('/:id',  requireAuth, updateProject)
// router.delete('/:id',  requireAuth, requireAdmin, deleteProject)
router.delete('/:id',   deleteProject)

module.exports = router