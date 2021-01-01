const inquirer = require("inquirer");
const db = require("./db/connection");
const table = require("console.table");
const logo = require("asciiart-logo");
const { debugPort } = require("process");

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
let managerID = [];
let employeeQuery;

function start() {
  departments = [];
  roles = [];
  managers = [];
  managerID = [];
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
      roles.push(item.title);
    });
    //   console.log(roles);
  });

  db.query(
    "SELECT * FROM employee WHERE manager_id IS NULL",
    function (err, res) {
      res.forEach((item) => {
        managers.push(item.first_name + " " + item.last_name);
        managerID.push(item.id);
      });
      // console.log(managers);
    }
  );
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
        break;
      case "Remove Employee":
        break;
      case "Update Employee Role":
        break;
      case "Update Employee Manager":
        break;
      case "View All Roles":
        break;
      case "Add Role":
        break;
      case "Remove Role":
        break;
      case "View All Departments":
        break;
      case "Add Department":
        break;
      case "Remove Department":
        break;
      case "Quit":
        db.end();
        break;
    }
  });
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
function addEmployee() {}
function removeEmployee() {}
function updateEmployeeRole() {}
function updateEmployeeManager() {}
function viewAllRoles() {}
function addRole() {}
function removeRole() {}
function viewAllDepartments() {}
function addDepartment() {}
function removeDepartment() {}

start();
