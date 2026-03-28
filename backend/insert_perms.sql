DO $$ 
DECLARE 
    r_id TEXT; 
    s_id TEXT; 
    f_id TEXT;
    c_id TEXT;
    p1 TEXT; 
    p2 TEXT; 
BEGIN 
    INSERT INTO permissions (id, key, description, "updatedAt") VALUES (gen_random_uuid()::text, 'payment.read', 'Read payments', CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET key=EXCLUDED.key RETURNING id INTO p1;
    INSERT INTO permissions (id, key, description, "updatedAt") VALUES (gen_random_uuid()::text, 'payment.refund', 'Refund payments', CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET key=EXCLUDED.key RETURNING id INTO p2;

    SELECT id INTO r_id FROM roles WHERE name = 'Admin';
    IF r_id IS NOT NULL THEN
        INSERT INTO role_permissions ("roleId", "permissionId", "assignedBy") VALUES (r_id, p1, 'SEED') ON CONFLICT DO NOTHING;
        INSERT INTO role_permissions ("roleId", "permissionId", "assignedBy") VALUES (r_id, p2, 'SEED') ON CONFLICT DO NOTHING;
    END IF;
    
    SELECT id INTO s_id FROM roles WHERE name = 'Support';
    IF s_id IS NOT NULL THEN
        INSERT INTO role_permissions ("roleId", "permissionId", "assignedBy") VALUES (s_id, p1, 'SEED') ON CONFLICT DO NOTHING;
    END IF;

    SELECT id INTO f_id FROM roles WHERE name = 'Finance';
    IF f_id IS NOT NULL THEN
        INSERT INTO role_permissions ("roleId", "permissionId", "assignedBy") VALUES (f_id, p1, 'SEED') ON CONFLICT DO NOTHING;
        INSERT INTO role_permissions ("roleId", "permissionId", "assignedBy") VALUES (f_id, p2, 'SEED') ON CONFLICT DO NOTHING;
    END IF;

    SELECT id INTO c_id FROM roles WHERE name = 'CEO';
    IF c_id IS NOT NULL THEN
        INSERT INTO role_permissions ("roleId", "permissionId", "assignedBy") VALUES (c_id, p1, 'SEED') ON CONFLICT DO NOTHING;
    END IF;

END $$;
