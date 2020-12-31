USE employees_db;
INSERT INTO department (name)
VALUES ('Sales'),
    ('Production'),
    ('Fulfillment'),
    ('Marketing'),
    ('Site Ops');
INSERT INTO role (title, salary, department_id)
VALUES ('Customer Service Rep', 50000, 1),
    ('Customer Service Manager', 70000, 1),
    ('Production Technician I', 30000, 2),
    ('Production Technician II', 40000, 2),
    ('Production Manager', 70000, 2),
    ('Fulfillment Technician I', 30000, 3),
    ('Fulfillment Technician II', 40000, 3),
    ('Fulfillment Manager', 70000, 3),
    ('Creative Design Specialist', 50000, 4),
    ('Marketing Manager', 70000, 4),
    ('Process Support Specialist', 50000, 5),
    ('Head of Systems Technology', 70000, 5);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Katie', 'Skow', 2, NULL),
    ('Kim', 'Derr', 1, 1),
    ('Pablo', 'Gomez', 1, 1),
    ('JoAnne', 'Carilli-Stevenson', 10, NULL),
    ('Todd', 'Charles', 9, 4),
    ('James', 'Eggleston', 9, 4),
    ('Dominic', 'Montoya', 5, NULL),
    ('Jorge', 'Curel', 4, 7),
    ('Bernabe', 'Cediillo', 3, 7),
    ('Filipe', 'Vargas Lopez', 3, 7);
SELECT *
FROM department;
SELECT *
FROM role;
SELECT *
FROM employee;