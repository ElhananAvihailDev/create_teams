const dbService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')


module.exports = {
    query,
    getByMemberProjectIds,
    add,
    addMany,
    update,
    resetProjectMembers,
    removeByCriteria

}

const PROJECT_MEMBER_TXT_FIELDS = []


async function query(criteria) {
    try {
        let sql = `
            SELECT *
            FROM projectMember`
        sql += sqlUtilService.getWhereSql(criteria, PROJECT_MEMBER_TXT_FIELDS)

        const projectMembers = await dbService.runSQL(sql)
        if (!projectMembers?.length) return []
        return projectMembers.map(projectMember => _getOutputProjectMember(projectMember))
    } catch (error) {
        throw error
    }
}


async function getByMemberProjectIds(userId, projectId) {
    try {
        const sql = `
            SELECT * 
            FROM projectMember 
            WHERE userId = ${userId} AND , projectId = ${projectId};
        `
        const [projectMember] = await dbService.runSQL(sql)
        if (!projectMember) return null
        return _getOutputProjectMember(projectMember)
    } catch (error) {
        throw error
    }
}


async function add(projectMember) {
    try {
        const { userId, projectId, isActive = true, permissions = 0, prefs = [null] } = projectMember
        console.log('projectMember', projectMember);

        const sql = `
            INSERT INTO projectMember (userId, projectId, isActive, permissions,${prefs.map((pref, idx) => 'preference_' + idx).join()}) 
            VALUES (${userId},${projectId}, ${+isActive},${permissions}, ${prefs.join()});
        `
        const { affectedRows } = await dbService.runSQL(sql)
        if (!affectedRows) throw new Error(`Cannot add projectMember:\n" userId: ${userId}, projectId: ${projectId}`)
        projectMember = {
            userId,
            projectId,
            isActive,
            permissions,
            prefs,
            createdAt: Date.now()
        }
        return projectMember
    } catch (error) {
        throw error
    }
}


async function addMany(projectId, members) {
    try {
        return await Promise.all(members.map(member => add({ ...member, projectId })))
    } catch (error) {
        throw error
    }
}


async function update(projectMember) {
    const { userId, projectId, isActive = true, permissions = 0, prefs = [null] } = projectMember
    const sql = `
        UPDATE projectMember SET
        isActive = ${+isActive},
        permissions = ${permissions},
        ${prefs.map((pref, idx) => `preference_${idx}=${pref}`).join()}
        WHERE userId = ${userId} AND projectId = ${projectId};
    `
    try {
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows !== 1) throw new Error(`No projectMember updated -  userId: ${userId}, projectId: ${projectId}`)
        return projectMember
    } catch (error) {
        throw error
    }
}


async function resetProjectMembers(projectId, members) {
    try {
        await removeByCriteria({ projectId })
        await addMany(projectId, members)
        return await query({ projectId })
    } catch (error) {
        throw error
    }
}



async function removeByCriteria(criteria) {
    try {
        let sql = `DELETE FROM projectMember`
        sql += sqlUtilService.getWhereSql(criteria)
        const okPacket = await dbService.runSQL(sql)
        return okPacket
    } catch (error) {
        throw error
    }
}


function _getOutputProjectMember(projectMember) {
    const outputProjectMember = {
        userId: projectMember.userId,
        projectId: projectMember.projectId,
        isActive: !!projectMember.isActive,
        permissions: projectMember.permissions,
        prefs: [
            projectMember.preference_0,
            projectMember.preference_1,
            projectMember.preference_2,
            projectMember.preference_3,
            projectMember.preference_4,
            projectMember.preference_5,
            projectMember.preference_6,
            projectMember.preference_7,
            projectMember.preference_8,
            projectMember.preference_9
        ].filter(pref => pref)
    }

    if (projectMember.createdAt) {
        outputProjectMember.createdAt = sqlUtilService.getJsTimestamp(projectMember.createdAt)
    }
    return outputProjectMember
}