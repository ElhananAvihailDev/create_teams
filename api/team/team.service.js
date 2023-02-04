const dbService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')
const teamMemberService = require('./teamMember.service')


module.exports = {
    query,
    getById,
    add,
    update,
    remove,

}

const TEAM_TXT_FIELDS = ['name', 'description']


async function query(criteria) {
    try {
        let sql = `SELECT * FROM team`
        sql += sqlUtilService.getWhereSql(criteria, TEAM_TXT_FIELDS)

        const teams = await dbService.runSQL(sql)
        if (!teams?.length) return []

        for await (const team of teams) {
            team.members = await teamMemberService.query({ teamId: team.id })
        }

        return teams.map(team => _getOutputTeam(team))
    } catch (error) {
        throw error
    }
}

async function getById(teamId) {
    try {
        const sql = `
            SELECT * FROM team
            WHERE id = ${teamId};
        `

        const [team] = await dbService.runSQL(sql)
        if (!team) return null
        team.members = await teamMemberService.query({ teamId: team.id })
        return _getOutputTeam(team)
    } catch (error) {
        throw error
    }
}

async function add(team) {
    try {
        const { name, description, projectId } = team
        const sql = `
            INSERT INTO team (name, description, projectId) 
            VALUES ("${name}","${description}", "${projectId}");
            `
        const { insertId } = await dbService.runSQL(sql)
        if (!insertId) throw new Error(`Cannot add team:\n"${name}", in project:"${projectId}", by user:"${creatorId}"`)
        team.id = insertId
        team.members = await teamMemberService.addMany(team.id, team.members)


        return team
    } catch (error) {
        throw error
    }
}


async function update(team) {
    try {
        const { name, description, isActive, members } = team
        const sql = `UPDATE team SET
                 name="${name}", description="${description}", isActive="${isActive}"
                 WHERE id = ${team.id};`
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows !== 1) throw new Error(`No team updated - team id ${team.id}`)
        if (team.members) {
            team.members = await teamMemberService.resetTeamMembers(team.id, team.members)
        }
        return team
    } catch (error) {
        throw error
    }
}

async function remove(teamId) {
    const sql = `DELETE FROM team WHERE id = ${teamId}`
    try {
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No team deleted - team id ${teamId}`)
    } catch (error) {
        throw error
    }
}

function _getOutputTeam(team) {
    const outputTeam = {
        ...team
    }
    if (team.createdAt) {
        outputTeam.createdAt = sqlUtilService.getJsTimestamp(team.createdAt)
    }
    return outputTeam
}