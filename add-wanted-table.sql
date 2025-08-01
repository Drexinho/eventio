-- Přidání tabulky pro WANTED položky
CREATE TABLE IF NOT EXISTS wanted_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pro lepší výkon
CREATE INDEX IF NOT EXISTS idx_wanted_items_event_id ON wanted_items(event_id);

-- Trigger pro automatické aktualizování updated_at
CREATE TRIGGER update_wanted_items_updated_at BEFORE UPDATE ON wanted_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pro audit log
CREATE TRIGGER audit_wanted_items AFTER INSERT OR UPDATE OR DELETE ON wanted_items
    FOR EACH ROW EXECUTE FUNCTION log_change(); 