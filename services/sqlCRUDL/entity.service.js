const sqlUtilService = require('./sqlUtil.service')

module.exports = class EntityCRUDService {
    constructor(entityOptions, DBService) {
        const { tableName, entityName, createFields, updateFields, txtFields, getOutputEntity = _getOutputEntity } = entityOptions
        this.tableName  = tableName
        this.entityName  = entityName
        this.createFields  = createFields
        this.updateFields  = updateFields
        this.txtFields  = txtFields
        this.getOutputEntity = getOutputEntity

        this.DBService = DBService
    }

    query = async (criteria) => {
        let sql = `SELECT * FROM ${this.tableName} `
        sql += sqlUtilService.getWhereSql(criteria, this.txtFields)

        try {
            const entitys = await this.DBService.runSQL(sql)
            if (!entitys?.length) return []
            return entitys.map(entity => this.getOutputEntity(entity))
        } catch (error) {
            throw error
        }
    }

    getById = async (entityId) => {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ${entityId};`
        try {
            const [entity] = await this.DBService.runSQL(sql)
            if (!entity) return null
            return this.getOutputEntity(entity)
        } catch (error) {
            throw error
        }
    }

    add = async (entity) => {
        const entityValuesStrs = sqlUtilService.getValueStrs(entity, this.createFields, this.txtFields)
        const sql = `INSERT INTO ${this.tableName} (${this.createFields.join()}) 
                     VALUES (${entityValuesStrs.join()});
                    `
        try {
            const { insertId } = await this.DBService.runSQL(sql)
            if (!insertId) throw new Error(`Cannot add entity: ${entityValuesStrs.join()}`)
            entity.id = insertId
            return entity
        } catch (error) {
            throw error
        }
    }

    addMany = async (entities, returnCriteria) => {
        const fieldsValuesStrs = entities.map(entity => {
            const fields = sqlUtilService.getValueStrs(entity, this.createFields, this.txtFields)
            return `(${fields.join()})`
        })
        const sql = `
            INSERT INTO ${this.tableName} (${this.createFields.join()})
            VALUES ${fieldsValuesStrs.join()};
        `
        try {
            const okPacket = await this.DBService.runSQL(sql)
            return await this.query(returnCriteria)
        } catch (error) {
            throw error
        }
    }

    update = async (entity) => {
        const entityValuesStrs = sqlUtilService.getValueStrs(entity, this.updateFields, this.txtFields)
        const setFieldsStrs = this.updateFields.map((fieldName, idx) => `${fieldName} = ${entityValuesStrs[idx]}`)
        const sql = `UPDATE ${this.tableName} SET ${setFieldsStrs.join()} WHERE id = ${entity.id};`
        try {
            const okPacket = await this.DBService.runSQL(sql)
            if (okPacket.affectedRows !== 1) throw new Error(`No entity updated - entity id ${entity.id}`)
            return entity
        } catch (error) {
            throw error
        }
    }

    remove = async (entityId) => {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ${entityId}`
        try {
            const okPacket = await this.DBService.runSQL(sql)
            if (okPacket.affectedRows === 1) return okPacket
            else throw new Error(`No entity deleted - entity id ${entityId}`)
        } catch (error) {
            throw error
        }
    }


    updateByCriteria = async (entity, criteria) => {
        entity = { ...entity }
        delete entity.id
        const entityValuesStrs = sqlUtilService.getValueStrs(entity, this.updateFields, this.txtFields)
        const setFieldsStrs = this.updateFields.map((fieldName, idx) => `${fieldName} = ${entityValuesStrs[idx]}`)
        const sql = `UPDATE ${this.tableName} SET
                         ${setFieldsStrs.join()}
                        `
        sql += sqlUtilService.getWhereSql(criteria, this.txtFields)

        try {
            const okPacket = await this.DBService.runSQL(sql)
            if (okPacket.affectedRows !== 1) throw new Error(`No entity updated - entity id ${entity.id}`)
            return entity
        } catch (error) {
            throw error
        }
    }

    removeByCriteria = async (criteria, exceptIds) => {
        try {
            const okPacket = await sqlUtilService.removeMultiWhere(this.tableName, { [entityAKey]: entityAId }, { exceptFieldName: 'id', exceptValues: exceptIds })
            return okPacket.affectedRows
        } catch (error) {
            throw error
        }
    }
}



function _getOutputEntity(entity) {
    const outputEntity = {
        ...entity
    }
    if (entity.createdAt) {
        outputEntity.createdAt = sqlUtilService.getJsTimestamp(entity.createdAt)
    }
    return outputEntity
}