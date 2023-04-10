//dependencies
const inquirer = require('inquirer');
const mysql = require('mysql2');
require('console.table');


//connect to mysql
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employee_tracker_db'
});


//user prompt function
function prompts() {
  //inquirer prompt for user choice selection
  inquirer
    .prompt(
      [{
        type: 'list',
        message: 'Make a selection',
        choices: ['View departments', 'View employees', 'View roles', 'Add a department', 'Add an employee', 'Add a role', 'Update employee role', 'Log out'],
        name: 'choice',
      }]
    )
    .then(function (response) {1

      let {choice} = response;

      //User input choice
      if (choice === 'View departments') {
        viewDepartments();
      } else if (choice === 'View employees') {
        viewEmployees();
      } else if (choice === 'View roles') {
        viewRoles();
      } else if (choice === 'Add a department') {
        addDepartment();
      } else if (choice === 'Add an employee') {
        addEmployee();
      } else if (choice === 'Add a role') {
        addRole();
      } else if (choice === 'Update employee role') {
        changeRole();
      } else if (choice === 'Log out') {
        logOut();
      };
    });
}

//view departments function
function viewDepartments() {
  db.query("SELECT id AS ID, name AS Department FROM department ORDER BY id", (err, res) => {
    if (err) {
      console.log('Error loading department');
      prompts();
    } else {
      console.table(res, '------------------------');
      prompts();
    };
  });
};

//view employees function
function viewEmployees() {

  db.query(`
  SELECT employee.id AS ID, employee.first_name AS First_Name, employee.last_name AS Last_Name, title AS Role, salary AS Salary, department.name AS Department, manager.first_name AS Manager_First, manager.last_name AS Manager_Last
  FROM employee
  JOIN role ON employee.role_id = role.id
  JOIN department ON role.department_id = department.id
  LEFT JOIN employee AS manager ON employee.manager_id = manager.id
  ORDER BY employee.id`, (err, res) => {
    if (err) {
      console.log('Error loading employees');
      prompts();
    } else {
      console.table(res, '----------------------------');
      prompts();
    };
  });
};


//view roles function
function viewRoles() {
  db.query(`
  SELECT role.id AS ID, title AS Role, salary AS Salary, department.name AS Department
  FROM role JOIN department ON role.department_id = department.id
  ORDER BY role.id`, (err, res) => {
    if (err) {
      console.log('Error loading roles');
      prompts();
    } else {
      console.table(res, '-----------------------');
      prompts();
    };
  });
};

//add department function
function addDepartment() {
  //inquirer prompt input for departments
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Enter new department:',
        name: 'department',
      }
    ])
    .then(function (response) {

      let {department} = response;

      //add department into database
      db.query(`INSERT INTO department (name) VALUES (?)`, department, (err, res) => {
        if (err) {
          console.log('Error creating department');
          prompts();
        } else {
          console.log('----------------------------------');
          console.log(`${department} has been added`);
          console.log('----------------------------------');
          prompts();
        };
      });
    });
};

//add employee function
function addEmployee() {
  db.query(`SELECT * FROM role`, (err, res) => {
    if (err) {
      console.log('Error loading information');
      prompts();
    } else {

      const roleSelection = [];
      const roleIdNums = [];

      for (let i = 0; i < res.length; i++) {
        roleSelection.push(res[i].title);
        roleIdNums.push(res[i].id);
      }
      db.query(`SELECT * FROM employee`, (err, res) => {
        if (err) {
          console.log('Error loading information');
          prompts();
        } else {

          const managerSelection = [];
          const managerIdNums = [];

          for (let i = 0; i < res.length; i++) {
            managerSelection.push(`${res[i].first_name} ${res[i].last_name}`);
            managerIdNums.push(res[i].id);
          }
          managerSelection.push('This employee does not have a manager')

          //inquirer prompt for information
          inquirer
            .prompt([
              {
                type: 'input',
                message: `Enter first name of employee:`,
                name: 'firstName',
              },
              {
                type: 'input',
                message: `Enter last name of employee:`,
                name: 'lastName',
              },
              {
                type: 'list',
                message: `Enter employee role:`,
                choices: roleSelection,
                name: 'role',
              },
              {
                type: 'list',
                message: `Enter employee manager:`,
                choices: managerSelection,
                name: 'manager',
              }
            ])
            .then(function (response) {

              let { firstName, lastName, role, manager } = response;
              let roleId;
              let managerId;

              for (let i = 0; i < roleSelection.length; i++) {
                if (role === roleSelection[i]) {
                  roleId = roleIdNums[i];
                };
              }
              for (let i = 0; i < managerSelection.length; i++) {
                if (manager === 'This employee does not have a manager') {
                  managerId = null;
                } else if (manager === managerSelection[i]) {
                  managerId = managerIdNums[i];
                };
              }

              //add new employees into the database
              db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, 
              [firstName, lastName, roleId, managerId], 
              (err, res) => {
                if (err) {
                  console.log('Error adding employees');
                  prompts();
                } else {
                  console.log('----------------------------------');
                  console.log(`${firstName} ${lastName} has been added`);
                  console.log('----------------------------------');
                  prompts();
                };
              });
            });
        };
      });
    };
  });
};

//add role function
function addRole() {
  db.query("SELECT * FROM department", (err, res) => {
    if (err) {
      console.log('There was an error loading departments');
      prompts();
    } else {

      const departmentsSelection = [];
      const departmentIdArray = [];

      for (let i = 0; i < res.length; i++) {
        departmentsSelection.push(res[i].name);
        departmentIdArray.push(res[i].id);
      }

      //inquirer prompt for role information
      inquirer
        .prompt([
          {
            type: 'input',
            message: 'Enter title of the new role:',
            name: 'role',
          },
          {
            type: 'input',
            message: 'Enter salary of the new role:',
            name: 'salary',
          },
          {
            type: 'list',
            message: 'Enter department that the role belong to:',
            choices: departmentsSelection,
            name: 'department',
          }
        ])
        .then(function (response) {

          let {role, salary, department} = response;
          let departmentId;

          for (let i = 0; i < departmentsSelection.length; i++) {
            if (department === departmentsSelection[i]) {
              departmentId = departmentIdArray[i];
            };
          };

          //add role into the database
          db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, 
          [role, salary, departmentId], 
          (err, res) => {
            if (err) {
              console.log('There was an error creating role');
              prompts();
            } else {
              console.log('----------------------------------');
              console.log(`${role} has been added to roles`);
              console.log('----------------------------------');
              prompts();
            };
          });
        });
    };
  });
};

//change role function
function changeRole() {
  db.query(`SELECT * FROM role`, (err, res) => {
    if (err) {
      console.log('Error loading roles');
      prompts();
    } else {
      const roleSelection = [];
      const roleIdNums = [];
      for (let i = 0; i < res.length; i++) {
        roleSelection.push(res[i].title);
        roleIdNums.push(res[i].id);
      }
      db.query(`SELECT * FROM employee`, (err, res) => {
        if (err) {
          console.log('Error loading employees');
          prompts();
        } else {
          const employeeChoices = [];
          const employeeIdNumbers = [];

          for (let i = 0; i < res.length; i++) {
            employeeChoices.push(`${res[i].first_name} ${res[i].last_name}`);
            employeeIdNumbers.push(res[i].id);
          }
          //inquirer prompt information
          inquirer
            .prompt([
              {
                type: 'list',
                message: `Select employee to update:`,
                choices: employeeChoices,
                name: 'employee',
              },
              {
                type: 'list',
                message: `Enter employee's new role:`,
                choices: roleSelection,
                name: 'newRole',
              }
            ])
            .then(function (response) {

              let {employee, newRole} = response;
              let employeeId;
              let roleId;

              for (let i = 0; i < employeeChoices.length; i++) {
                if (employee === employeeChoices[i]) {
                  employeeId = employeeIdNumbers[i];
                };
                if (newRole === roleSelection[i]) {
                  roleId = roleIdNums[i];
                };
              }
              //update role into the database
              db.query(`UPDATE employee SET role_id = ? WHERE id = ?`, 
              [roleId, employeeId], 
              (err, res) => {
                if (err) {
                  console.log('ERROR');
                } else {
                  console.log('----------------------------------');
                  console.log(`${employee}'s role has been changed to ${newRole}`);
                  console.log('----------------------------------');
                  prompts();
                };
              });
            });
        };
      });
    };
  });
};

//log out function
function logOut() {
  db.end();
  console.log('*logged out*');
};

prompts();