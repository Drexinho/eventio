import { query, transaction } from './postgresql'
import type { Event, Participant, Transport, InventoryItem, AuditLog } from '@/types/database'

// Funkce pro získání události podle PIN kódu
export const getEventByPin = async (pin: string): Promise<any> => {
  const result = await query(`
    SELECT * FROM events WHERE pin_code = $1
  `, [pin])

  if (result.rows.length === 0) {
    throw new Error('Událost nebyla nalezena')
  }

  return result.rows[0]
}

// Event funkce
export const createEvent = async (eventData: Omit<Event, 'id' | 'created_at'>) => {
  const result = await query(`
    INSERT INTO events (name, description, start_date, end_date, max_participants, price, access_type, access_token, map_link, booking_link, image_url, payment_status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `, [
    eventData.name,
    eventData.description,
    eventData.start_date,
    eventData.end_date,
    eventData.max_participants,
    eventData.price,
    eventData.access_type,
    eventData.access_token,
    eventData.map_link,
    eventData.booking_link,
    eventData.image_url,
    eventData.payment_status || 'unpaid'
  ])
  return result.rows[0]
}

export const updateEvent = async (id: string, updates: Partial<Event>) => {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
  const values = Object.values(updates).filter((_, index) => fields[index])
  
  if (fields.length === 0) {
    throw new Error('Žádné pole k aktualizaci')
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
  const result = await query(`
    UPDATE events SET ${setClause} WHERE id = $1 RETURNING *
  `, [id, ...values])

  if (result.rows.length === 0) {
    throw new Error('Událost nebyla nalezena')
  }

  return result.rows[0]
}

export const getEventByToken = async (token: string) => {
  const result = await query(`
    SELECT * FROM events WHERE access_token = $1
  `, [token])

  if (result.rows.length === 0) {
    throw new Error('Událost nebyla nalezena')
  }

  return result.rows[0]
}

// Participant funkce
export const getParticipants = async (eventId: string) => {
  const result = await query(`
    SELECT * FROM participants 
    WHERE event_id = $1 
    ORDER BY created_at ASC
  `, [eventId])

  return result.rows
}

export const addParticipant = async (eventId: string, participantData: Omit<Participant, 'id' | 'event_id' | 'created_at' | 'updated_at'>) => {
  const result = await query(`
    INSERT INTO participants (event_id, name, staying_full_time, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [eventId, participantData.name, participantData.staying_full_time, participantData.notes])
  return result.rows[0]
}

export const updateParticipant = async (id: string, updates: Partial<Participant>) => {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'event_id' && key !== 'created_at' && key !== 'updated_at')
  const values = Object.values(updates).filter((_, index) => fields[index])
  
  if (fields.length === 0) {
    throw new Error('Žádné pole k aktualizaci')
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
  const result = await query(`
    UPDATE participants SET ${setClause} WHERE id = $1 RETURNING *
  `, [id, ...values])

  if (result.rows.length === 0) {
    throw new Error('Účastník nebyl nalezen')
  }

  return result.rows[0]
}

export const deleteParticipant = async (id: string) => {
  const result = await query(`
    DELETE FROM participants WHERE id = $1 RETURNING *
  `, [id])

  if (result.rows.length === 0) {
    throw new Error('Účastník nebyl nalezen')
  }

  return result.rows[0]
}

// Transport funkce
export const getTransport = async (eventId: string) => {
  const result = await query(`
    SELECT 
      t.*,
      COALESCE(
        json_agg(
          json_build_object(
            'participant_id', ta.participant_id
          )
        ) FILTER (WHERE ta.participant_id IS NOT NULL),
        '[]'::json
      ) as transport_assignments
    FROM transport t
    LEFT JOIN transport_assignments ta ON t.id = ta.transport_id
    WHERE t.event_id = $1 
    GROUP BY t.id, t.event_id, t.type, t.departure_location, t.departure_time, t.arrival_location, t.intermediate_stops, t.capacity, t.price, t.notes, t.created_at, t.updated_at
    ORDER BY t.created_at ASC
  `, [eventId])
  return result.rows
}

export const addTransport = async (eventId: string, transportData: Omit<Transport, 'id' | 'event_id' | 'created_at' | 'updated_at'>) => {
  const result = await query(`
    INSERT INTO transport (event_id, type, departure_location, departure_time, arrival_location, intermediate_stops, capacity, price, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    eventId,
    transportData.type,
    transportData.departure_location,
    transportData.departure_time,
    transportData.arrival_location,
    JSON.stringify(transportData.intermediate_stops),
    transportData.capacity,
    transportData.price,
    transportData.notes
  ])
  return result.rows[0]
}

export const updateTransport = async (id: string, updates: Partial<Transport>) => {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
  const values = Object.values(updates).map((value, index) => {
    const field = fields[index]
    if (field === 'intermediate_stops') {
      return JSON.stringify(value)
    }
    return value
  }).filter((_, index) => fields[index])
  
  if (fields.length === 0) {
    throw new Error('Žádné pole k aktualizaci')
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
  const result = await query(`
    UPDATE transport SET ${setClause} WHERE id = $1 RETURNING *
  `, [id, ...values])

  if (result.rows.length === 0) {
    throw new Error('Doprava nebyla nalezena')
  }

  return result.rows[0]
}

export const deleteTransport = async (id: string) => {
  const result = await query(`
    DELETE FROM transport WHERE id = $1 RETURNING *
  `, [id])

  if (result.rows.length === 0) {
    throw new Error('Doprava nebyla nalezena')
  }

  return result.rows[0]
}

export const assignParticipantToTransport = async (transportId: string, participantId: string) => {
  const result = await query(`
    INSERT INTO transport_assignments (transport_id, participant_id)
    VALUES ($1, $2)
    RETURNING *
  `, [transportId, participantId])

  return result.rows[0]
}

export const removeParticipantFromTransport = async (transportId: string, participantId: string) => {
  const result = await query(`
    DELETE FROM transport_assignments 
    WHERE transport_id = $1 AND participant_id = $2 
    RETURNING *
  `, [transportId, participantId])

  if (result.rows.length === 0) {
    throw new Error('Přiřazení nebylo nalezeno')
  }

  return result.rows[0]
}

// Inventory funkce
export const getInventoryItems = async (eventId: string) => {
  const result = await query(`
    SELECT i.*, p.name as assigned_participant_name 
    FROM inventory_items i
    LEFT JOIN participants p ON i.assigned_to = p.id
    WHERE i.event_id = $1 
    ORDER BY i.created_at ASC
  `, [eventId])

  return result.rows
}

export const addInventoryItem = async (eventId: string, itemData: Omit<InventoryItem, 'id' | 'event_id' | 'created_at' | 'updated_at' | 'assigned_participant_name'>) => {
  const result = await query(`
    INSERT INTO inventory_items (event_id, name, description, quantity, assigned_to, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [eventId, itemData.name, itemData.description, itemData.quantity, itemData.assigned_to, itemData.notes])
  return result.rows[0]
}

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'event_id' && key !== 'created_at' && key !== 'updated_at' && key !== 'assigned_participant_name')
  const values = Object.values(updates).filter((_, index) => fields[index])
  
  if (fields.length === 0) {
    throw new Error('Žádné pole k aktualizaci')
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
  const result = await query(`
    UPDATE inventory_items SET ${setClause} WHERE id = $1 RETURNING *
  `, [id, ...values])

  if (result.rows.length === 0) {
    throw new Error('Položka nebyla nalezena')
  }

  return result.rows[0]
}

export const deleteInventoryItem = async (id: string) => {
  const result = await query(`
    DELETE FROM inventory_items WHERE id = $1 RETURNING *
  `, [id])

  if (result.rows.length === 0) {
    throw new Error('Položka nebyla nalezena')
  }

  return result.rows[0]
}

// Audit log funkce
export const addAuditLog = async (logData: Omit<AuditLog, 'id' | 'created_at'>) => {
  const result = await query(`
    INSERT INTO audit_logs (event_id, action, table_name, record_id, old_values, new_values)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [
    logData.event_id,
    logData.action,
    logData.table_name,
    logData.record_id,
    logData.old_values,
    logData.new_values
  ])

  return result.rows[0]
}

export const getAuditLogs = async (eventId: string) => {
  const result = await query(`
    SELECT * FROM audit_logs 
    WHERE event_id = $1 
    ORDER BY created_at DESC
  `, [eventId])

  return result.rows
}

// Utility funkce pro testování připojení
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time')
    return { success: true, time: result.rows[0].current_time }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}