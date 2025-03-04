-- Display all tables in the current database
SELECT table_schema,
    table_name
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    AND table_type = 'BASE TABLE'
ORDER BY table_schema,
    table_name;
-- Alternatively, for a simpler view, you can use:
-- \dt  -- This works in psql CLI but not in SQLTools