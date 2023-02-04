const dbService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')


module.exports = {
    query,
    getByMemberTeamIds,
    add,
    addMany,
    update,
    resetTeamMembers,
    removeByCriteria

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

async function getByMemberTeamIds(memberId, teamId) {
    try {
        const sql = `
            SELECT * 
            FROM teamMember 
            WHERE memberId = ${memberId} AND teamId = ${teamId};
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
        const { affectedRows } = await dbService.runSQL(sql)
        if (!affectedRows) throw new Error(`Cannot add teamMember:\n userId: ${userId},as member in team: ${teamId}`)
        teamMember = {
            ...teamMember,
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
        const { isActive = true, userId, teamId } = teamMember
        const sql = `
            UPDATE teamMember SET
            isActive=${+isActive}
            WHERE userId = ${userId} AND teamId = ${teamId};
        `
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows !== 1) throw new Error(`No teamMember updated - userId: ${userId}, teamId: ${teamId}`)
        return teamMember
    } catch (error) {
        throw error
    }
}



async function resetTeamMembers(teamId, members) {
    try {
        await removeByCriteria({ teamId })
        await addMany(teamId, members)
        return await query({ teamId })
    } catch (error) {
        throw error
    }
}



async function removeByCriteria(criteria) {
    try {
        let sql = `DELETE FROM teamMember`
        sql += sqlUtilService.getWhereSql(criteria)
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