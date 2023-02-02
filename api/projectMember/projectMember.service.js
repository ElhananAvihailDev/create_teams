const dbService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')


module.exports = {
    query,
    getById,
    add,
    addMany,
    update,
    updateMany,
    remove,
    removeByProjectId

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


async function getById(projectMemberId) {
    try {
        const sql = `
            SELECT * 
            FROM projectMember 
            WHERE id = ${projectMemberId};
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
        const { userId, projectId, isActive = true, prefs = [null] } = projectMember
        console.log('projectMember',projectMember);
        
        const sql = `
            INSERT INTO projectMember (userId, projectId, isActive, ${prefs.map((pref, idx) => 'preference_' + idx).join()}) 
            VALUES (${userId},${projectId}, ${+isActive}, ${prefs.join()});
        `
        const { insertId } = await dbService.runSQL(sql)
        if (!insertId) throw new Error(`Cannot add projectMember:\n"${name}", desc:"${description}", by user:"${creatorId}"`)
        projectMember = {
            ...projectMember,
            id: insertId,
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
    const { isActive = true, prefs = [null] } = projectMember
    const sql = `
        UPDATE projectMember SET
        isActive=${+isActive}, ${prefs.map((pref, idx) => `preference_${idx}=${pref}`).join()}
        WHERE userId = ${projectMember.userId} AND projectId = ${projectMember.projectId};
    `
    try {
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows !== 1) throw new Error(`No projectMember updated - projectMember id ${projectMember.id}`) 
        return projectMember
    } catch (error) {
        throw error
    }
}


async function updateMany(projectId, members) {
    try {
        const addMembers = []
        const updateMembers = members.filter(member => {
            if (member.id) return true
            addMembers.push(member)
            return false
        })

        for await (const member of updateMembers) {
            await update(member)
        }
        // await Promise.all(updateMembers.map(update))
        const notRemoveIds = updateMembers.map(member => member.id)
        await removeByProjectId(projectId, notRemoveIds)
        await addMany(projectId, addMembers)
        return await query({ projectId })
    } catch (error) {
        throw error
    }
}


async function removeByProjectId(projectId, notRemoveIds) {
    console.log("🚀 ~ file: projectMember.service.js:128 ~ removeByProjectId ~ notRemoveIds", notRemoveIds)
    try {
        let sql = `DELETE FROM projectMember
        WHERE projectId = ${projectId}`
        if (notRemoveIds?.length) sql += ` AND NOT id IN (${notRemoveIds.join()})`

        const okPacket = await dbService.runSQL(sql)
        return okPacket
    } catch (error) {
        throw error
    }
}

async function remove(projectMemberId) {
    const sql = `DELETE FROM projectMember WHERE id = ${projectMemberId}`
    try {
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No projectMember deleted - projectMember id ${projectMemberId}`)
    } catch (error) {
        throw error
    }
}

function _getOutputProjectMember(projectMember) {
    const outputProjectMember = {
        id: projectMember.id,
        userId: projectMember.userId,
        projectId: projectMember.projectId,
        isActive: !!projectMember.isActive,
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