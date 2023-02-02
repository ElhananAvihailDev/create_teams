const dbService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')


module.exports = {
    query,
    getById,
    add,
    update,
    remove,

}

const USER_TXT_FIELDS = ['username', 'email', 'phone']


async function query(criteria) {
    try {
        let sql = `SELECT * FROM user`
        sql += sqlUtilService.getWhereSql(criteria, USER_TXT_FIELDS)

        const users = await dbService.runSQL(sql)
        if (!users?.length) return []
        return users.map(user => _getOutputUser(user))
    } catch (error) {
        throw error
    }
}

async function getById(userId) {
    try {
        const sql = `SELECT * FROM user
        WHERE id = ${userId};`
        
        const [user] = await dbService.runSQL(sql)
        if (!user) return null
        return _getOutputUser(user)
    } catch (error) {
        throw error
    }
}

async function add({ username, password, email, phone }) {
    try {
        const sql = `INSERT INTO user (username, password, email, phone) 
                     VALUES ("${username}", ${password}, "${email}", "${phone}");
                    `
        const { insertId } = await dbService.runSQL(sql)
        if (!insertId) throw new Error(`Cannot add user:\n"${name}", in project:"${projectId}", by user:"${creatorId}"`)
        user.id = insertId
        return user
    } catch (error) {
        throw error
    }
}


async function update(user) {
    const { username, password, email, phone } = user
    const sql = `UPDATE user SET
                 username="${username}",
                 password="${password}",
                 email="${email}",
                 phone="${phone}"
                 WHERE id = ${user.id};`
    try {
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows !== 1) throw new Error(`No user updated - user id ${user.id}`)
        return user
    } catch (error) {
        throw error
    }
}

async function remove(userId) {
    const sql = `DELETE FROM user WHERE id = ${userId}`
    try {
        const okPacket = await dbService.runSQL(sql)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No user deleted - user id ${userId}`)
    } catch (error) {
        throw error
    }
}

function _getOutputUser(user) {
    const outputUser = {...user}
    delete outputUser.password
    if (user.createdAt) {
        outputUser.createdAt = sqlUtilService.getJsTimestamp(user.createdAt)
    }

    return outputUser
}