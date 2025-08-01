export interface Event {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  max_participants: number
  price: number
  access_type: 'link' | 'pin'
  access_token: string
  pin_code: string | null
  map_link: string | null
  booking_link: string | null
  image_url: string | null
  payment_status: 'paid' | 'unpaid'
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  event_id: string
  name: string
  phone: string | null
  staying_full_time: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Transport {
  id: string
  event_id: string
  type: string
  departure_location: string | null
  departure_time: string | null
  arrival_location: string | null
  intermediate_stops: Array<{
    location: string
    time: string | null
    notes: string | null
  }>
  capacity: number
  price: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TransportAssignment {
  id: string
  transport_id: string
  participant_id: string
  created_at: string
}

export interface InventoryItem {
  id: string
  event_id: string
  name: string
  description: string | null
  quantity: number
  assigned_to: string | null
  assigned_participant_name: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WantedItem {
  id: string
  event_id: string
  name: string
  note: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  event_id: string
  action: string
  table_name: string
  record_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: string
} 