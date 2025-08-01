-- Kompletní setup pro Eventio databázi
-- Spustit jako: sudo -u postgres psql -f complete_eventio_setup.sql

-- Vytvoření uživatele a databáze
CREATE USER eventplanner WITH PASSWORD 'eventplanner123';
CREATE DATABASE eventplanner OWNER eventplanner;
GRANT ALL PRIVILEGES ON DATABASE eventplanner TO eventplanner;

-- Přepnutí na databázi eventplanner
\c eventplanner;

-- Nastavení vlastnictví pro eventplanner
GRANT ALL ON SCHEMA public TO eventplanner;
GRANT ALL ON ALL TABLES IN SCHEMA public TO eventplanner;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO eventplanner;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO eventplanner;

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
    pin VARCHAR(10),
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    pin_code VARCHAR(10),
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

-- Tabulka wanted items
CREATE TABLE IF NOT EXISTS wanted_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabulka token pin mapping
CREATE TABLE IF NOT EXISTS token_pin_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_token VARCHAR(255) NOT NULL,
    pin VARCHAR(255) NOT NULL,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_wanted_items_event_id ON wanted_items(event_id);
CREATE INDEX IF NOT EXISTS idx_token_pin_mapping_public_token ON token_pin_mapping(public_token);

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

CREATE TRIGGER update_wanted_items_updated_at BEFORE UPDATE ON wanted_items
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

CREATE TRIGGER audit_wanted_items AFTER INSERT OR UPDATE OR DELETE ON wanted_items
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

-- Import dat z původního exportu
-- Data pro events
INSERT INTO events (id, name, description, start_date, end_date, max_participants, price, access_token, access_type, map_link, booking_link, created_at, updated_at, image_url, pin, payment_status, pin_code) VALUES
('ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Demo událost - jedeme na hory', 'PIN PRO EDIT: 1111. Je to sandbox\nToto je testovací text pro událost na zimní pobyt na chatě. Připravujeme příjemný víkend plný sněhových radovánek, odpočinku a skvělé společnosti. Čekají vás aktivity jako lyžování, sáňkování, stavění sněhuláků či zimní turistika v krásném prostředí hor. Chata je vybavena krbem, který zajistí útulnou atmosféru po celý den. Večer se můžete těšit na společenské hry, posezení u teplého čaje nebo kakaa a relaxaci ve wellness zóně. Zajistíme rovněž chutnou domácí kuchyni. Tento text slouží výhradně pro testovací účely a nemá žádnou informační hodnotu o skutečné akci. Děkujeme za pochopení.', '2025-12-24', '2025-12-31', 8, 9586.00, 'THwjrZbQiPZrAXwfkaah', 'pin', 'https://maps.app.goo.gl/jJL6LqC4ceoNgedg6', 'https://www.booking.com/index.cs.html', '2025-08-01 15:13:29.925788+02', '2025-08-01 16:07:15.559444+02', 'https://domalenka.cz/uploads/userimages/19808/139091_chatawinterspamartinskehole-martin-martin-1.jpg', NULL, 'paid', '1111'),
('dff612aa-f30c-4a1e-9110-01128161bbb4', 'Chata Polsko', 'Staň se členem oficiálního fanclubu Seattl podtácků CSSH pod pivko Přívěsek Seahawks z 3D tiskárny Flash disk CSSH (pouze pro členy kvalifikované do "The Game") Los do letošní charitativní tomboly (lze přispět a dokoupit další) Celkem 3 ks našich nálepek…Staň se členem oficiálního fanclubu Seattl podtácků CSSH pod pivko Přívěsek Seahawks z 3D tiskárny Flash disk CSSH (pouze pro členy kvalifikované do "The Game") Los do letošní charitativní tomboly (lze přispět a dokoupit další) Celkem 3 ks našich nálepek…Staň se členem oficiálního fanclubu Seattl podtácků CSSH pod pivko Přívěsek Seahawks z 3D tiskárny Flash disk CSSH (pouze pro členy kvalifikované do "The Game") Los do letošní charitativní tomboly (lze přispět a dokoupit další) Celkem 3 ks našich nálepek…Staň se členem oficiálního fanclubu Seattl podtácků CSSH pod pivko Přívěsek Seahawks z 3D tiskárny Flash disk CSSH (pouze pro členy kvalifikované do "The Game") Los do letošní charitativní tomboly (lze přispět a dokoupit další) Celkem 3 ks našich nálepek…Staň se členem oficiálního fanclubu Seattl podtácků CSSH pod pivko Přívěsek Seahawks z 3D tiskárny Flash disk CSSH (pouze pro členy kvalifikované do "The Game") Los do letošní charitativní tomboly (lze přispět a dokoupit další) Celkem 3 ks našich nálepek…Staň se členem oficiálního fanclubu Seattl podtácků CSSH pod pivko Přívěsek Seahawks z 3D tiskárny Flash disk CSSH (pouze pro členy kvalifikované do "The Game") Los do letošní charitativní tomboly (lze přispět a dokoupit další) Celkem 3 ks našich nálepek…Staň se členem oficiálního fanclubu Seattl podtácků CSSH pod pivko Přívěsek Seahawks z 3D tiskárny Flash disk CSSH (pouze pro členy kvalifikované do "The Game") Los do letošní charitativní tomboly (lze přispět a dokoupit další) Celkem 3 ks našich nálepek…', '2025-11-14', '2025-11-17', 16, 39847.00, 'Kj8mN2pQ9xR5vL7wY3hF', 'pin', 'https://maps.app.goo.gl/PwZQL1Eho6GH2j7A7', 'https://www.airbnb.co.uk/rooms/867299341690145283?check_in=2025-11-14&check_out=2025-11-17&guests=1&adults=14&s=67&unique_share_id=b75d74b5-bf81-47db-9602-6fd0af7a0b22', '2025-07-24 22:56:34.489201+02', '2025-08-01 14:31:41.979178+02', 'https://a0.muscache.com/im/pictures/miso/Hosting-867299341690145283/original/1212bc2b-22b0-4644-be9a-69ea0955ef72.jpeg?im_w=1200', '778592586', 'paid', '1922');

-- Data pro participants
INSERT INTO participants (id, event_id, name, phone, notes, created_at, updated_at, staying_full_time) VALUES
('035e4e8d-4028-4842-9203-e672c2d27e28', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Dava Drek', NULL, NULL, '2025-08-01 14:24:04.375669+02', '2025-08-01 14:24:04.375669+02', true),
('c8b252e3-7713-4da5-a828-5c7911e87f25', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Lída', NULL, NULL, '2025-08-01 14:24:09.379024+02', '2025-08-01 14:24:09.379024+02', true),
('c4f7a252-929c-4de3-9e67-592d9769b98b', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Schorňa', NULL, NULL, '2025-08-01 14:24:15.704743+02', '2025-08-01 14:24:15.704743+02', true),
('eec1125b-ce89-4045-b5d4-717fca88e6cb', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Verča', NULL, NULL, '2025-08-01 14:24:23.005459+02', '2025-08-01 14:24:23.005459+02', true),
('7efc2913-b9f5-47e1-8a4b-37bcfe14c142', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Veči', NULL, NULL, '2025-08-01 14:24:27.684775+02', '2025-08-01 14:24:27.684775+02', true),
('57ffc7d7-0ba6-45e9-aa30-efd881b825cf', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Saška', NULL, NULL, '2025-08-01 14:24:32.924854+02', '2025-08-01 14:24:32.924854+02', true),
('4e165ab0-322e-4958-a932-5818db883301', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Aďá', NULL, NULL, '2025-08-01 14:24:46.131625+02', '2025-08-01 14:24:46.131625+02', true),
('be6cad56-e358-4481-ab9c-8b260907c94c', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Radim', NULL, NULL, '2025-08-01 14:24:50.497184+02', '2025-08-01 14:24:50.497184+02', true),
('75d80fd9-6d28-4b9b-9d6d-bf651110b3eb', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Šimis', NULL, NULL, '2025-08-01 14:25:07.87415+02', '2025-08-01 14:25:07.87415+02', true),
('caea1269-9905-44b4-8801-fe5373c41e26', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Ihor', NULL, NULL, '2025-08-01 14:25:12.256622+02', '2025-08-01 14:25:12.256622+02', true),
('43f22c58-5b26-4f9f-a790-ece10a2e7684', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Staňa', NULL, NULL, '2025-08-01 14:25:17.858106+02', '2025-08-01 14:25:17.858106+02', true),
('77f5b547-68f2-4026-9e5c-74fa0a207c71', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Simona', NULL, NULL, '2025-08-01 14:25:22.405227+02', '2025-08-01 14:25:22.405227+02', true),
('6041ff2e-2f0d-430c-b7ee-aa4f4477ca42', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Aleš', NULL, NULL, '2025-08-01 15:14:04.123286+02', '2025-08-01 15:14:04.123286+02', true),
('b5ed8fb6-ba1d-4ac8-a509-c1ee2d80858f', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Karel', NULL, '27. a 28. budu pracovat', '2025-08-01 15:14:30.536981+02', '2025-08-01 15:14:30.536981+02', true),
('eadd248b-4165-4a0c-b2ee-d0a5a507f0f7', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Lenka', NULL, 'přijedu 26.', '2025-08-01 15:14:44.760811+02', '2025-08-01 15:14:44.760811+02', false),
('57a7b917-df1b-4f25-ae18-6d62ef08640d', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Martina', NULL, NULL, '2025-08-01 15:14:51.305277+02', '2025-08-01 15:14:51.305277+02', true),
('bed7b897-6032-4469-a314-929aefc4a819', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Lojza', NULL, NULL, '2025-08-01 15:14:57.484964+02', '2025-08-01 15:14:57.484964+02', true),
('cb2a9171-9aed-42c5-94ef-bd0db0b5258d', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Matěj', NULL, NULL, '2025-08-01 15:15:02.293482+02', '2025-08-01 15:15:02.293482+02', true),
('3bb8cb2c-59ce-49dc-bc77-21afefde6026', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Denisa', NULL, NULL, '2025-08-01 15:15:06.866691+02', '2025-08-01 15:15:06.866691+02', true);

-- Data pro transport
INSERT INTO transport (id, event_id, type, departure_location, departure_time, arrival_location, capacity, price, notes, created_at, updated_at, intermediate_stops) VALUES
('a398955b-a419-4ed1-9211-73820a8afce5', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Dodávka Drek', 'Brno', '12:00', 'Chata', 9, 2000.00, NULL, '2025-07-24 23:03:57.817337+02', '2025-07-25 10:25:18.938418+02', '[{"time": "12:45", "notes": "Večerci", "location": "Kroměříž"}, {"time": "13:10", "notes": "Polďové", "location": "Chropyně"}]'),
('9e90bc5e-d774-4595-8dc1-03b2e1532a9c', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Auto Tesaříci', 'Olomouc', '14:00', 'Chata', 4, 800.00, 'Cena pro dalšího 200', '2025-07-25 08:06:24.138441+02', '2025-07-25 10:27:31.033816+02', '[]'),
('099d749b-c3a7-4067-a498-be77bbb02385', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Auto Lojza', 'Brno', '09:20', 'Chata Harrachov', 3, 800.00, 'Beru psa, proto tři místa', '2025-08-01 15:16:27.450881+02', '2025-08-01 15:16:27.450881+02', '[{"time": "11:25", "notes": "Westfield Chodov", "location": "Praha"}]'),
('1708080d-da93-46fc-b170-97b890378332', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Minibus Denisa', 'Kroměříž', '08:00', 'Chata Harrachov', 6, 1500.00, 'Spousta místa', '2025-08-01 15:17:16.245421+02', '2025-08-01 15:17:16.245421+02', '[]');

-- Data pro transport_assignments
INSERT INTO transport_assignments (id, transport_id, participant_id, created_at) VALUES
('9efec148-145f-49c0-9338-f5d22f06a902', '1708080d-da93-46fc-b170-97b890378332', '3bb8cb2c-59ce-49dc-bc77-21afefde6026', '2025-08-01 15:18:02.884783+02'),
('d23f1df4-eccc-4607-bb49-4cc8b2dd07e0', '1708080d-da93-46fc-b170-97b890378332', 'cb2a9171-9aed-42c5-94ef-bd0db0b5258d', '2025-08-01 15:18:02.905655+02'),
('ceb2d811-6e7a-4d59-b0e5-43984f95da3a', '1708080d-da93-46fc-b170-97b890378332', 'bed7b897-6032-4469-a314-929aefc4a819', '2025-08-01 15:18:03.668635+02'),
('7988b36a-4708-49ed-97ff-458dfeee821c', '099d749b-c3a7-4067-a498-be77bbb02385', 'eadd248b-4165-4a0c-b2ee-d0a5a507f0f7', '2025-08-01 15:18:15.673847+02'),
('cd79c36a-f202-4018-937b-1d16202c8baf', '099d749b-c3a7-4067-a498-be77bbb02385', '57a7b917-df1b-4f25-ae18-6d62ef08640d', '2025-08-01 15:18:16.422779+02'),
('4e7789ee-0111-4f82-8581-ae819b2e3de8', '099d749b-c3a7-4067-a498-be77bbb02385', 'b5ed8fb6-ba1d-4ac8-a509-c1ee2d80858f', '2025-08-01 15:18:17.703621+02');

-- Data pro inventory_items
INSERT INTO inventory_items (id, event_id, name, description, quantity, assigned_to, notes, created_at, updated_at) VALUES
('82fc2f47-fe34-4cc1-a0ea-d49949a0f972', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'mikrofon', NULL, 1, 'be6cad56-e358-4481-ab9c-8b260907c94c', 'Přesunuto z WANTED - postava jak mikrofon', '2025-08-01 12:33:57.450857+02', '2025-08-01 14:56:05.639904+02'),
('6bde3f06-c57e-4fa3-b971-f522793809a4', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'pivko', '50L radegast 10', 5, '4e165ab0-322e-4958-a932-5818db883301', NULL, '2025-07-25 10:12:22.967579+02', '2025-08-01 14:56:17.931237+02'),
('518f1958-0fcb-4523-aa60-0c2d2b7ecb26', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Pípa', NULL, 1, '6041ff2e-2f0d-430c-b7ee-aa4f4477ca42', 'náražeč bajonet', '2025-08-01 15:18:38.802184+02', '2025-08-01 15:18:38.802184+02'),
('0e1d602e-ba42-428f-a797-e12607965a23', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'nafukovací matrace', NULL, 2, 'b5ed8fb6-ba1d-4ac8-a509-c1ee2d80858f', 'matrace 180cm x 90cm', '2025-08-01 15:19:14.449689+02', '2025-08-01 15:19:14.449689+02'),
('fa7fc88f-64bb-47a3-8fbe-3ebcd465f45b', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Kytara', NULL, 1, 'b5ed8fb6-ba1d-4ac8-a509-c1ee2d80858f', 'Přesunuto z WANTED - Umím hrát - beru', '2025-08-01 15:32:48.210576+02', '2025-08-01 15:32:48.210576+02');

-- Data pro wanted_items
INSERT INTO wanted_items (id, event_id, name, note, created_at, updated_at) VALUES
('bb01539e-e67b-4278-8bb9-d49d2bceb521', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Projektor', 'Harry Potter maraton?', '2025-08-01 15:33:06.359121+02', '2025-08-01 15:33:24.936807+02'),
('22fe026e-5355-408c-a346-566e2156b5c1', 'ba3b46bf-0e6e-45ae-a8c1-d2a1289af355', 'Deskovky', 'Ideálně Activity nebo Krycí jména', '2025-08-01 15:34:04.143654+02', '2025-08-01 15:34:04.143654+02'),
('087aee9c-424c-4441-bafd-6bc1237b49fc', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Nafukovací matrace jako manželská postel navíc?', 'Pro hosty kdo by přijel na noc, nebo pro lidi navíc přes kapacitu', '2025-08-01 16:16:33.411036+02', '2025-08-01 16:16:33.411036+02'),
('38ec4adc-5fde-4a08-be7f-8644b80a7f7a', 'dff612aa-f30c-4a1e-9110-01128161bbb4', 'Beerpong', NULL, '2025-08-01 16:17:03.08015+02', '2025-08-01 16:17:03.08015+02');

-- Data pro token_pin_mapping
INSERT INTO token_pin_mapping (id, public_token, pin, event_id, created_at) VALUES
('eae2a203-e1fb-4405-9166-3c2d6b425837', '778592586', '778592586', 'dff612aa-f30c-4a1e-9110-01128161bbb4', '2025-07-30 17:05:04.053773+02');

-- Nastavení sekvencí pro ID
SELECT setval('events_id_seq', (SELECT MAX(id::text::bigint) FROM events));
SELECT setval('participants_id_seq', (SELECT MAX(id::text::bigint) FROM participants));
SELECT setval('transport_id_seq', (SELECT MAX(id::text::bigint) FROM transport));
SELECT setval('transport_assignments_id_seq', (SELECT MAX(id::text::bigint) FROM transport_assignments));
SELECT setval('inventory_items_id_seq', (SELECT MAX(id::text::bigint) FROM inventory_items));
SELECT setval('audit_logs_id_seq', (SELECT MAX(id::text::bigint) FROM audit_logs));
SELECT setval('wanted_items_id_seq', (SELECT MAX(id::text::bigint) FROM wanted_items));
SELECT setval('token_pin_mapping_id_seq', (SELECT MAX(id::text::bigint) FROM token_pin_mapping));

-- Finalizace
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eventplanner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO eventplanner;

COMMIT; 