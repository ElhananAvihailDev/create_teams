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
    removeByCriteria: removeByTeamId

}

const TEAM_MEMBER_TXT_FIELDS = ['name', 'description']


async function query(criteria) {
    try {
        let sql = `
            SELECT *
            FROM teamMember`
        sql += sqlUtilService.getWhereSql(criteria, TEAM_MEMBER_TXT_FIELDS)

        const teamMembers = await dbService.runSQL(sql)
        if (!teamMembers?.length) return []
        return teamMembers.map(teamMember => _getOutputTeamMember(teamMember))
    } catch (error) {
        throw error
    }
}

async function getById(teamMemberId) {
    try {
        const sql = `
            SELECT * 
            FROM teamMember 
            WHERE id = ${teamMemberId};
        `
        const [teamMember] = await dbService.runSQL(sql)
        if (!teamMember) return null
        return _getOutputTeamMember(teamMember)
    } catch (error) {
        throw error
    }
}

async function add(teamMember) {
    try {
        const { userId, teamId } = teamMember
        const sql = `
            INSERT INTO teamMember (userId, teamId) 
            VALUES (${userId}, ${teamId})
        `
        const { insertId } = await dbService.runSQL(sql)
        if (!insertId) throw new Error(`Cannot add teamMember:\n userId: ${userId},as member in team: ${teamId}`)
        teamMember = {
            ...teamMember,
            id: insertId,
            createdAt: Date.now()
        }
        return _getOutputTeamMember(teamMember)
    } catch (error) {
        throw error
    }
}

async function addMany(teamId, members) {
    try {
        return await Promise.all(members.map(member => add({ ...member, teamId })))
    } catch (error) {
        throw error
    }
}

async function update(teamMember) {
    try {
        const { isActive = true } = teamMember
        const sql = `
            UPDATE teamMember SET
            isActive=${+isActive}
            WHERE id = ${teamMember.id};
        `
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows !== 1) throw new Error(`No teamMember updated - teamMember id ${teamMember.id}`)
        return teamMember
    } catch (error) {
        throw error
    }
}



async function updateMany(teamId, members) {
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
        await removeByTeamId(teamId, notRemoveIds)
        await addMany(teamId, addMembers)
        return await query({ teamId })
    } catch (error) {
        throw error
    }
}



async function remove(teamMemberId) {
    try {
        const sql = `DELETE FROM teamMember WHERE id = ${teamMemberId}`
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No teamMember deleted - teamMember id ${teamMemberId}`)
    } catch (error) {
        throw error
    }
}

async function removeByTeamId(teamId, notRemoveIds) {
    try {
        let sql = `DELETE FROM teamMember
        WHERE teamId = ${teamId}`
        if (notRemoveIds?.length) sql += ` AND NOT id IN (${notRemoveIds.join()})`

        const okPacket = await dbService.runSQL(sql)
        return okPacket
    } catch (error) {
        throw error
    }
}

function _getOutputTeamMember(teamMember) {
    const outputTeamMember = {
        ...teamMember
    }
    if (teamMember.createdAt) {
        outputTeamMember.createdAt = sqlUtilService.getJsTimestamp(teamMember.createdAt)
    }
    return outputTeamMember
}