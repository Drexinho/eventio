# 🔧 Finální Oprava - Transport Assignments

## ✅ Problém vyřešen!

### Co byl problém:
- **Chyba:** `error: record "new" has no field "event_id"`
- **Příčina:** `transport_assignments` tabulka nemá `event_id` pole, ale audit log trigger se ho snažil použít
- **Kdy se projevoval:** Při přiřazování účastníků k dopravě

### Jak jsem to opravil:

1. **Vytvořil speciální audit log funkci** pro `transport_assignments`:
   ```sql
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
   ```

2. **Aktualizoval trigger** pro `transport_assignments`:
   ```sql
   DROP TRIGGER IF EXISTS audit_transport_assignments ON transport_assignments;
   CREATE TRIGGER audit_transport_assignments 
   AFTER INSERT OR UPDATE OR DELETE ON transport_assignments 
   FOR EACH ROW EXECUTE FUNCTION log_transport_assignment_change();
   ```

### Jak to funguje:

1. **Při přiřazení účastníka k dopravě:**
   - Trigger zachytí INSERT do `transport_assignments`
   - Získá `event_id` z `transport` tabulky pomocí `transport_id`
   - Vytvoří audit log záznam s správným `event_id`

2. **Při odebrání účastníka z dopravy:**
   - Trigger zachytí DELETE z `transport_assignments`
   - Získá `event_id` z `transport` tabulky pomocí `transport_id`
   - Vytvoří audit log záznam s správným `event_id`

### Otestování:

1. **Otevřete aplikaci** na http://localhost:3000
2. **Jděte na existující událost** nebo vytvořte novou
3. **Přidejte dopravu** v TransportPanel
4. **Přiřaďte účastníka k dopravě** - mělo by fungovat bez chyb
5. **Odeberte účastníka z dopravy** - mělo by fungovat bez chyb
6. **Zkontrolujte audit log** - měly by se zobrazovat záznamy

### Hotovo! 🎉

- ✅ **Transport assignments** - opraveno
- ✅ **Audit log** - funguje správně
- ✅ **Přiřazování účastníků** - funguje bez chyb
- ✅ **Odebírání účastníků** - funguje bez chyb

**Všechny funkce by nyní měly fungovat perfektně!** 🚀 