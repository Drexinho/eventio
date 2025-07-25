-- PostgreSQL Schema pro EventPlanner
-- Spustit jako: psql -U eventplanner -d eventplanner -f postgresql-schema.sql

-- Vytvoření tabulek

-- Tabulka událostí
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_participants INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    access_type VARCHAR(10) DEFAULT 'link',
    access_token VARCHAR(255) UNIQUE NOT NULL,
    map_link TEXT,
    booking_link TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabulka účastníků
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    staying_full_time BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabulka dopravy
CREATE TABLE IF NOT EXISTS transport (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    departure_location VARCHAR(255),
    departure_time VARCHAR(20),
    arrival_location VARCHAR(255),
    intermediate_stops JSONB DEFAULT '[]',
    capacity INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabulka přiřazení účastníků k dopravě
CREATE TABLE IF NOT EXISTS transport_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_id UUID NOT NULL REFERENCES transport(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(transport_id, participant_id)
);

-- Tabulka inventáře
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    assigned_to UUID REFERENCES participants(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabulka audit logů
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexy pro lepší výkon
CREATE INDEX IF NOT EXISTS idx_events_access_token ON events(access_token);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_transport_event_id ON transport(event_id);
CREATE INDEX IF NOT EXISTS idx_transport_assignments_transport_id ON transport_assignments(transport_id);
CREATE INDEX IF NOT EXISTS idx_transport_assignments_participant_id ON transport_assignments(participant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_event_id ON inventory_items(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_id ON audit_logs(event_id);

-- Funkce pro automatické aktualizování updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery pro automatické aktualizování updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_updated_at BEFORE UPDATE ON transport
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funkce pro audit log
CREATE OR REPLACE FUNCTION log_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (event_id, action, table_name, record_id, new_values)
        VALUES (NEW.event_id, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (event_id, action, table_name, record_id, old_values, new_values)
        VALUES (NEW.event_id, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (event_id, action, table_name, record_id, old_values)
        VALUES (OLD.event_id, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Speciální funkce pro audit log transport_assignments
CREATE OR REPLACE FUNCTION log_transport_assignment_change()
RETURNS TRIGGER AS $$
DECLARE
    event_id_val UUID;
BEGIN
    -- Získání event_id z transport tabulky
    IF TG_OP = 'INSERT' THEN
        SELECT t.event_id INTO event_id_val FROM transport t WHERE t.id = NEW.transport_id;
        INSERT INTO audit_logs (event_id, action, table_name, record_id, new_values)
        VALUES (event_id_val, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        SELECT t.event_id INTO event_id_val FROM transport t WHERE t.id = NEW.transport_id;
        INSERT INTO audit_logs (event_id, action, table_name, record_id, old_values, new_values)
        VALUES (event_id_val, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        SELECT t.event_id INTO event_id_val FROM transport t WHERE t.id = OLD.transport_id;
        INSERT INTO audit_logs (event_id, action, table_name, record_id, old_values)
        VALUES (event_id_val, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggery pro audit log
CREATE TRIGGER audit_participants AFTER INSERT OR UPDATE OR DELETE ON participants
    FOR EACH ROW EXECUTE FUNCTION log_change();

CREATE TRIGGER audit_transport AFTER INSERT OR UPDATE OR DELETE ON transport
    FOR EACH ROW EXECUTE FUNCTION log_change();

CREATE TRIGGER audit_transport_assignments AFTER INSERT OR UPDATE OR DELETE ON transport_assignments
    FOR EACH ROW EXECUTE FUNCTION log_transport_assignment_change();

CREATE TRIGGER audit_inventory_items AFTER INSERT OR UPDATE OR DELETE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION log_change();

-- Zobrazení pro lepší dotazování
CREATE OR REPLACE VIEW event_summary AS
SELECT 
    e.id,
    e.name,
    e.start_date,
    e.end_date,
    e.access_token,
    e.access_type,
    COUNT(p.id) as participant_count,
    COUNT(t.id) as transport_count,
    COUNT(i.id) as inventory_count
FROM events e
LEFT JOIN participants p ON e.id = p.event_id
LEFT JOIN transport t ON e.id = t.event_id
LEFT JOIN inventory_items i ON e.id = i.event_id
GROUP BY e.id, e.name, e.start_date, e.end_date, e.access_token, e.access_type;

-- Testovací data (volitelné)
-- INSERT INTO events (name, description, start_date, end_date, max_participants, price, access_token, access_type)
-- VALUES ('Testovací událost', 'Test pro ověření databáze', '2025-01-15', '2025-01-16', 10, 1000, 'test-123', 'link');

COMMIT; 