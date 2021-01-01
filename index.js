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
        departments.push(item.name);
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
      name: "employeeToRempove",
      type: "list",
      message: "Select the employee to remove:",
      choices: employees,
    })
    .then((response) => {
      console.log(response);
    });
  start();
}
function updateEmployeeRole() {
  start();
}
function updateEmployeeManager() {
  start();
}
function viewAllRoles() {
  start();
}
function addRole() {
  start();
}
function removeRole() {
  start();
}
function viewAllDepartments() {
  start();
}
function addDepartment() {
  start();
}
function removeDepartment() {
  start();
}

start();
