import { addAuditLog } from './database'

// Funkce pro logování změn
export const logChange = async (
  eventId: string,
  action: string,
  tableName: string,
  recordId: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
) => {
  try {
    await addAuditLog({
      event_id: eventId,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues || null,
      new_values: newValues || null
    })
  } catch (error) {
    console.error('Chyba při logování změny:', error)
  }
}

// Wrapper pro databázové operace s audit logem
export const withAuditLog = <T extends unknown[], R>(
  operation: (...args: T) => Promise<R>,
  eventId: string,
  action: string,
  tableName: string,
  getRecordId: (result: R) => string,
  getOldValues?: (...args: T) => Record<string, unknown>,
  getNewValues?: (result: R) => Record<string, unknown>
) => {
  return async (...args: T): Promise<R> => {
    const result = await operation(...args)
    
    const recordId = getRecordId(result)
    const oldValues = getOldValues ? getOldValues(...args) : null
    const newValues = getNewValues ? getNewValues(result) : null
    
    await logChange(eventId, action, tableName, recordId, oldValues || undefined, newValues || undefined)
    
    return result
  }
} 