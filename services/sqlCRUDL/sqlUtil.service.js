const DBService = require('../DBService')

module.exports = {
    getSqlTimestamp,
    getJsTimestamp,
    removeMultiWhere,
    getWhereSql,
    getValueStrs,
    getOutputThing
}

function getSqlTimestamp(jsTimestemp = Date.now()) {
    return new Date(jsTimestemp).toISOString().slice(0, 19).replace('T', ' ');
}



function getJsTimestamp(sqlTimestemp) {
    if (!sqlTimestemp) return Date.now()
    const timestemp = new Date(sqlTimestemp).getTime()
    if (!isNaN(timestemp)) return timestemp

    try {
        let sqlTimestempParts = sqlTimestemp.split(/[- :]/); // regular expression split that creates array with: year, month, day, hour, minutes, seconds values
        sqlTimestempParts[1]--; // monthIndex begins with 0 for January and ends with 11 for December so we need to decrement by one
        return new Date(...sqlTimestempParts).getTime(); // our Date object
    } catch (error) {
        throw new error('Invalid Sql timestamp: ' + sqlTimestemp)
    }
}


async function removeMultiWhere(tableName, criteria, except) {
    let sql = `DELETE FROM ${tableName}
               `
    sql += getWhereSql(criteria)

    if (except?.exceptFieldName && except?.exceptValues?.length) {
        const exceptSql = ` AND (${exceptFieldName} NOT IN(${exceptValues.join()}))`
        sql += exceptSql
    }
    try {
        const okPacket = await DBService.runSQL(sql)
        return okPacket
    } catch (error) {
        throw new Error(`Cannot deleted - rows in table "${tableName}" by: field "${fieldName}" = "${fieldValue}"`)
    }
}

function getWhereSql(criteria, txtFields = ['name', 'description']) {
    criteria = { ...criteria }
    if (typeof criteria !== 'object') return ''
    if (!Object.keys(criteria).length) return ''

    let whereSql = ' WHERE 1=1'
    if (criteria.txt && txtFields) {
        const namePart = criteria.txt || ''
        const txtFieldsStr = ` AND (${txtFields.map(field => `${field} LIKE '%${namePart}%'`).join(' OR ')} )`
        delete criteria.txt
        whereSql += txtFieldsStr
    }
    else delete criteria.txt
    const criteriaKeys = Object.keys(criteria).filter(key => criteria[key])
    const criteriaStr = criteriaKeys.map(key =>{
        let value
        switch (criteria[key]) {
            case true:
                value = 1
                break;
            case false:
                value = 0
                break;        
            default:
                value = criteria[key]
                break;
        }
        return `${key} = ${(typeof value === 'string')? `"${value}"` : value}`
    }).join(' AND ')
    if (criteriaStr) whereSql += ` AND (${criteriaStr})`

    return whereSql
}


function getValueStrs(entity, fieldNames, txtFields) {
    const values = fieldNames.map(fieldName => {
        const isTxt = txtFields?.includes(fieldName)
        return isTxt ? `"${entity[fieldName]}"` : entity[fieldName]
    })
    return values
}

function getOutputThing(entity) {
    const outputThing = {
        ...entity
    }
    if (entity.createdAt) {
        outputThing.createdAt = sqlUtilService.getJsTimestamp(entity.createdAt)
    }
    return outputThing
}
