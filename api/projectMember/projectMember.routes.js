const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const { getProjectMember, getProjectMembers, deleteProjectMember, addProjectMember, updateProjectMember } = require('./projectMember.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getProjectMembers)
router.get('/:id', getProjectMember)
router.post('/',  requireAuth, addProjectMember)
router.put('/:id',  requireAuth, updateProjectMember)
// router.delete('/:id',  requireAuth, requireAdmin, deleteProjectMember)
router.delete('/:id',  deleteProjectMember)

module.exports = router