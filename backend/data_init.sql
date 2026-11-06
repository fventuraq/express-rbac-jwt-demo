-- Necesario para crypt()/gen_salt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Roles
INSERT INTO roles (rolnom) VALUES
  ('Admin'), -- Este agrupa SISTEMA y DADOS (capas un mejor nombre em portugues o ingles)
  ('Administrador'); -- Solo agrupa DADOS

-- 2) Funciones (permisos atómicos)
INSERT INTO funciones (funnom) VALUES
  ('SISTEMA'), -- Aca se agrupan Views, Funciones y Roles
  ('DADOS'); -- Aca se agrupan Persons y Users

-- 3) Views (Telas do frontend)
INSERT INTO views (vienom, vieurl, viectr, vieico, vieest, vieestvis) VALUES
  ('Views', '/views', 'ViewsPage', 'ViewsIco', 'A', TRUE),
  ('Funciones', '/functions', 'FuncionesPage', 'FuncionesIco', 'A', TRUE),
  ('Roles', '/roles', 'RolesPage', 'RolesIco', 'A', TRUE),
  ('Persons', '/users', 'PersonsPage', 'PersonsIco',  'A', TRUE),
  ('Users', '/users', 'UsersPage', 'UsersIco',  'A', TRUE);


INSERT INTO view_funcion (vieid, funid)
SELECT v.vieid, f.funid
FROM views v
JOIN funciones f ON
     (v.vienom IN ('Views', 'Funciones', 'Roles') AND f.funnom = 'SISTEMA')
  OR (v.vienom IN ('Persons', 'Users')           AND f.funnom = 'DADOS');

-- Admin: todos os grupos
INSERT INTO fun_rol (rolid, funid)
SELECT r.rolid, f.funid
FROM roles r CROSS JOIN funciones f
WHERE r.rolnom = 'Admin';

-- Administrador: apenas DADOS
INSERT INTO fun_rol (rolid, funid)
SELECT r.rolid, f.funid
FROM roles r
JOIN funciones f ON f.funnom = 'DADOS'
WHERE r.rolnom = 'Administrador';

INSERT INTO persons (pernam, persur, percpf, perpho, perema) VALUES
  ('Ana',   'López', '12345678901', '+595981000001', 'ana@example.com'),
  ('Bruno', 'Díaz',  '12345678902', '+595981000002', 'bruno@example.com');

INSERT INTO users (rolid, perid, usunam, usupas)
SELECT r.rolid, p.perid, 'admin', crypt('Admin123*', gen_salt('bf', 10))
FROM roles r, persons p
WHERE r.rolnom = 'Admin' AND p.percpf = '12345678901';

INSERT INTO users (rolid, perid, usunam, usupas)
SELECT r.rolid, p.perid, 'adm', crypt('Adm123*', gen_salt('bf', 10))
FROM roles r, persons p
WHERE r.rolnom = 'Administrador' AND p.percpf = '12345678902';
