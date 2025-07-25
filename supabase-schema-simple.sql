-- Enable Row Level Security
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  map_link TEXT,
  booking_link TEXT,
  people_count INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  access_type TEXT NOT NULL CHECK (access_type IN ('url', 'pin')),
  access_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transport table
CREATE TABLE IF NOT EXISTS transport (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transport_assignments table
CREATE TABLE IF NOT EXISTS transport_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transport_id UUID NOT NULL REFERENCES transport(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(transport_id, participant_id)
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_access_token ON events(access_token);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_transport_event_id ON transport(event_id);
CREATE INDEX IF NOT EXISTS idx_transport_assignments_transport_id ON transport_assignments(transport_id);
CREATE INDEX IF NOT EXISTS idx_transport_assignments_participant_id ON transport_assignments(participant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_event_id ON inventory_items(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_id ON audit_logs(event_id);

-- Row Level Security Policies - Zjednodušené verze

-- Events: Allow all operations (vytvoření událostí a přístup přes token)
CREATE POLICY "Allow all events" ON events
  FOR ALL USING (true);

-- Participants: Allow all operations pro všechny události
CREATE POLICY "Allow all participants" ON participants
  FOR ALL USING (true);

-- Transport: Allow all operations pro všechny události
CREATE POLICY "Allow all transport" ON transport
  FOR ALL USING (true);

-- Transport assignments: Allow all operations
CREATE POLICY "Allow all transport_assignments" ON transport_assignments
  FOR ALL USING (true);

-- Inventory items: Allow all operations
CREATE POLICY "Allow all inventory_items" ON inventory_items
  FOR ALL USING (true);

-- Audit logs: Allow all operations
CREATE POLICY "Allow all audit_logs" ON audit_logs
  FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for events table
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 