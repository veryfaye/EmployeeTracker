const inquirer = require("inquirer");
const db = require("./db/connection");
const table = require("console.table");
const logo = require("asciiart-logo");
const { debugPort } = require("process");
const { indexOf } = require("lodash");

const choices = {
  name: "choice",
  type: "list",
  message: "What would you like to do?",
  choices: [
    "View All Employees",
    "Vies All Employees by Department",
    "View All Employees by Manager",
    "Add Employee",
    "Remove Employee",
    "Update Employee Role",
    "Update Employee Manager",
    "View All Roles",
    "Add Role",
    "Remove Role",
    "View All Departments",
    "Add Department",
    "Remove Department",
    "Quit",
  ],
};

let departments = [];
let roles = [];
let managers = [];
let employees = [];
let employeeQuery;

function start() {
  departments = [];
  roles = [];
  managers = [];
  employees = [];
  employeeQuery =
    'SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee LEFT JOIN employee m ON employee.manager_id = m.id INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id';
  db.query(
    "SELECT * FROM department ORDER BY department.id",
    function (err, res) {
      res.forEach((item) => {
        departments.push({ name: item.name, id: item.id });
      });
      // console.log(departments);
    }
  );

  db.query("SELECT * FROM role ORDER BY role.id", function (err, res) {
    res.forEach((item) => {
      roles.push({ name: item.title, id: item.id });
    });
    //   console.log(roles);
  });

  db.query(
    "SELECT * FROM employee WHERE manager_id IS NULL ORDER BY employee.id",
    function (err, res) {
      res.forEach((item) => {
        managerName = item.first_name + " " + item.last_name;
        managers.push({ name: managerName, id: item.id });
      });
      // console.log(managers);
    }
  );

  db.query("SELECT * FROM employee ORDER BY employee.id", function (err, res) {
    res.forEach((item) => {
      employeeName = item.first_name + " " + item.last_name;
      employees.push({ name: employeeName, id: item.id });
    });
    // console.log(employees);
  });

  inquirer.prompt(choices).then((response) => {
    console.log(response.choice);
    switch (response.choice) {
      case "View All Employees":
        viewAllEmployees();
        break;
      case "Vies All Employees by Department":
        viewAllEmployeesByDepartment();
        break;
      case "View All Employees by Manager":
        viewAllEmployeesByManager();
        break;
      case "Add Employee":
        addEmployee();
        break;
      case "Remove Employee":
        removeEmployee();
        break;
      case "Update Employee Role":
        updateEmployeeRole();
        break;
      case "Update Employee Manager":
        updateEmployeeManager();
        break;
      case "View All Roles":
        viewAllRoles();
        break;
      case "Add Role":
        addRole();
        break;
      case "Remove Role":
        removeRole();
        break;
      case "View All Departments":
        viewAllDepartments();
        break;
      case "Add Department":
        addDepartment();
        break;
      case "Remove Department":
        removeDepartment();
        break;
      case "Quit":
        db.end();
        break;
    }
  });
}
function getID(array, key) {
  let index = array
    .map(function (e) {
      return e.name;
    })
    .indexOf(key);
  return array[index].id;
}
function viewAllEmployees() {
  db.query(employeeQuery, function (err, res) {
    console.table(res);
    start();
  });
}

function viewAllEmployeesByDepartment() {
  inquirer
    .prompt({
      name: "deptAction",
      type: "list",
      message: "Select the department to filter by:",
      choices: departments,
    })
    .then((response) => {
      employeeQuery += " WHERE department.name = ? ORDER BY employee.id";
      db.query(employeeQuery, response.deptAction, function (err, res) {
        console.table(res);
        start();
      });
    });
}

function viewAllEmployeesByManager() {
  inquirer
    .prompt({
      name: "managerAction",
      type: "list",
      message: "Select the manager to filter by:",
      choices: managers,
    })
    .then((response) => {
      employeeQuery +=
        ' WHERE CONCAT(m.first_name, " ", m.last_name) = ? ORDER BY employee.id';
      db.query(employeeQuery, response.managerAction, function (err, res) {
        console.table(res);
        start();
      });
    });
}

function addEmployee() {
  employees.push({ name: "No Manager", id: null });
  inquirer
    .prompt([
      {
        name: "firstName",
        message: "Enter the employee's first name: ",
      },
      {
        name: "lastName",
        message: "Enter the employee's last name: ",
      },
      {
        name: "role",
        type: "list",
        message: "Select the employee's role:",
        choices: roles,
      },
      {
        name: "manager",
        type: "list",
        message: "Select the employee's manager:",
        choices: employees,
      },
    ])
    .then((response) => {
      let employeeRoleID = getID(roles, response.role);
      let employeeManagerID = getID(employees, response.manager);
      db.query(
        "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)",
        [
          response.firstName,
          response.lastName,
          employeeRoleID,
          employeeManagerID,
        ],
        function (err) {
          if (err) throw err;
          start();
        }
      );
    });
}
function removeEmployee() {
  inquirer
    .prompt({
      name: "employeeToRemove",
      type: "list",
      message: "Select the employee to remove:",
      choices: employees,
    })
    .then((response) => {
      console.log(response);
      let employeeID = getID(employees, response.employeeToRemove);
      db.query("DELETE FROM employee WHERE id =?", employeeID, function (err) {
        if (err) throw err;
        start();
      });
    });
}
function updateEmployeeRole() {
  inquirer
    .prompt([
      {
        name: "employeeToUpdateRole",
        type: "list",
        message: "Select the employee to update:",
        choices: employees,
      },
      {
        name: "roleToUpdate",
        type: "list",
        message: "Select the new Role:",
        choices: roles,
      },
    ])
    .then((response) => {
      console.log(response);
      let employeeID = getID(employees, response.employeeToUpdateRole);
      let roleID = getID(roles, response.roleToUpdate);

      db.query(
        "UPDATE employee SET role_id = ? WHERE id = ?",
        [roleID, employeeID],
        function (err) {
          if (err) throw err;
          start();
        }
      );
    });
}
function updateEmployeeManager() {
  inquirer
    .prompt([
      {
        name: "employeeToUpdateManager",
        type: "list",
        message: "Select the employee to update:",
        choices: employees,
      },
      {
        name: "managerToUpdate",
        type: "list",
        message: "Select the new Manager:",
        choices: employees,
      },
    ])
    .then((response) => {
      console.log(response);
      let employeeID = getID(employees, response.employeeToUpdateManager);
      let managerID = getID(employees, response.managerToUpdate);

      db.query(
        "UPDATE employee SET manager_id = ? WHERE id = ?",
        [managerID, employeeID],
        function (err) {
          if (err) throw err;
          start();
        }
      );
    });
}
function viewAllRoles() {
  db.query(
    "SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department ON role.department_id = department.id ORDER BY role.id",
    function (err, res) {
      console.table(res);
      start();
    }
  );
}
function addRole() {
  inquirer
    .prompt([
      {
        name: "title",
        message: "Enter the role title: ",
      },
      {
        name: "salary",
        message: "Enter the salary for the role: ",
      },
      {
        name: "department",
        type: "list",
        message: "Select the department for the role:",
        choices: departments,
      },
    ])
    .then((response) => {
      let departmentID = getID(departments, response.department);
      db.query(
        "INSERT INTO role (title, salary, department_id) VALUES (?,?,?)",
        [response.title, response.salary, departmentID],
        function (err) {
          if (err) throw err;
          start();
        }
      );
    });
}
function removeRole() {
  inquirer
    .prompt([
      {
        name: "roleToRemove",
        type: "list",
        message: "Select the role to remove:",
        choices: roles,
      },
    ])
    .then((response) => {
      let roleID = getID(roles, response.roleToRemove);
      db.query("DELETE FROM role WHERE id =?", roleID, function (err) {
        if (err) throw err;
        start();
      });
    });
}
function viewAllDepartments() {
  db.query("SELECT * FROM department", function (err, res) {
    console.table(res);
    start();
  });
}
function addDepartment() {
  inquirer
    .prompt([
      { name: "deptToAdd", message: "Enter the name of the new Department: " },
    ])
    .then((response) => {
      db.query(
        "INSERT INTO department (name) VALUES (?)",
        response.deptToAdd,
        function (err) {
          if (err) throw err;
          start();
        }
      );
    });
}
function removeDepartment() {
  inquirer
    .prompt([
      {
        name: "deptToRemove",
        type: "list",
        message: "Select the Department to remove",
        choices: departments,
      },
    ])
    .then((response) => {
      let deptID = getID(departments, response.deptToRemove);
      db.query("DELETE FROM department WHERE id = ?", deptID, function (err) {
        if (err) throw err;
        start();
      });
    });
}

start();
