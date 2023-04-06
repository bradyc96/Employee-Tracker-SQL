USE employee_tracker_db;

INSERT INTO department(name)
    VALUES  ("Engineering"),
            ("Finance"),
            ("Sales"),
            ("HR"),
            ("Legal");

INSERT INTO role (title, salary, department_id)
    VALUES  ("Sales Engineer", 145000, 3),
            ("BDR", 60000, 3),
            ("Lead Engineer", 185000, 1),
            ("Account Manager", 75000, 2),
            ("Accountant", 140000, 2),
            ("Legal Team Lead", 285000, 5),
            ("Lawyer", 210000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES  ("Brady", "Collier", 1, NULL),
            ("Hank", "Mardukas", 6, 1),
            ("Belinda", "Rosario", 4, 1),
            ("John", "Cena", 3, NULL),
            ("Amy", "Adams", 4, NULL),
            ("Maria", "Zardoya", 5, 5);
