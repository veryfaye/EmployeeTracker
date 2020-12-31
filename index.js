const inquirer = require("inquirer");
const db = require("./db/connection");
const table = require("console.table");
const logo = require("asciiart-logo");
const { debugPort } = require("process");

const choices = {
  name: "choice",
  type: "rawlist",
  message: "What would you like to do?",
  choices: [
    "View All Employees",
    "Vies All Employees by Department",
    "View All Employees by manager",
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
    "Add Department",
    "Quit",
  ],
};

let departments = [];
let roles = [];
let employees = [];
let managers = [];

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
    roles.push({ title: item.title, id: item.id });
  });
  //   console.log(roles);
});

db.query("SELECT * FROM employee ORDER BY employee.id", function (err, res) {
  res.forEach((item) => {
    employees.push({
      first_name: item.first_name,
      last_name: item.last_name,
      id: item.id,
    });
  });
  //   console.log(employees);
});

db.query(
  "SELECT * FROM employee WHERE manager_id IS NULL",
  function (err, res) {
    res.forEach((item) => {
      managers.push({
        first_name: item.first_name,
        last_name: item.last_name,
        id: item.id,
      });
    });
    // console.log(managers);
  }
);

inquirer.prompt(choices).then((response) => {
    console.log(response.choice)
  switch (response.choice) {
    case "View All Employees":
        console.log(employees);
        
        db.query("SELECT * FROM employee ORDER BY employee.id", function (err, res) {
            console.table(res);
          });
      break;
    case "Vies All Employees by Department":
      break;
    case "View All Employees by manager":
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
    case "Add Department":
      break;
    case "Quit":
        db.end();
      break;
  }
});
