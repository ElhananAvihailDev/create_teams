const dbService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')
const projectMemberService = require('../projectMember/projectMember.service')


module.exports = {
    query,
    getById,
    add,
    update,
    remove,

}

const PROJECT_TXT_FIELDS = ['name', 'description']


async function query(criteria) {
    try {
        let sql = `
            SELECT *
            FROM project`
        sql += sqlUtilService.getWhereSql(criteria, PROJECT_TXT_FIELDS)

        const projects = await dbService.runSQL(sql)
        if (!projects?.length) return []

        for await (const project of projects) {
            project.members = await projectMemberService.query({ projectId: project.id })
        }

        return projects.map(project => _getOutputProject(project))
    } catch (error) {
        throw error
    }
}

async function getById(projectId) {
    try {
        const sql = `
            SELECT * 
            FROM project 
            WHERE id = ${projectId};
        `
        const [project] = await dbService.runSQL(sql)
        if (!project) return null
        project.members = await projectMemberService.query({ projectId: project.id })
        return _getOutputProject(project)
    } catch (error) {
        throw error
    }
}

async function add(project) {
    try {
        const { name, description, creatorId } = project
        const sql = `
            INSERT INTO project (name, description, creatorId) 
            VALUES ("${name}","${description}", "${creatorId}");
        `
        const { insertId } = await dbService.runSQL(sql)
        if (!insertId) throw new Error(`Cannot add project:\n"${name}", desc:"${description}", by user:"${creatorId}"`)
        project.id = insertId
        if (project.members) {
            project.members = await projectMemberService.resetProjectMembers(project.id, project.members)
        }
        return project
    } catch (error) {
        throw error
    }
}


async function update(project) {
    const { name, description, isActive = true, isPublished = false } = project
    const sql = `
        UPDATE project SET
        name="${name}",
        description="${description}",
        isActive=${isActive? 1:0},
        isPublished=${isPublished? 1:0}
        WHERE id = ${project.id};
    `
    try {
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows !== 1) throw new Error(`No project updated - project id ${project.id}`)
        if (project.members) {
            project.members = await projectMemberService.resetProjectMembers(project.id, project.members)
        }
        return project
    } catch (error) {
        throw error
    }
}

async function remove(projectId) {
    const sql = `DELETE FROM project WHERE id = ${projectId}`
    try {
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No project deleted - project id ${projectId}`)
    } catch (error) {
        throw error
    }
}

function _getOutputProject(project) {
    const outputProject = {
        ...project
    }
    if (project.createdAt) {
        outputProject.createdAt = sqlUtilService.getJsTimestamp(project.createdAt)
    }
    return outputProject
}