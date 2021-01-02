const inquirer = require("inquirer");
const db = require("./db/connection");
const logo = require("asciiart-logo");
const config = require("./package.json");

//used to ask the user what action to take when start() is called
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
    "View Department Budget",
    "Quit",
  ],
};

let departments = [];
let roles = [];
let managers = [];
let employees = [];
let employeeQuery;

//Display Logo, and call start function
function logoArt() {
  console.log(logo(config).render());
  start();
}

//Used to reset all arrays, and prompt the user
function start() {
  //reset arrays that store the db information
  departments = [];
  roles = [];
  managers = [];
  employees = [];
  //query used in all employee functions
  employeeQuery =
    'SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee LEFT JOIN employee m ON employee.manager_id = m.id INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id';

  //gather department name and id into an array of objects
  db.query(
    "SELECT * FROM department ORDER BY department.id",
    function (err, res) {
      if (err) throw err;
      res.forEach((item) => {
        departments.push({ name: item.name, id: item.id });
      });
    }
  );

  //gather role title and id into an array of objects
  db.query("SELECT * FROM role ORDER BY role.id", function (err, res) {
    if (err) throw err;
    res.forEach((item) => {
      roles.push({ name: item.title, id: item.id });
    });
  });

  //gather managers names and ids from employee table into an array of objects
  db.query(
    "SELECT * FROM employee WHERE manager_id IS NULL ORDER BY employee.id",
    function (err, res) {
      if (err) throw err;
      res.forEach((item) => {
        managerName = item.first_name + " " + item.last_name;
        managers.push({ name: managerName, id: item.id });
      });
    }
  );

  //gather all employee names and ids into an array of objects
  db.query("SELECT * FROM employee ORDER BY employee.id", function (err, res) {
    if (err) throw err;
    res.forEach((item) => {
      employeeName = item.first_name + " " + item.last_name;
      employees.push({ name: employeeName, id: item.id });
    });
  });

  //Ask the user what action they want to take. Depending on the response then call the specific funciton
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
      case "View Department Budget":
        viewDepartmentBudget();
        break;
      case "Quit":
        db.end();
        break;
    }
  });
}

//function to get the id from an array of objects with the keys "name" and "id"
function getID(array, key) {
  let index = array
    .map(function (e) {
      return e.name;
    })
    .indexOf(key);
  return array[index].id;
}

//funciton to view all employees from the database
function viewAllEmployees() {
  db.query(employeeQuery, function (err, res) {
    if (err) throw err;
    console.table(res);
    start();
  });
}

//function to filter by department and view employees
function viewAllEmployeesByDepartment() {
  inquirer
    .prompt({
      name: "deptAction",
      type: "list",
      message: "Select the department to filter by:",
      choices: departments,
    })
    .then((response) => {
      //add this to the query text defined above to filter by department
      employeeQuery += " WHERE department.name = ? ORDER BY employee.id";
      db.query(employeeQuery, response.deptAction, function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
      });
    });
}

//function to filter by manager and view employees
function viewAllEmployeesByManager() {
  inquirer
    .prompt({
      name: "managerAction",
      type: "list",
      message: "Select the manager to filter by:",
      choices: managers,
    })
    .then((response) => {
      //add this to the query text defined above to filter by manager
      employeeQuery +=
        ' WHERE CONCAT(m.first_name, " ", m.last_name) = ? ORDER BY employee.id';
      db.query(employeeQuery, response.managerAction, function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
      });
    });
}

//function to add an employee to the database
function addEmployee() {
  //allow for a no manager option
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
      //use get id from above to get the id from the names selected in the prompt
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
          viewAllEmployees();
          start();
        }
      );
    });
}

//function to remove an employee from the database
function removeEmployee() {
  inquirer
    .prompt({
      name: "employeeToRemove",
      type: "list",
      message: "Select the employee to remove:",
      choices: employees,
    })
    .then((response) => {
      //use get id from above to get the id from the name selected in the prompt
      let employeeID = getID(employees, response.employeeToRemove);
      db.query("DELETE FROM employee WHERE id =?", employeeID, function (err) {
        if (err) throw err;
        viewAllEmployees();
        start();
      });
    });
}

//function to allow the user to update the role of an employee
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
      //use get id from above to get the id from the name selected in the prompt
      let employeeID = getID(employees, response.employeeToUpdateRole);
      let roleID = getID(roles, response.roleToUpdate);
      db.query(
        "UPDATE employee SET role_id = ? WHERE id = ?",
        [roleID, employeeID],
        function (err) {
          if (err) throw err;
          viewAllEmployees();
          start();
        }
      );
    });
}

//funciton to update the manager of an existing employee
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
      //use get id from above to get the id from the name selected in the prompt
      let employeeID = getID(employees, response.employeeToUpdateManager);
      let managerID = getID(employees, response.managerToUpdate);
      db.query(
        "UPDATE employee SET manager_id = ? WHERE id = ?",
        [managerID, employeeID],
        function (err) {
          if (err) throw err;
          viewAllEmployees();
          start();
        }
      );
    });
}

//funciton to view all the roles in the database and their related departments
function viewAllRoles() {
  db.query(
    "SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department ON role.department_id = department.id ORDER BY role.id",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}

//function to add a role to the database
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
      //use get id from above to get the id from the name selected in the prompt
      let departmentID = getID(departments, response.department);
      db.query(
        "INSERT INTO role (title, salary, department_id) VALUES (?,?,?)",
        [response.title, response.salary, departmentID],
        function (err) {
          if (err) throw err;
          viewAllRoles();
          start();
        }
      );
    });
}

//function to be able to remove an existing role from the database
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
      //use get id from above to get the id from the name selected in the prompt
      let roleID = getID(roles, response.roleToRemove);
      db.query("DELETE FROM role WHERE id =?", roleID, function (err) {
        if (err) throw err;
        viewAllRoles();
        start();
      });
    });
}

//function to view all existing departments
function viewAllDepartments() {
  db.query("SELECT * FROM department", function (err, res) {
    console.table(res);
    start();
  });
}

//function to add a department to the database
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
          viewAllDepartments();
          start();
        }
      );
    });
}

//function to remove an existing department from the database
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
      //use get id from above to get the id from the name selected in the prompt
      let deptID = getID(departments, response.deptToRemove);
      db.query("DELETE FROM department WHERE id = ?", deptID, function (err) {
        if (err) throw err;
        viewAllDepartments();
        start();
      });
    });
}

//function to view the total budget of the department as the sum of all the employees salaries in that department
function viewDepartmentBudget() {
  inquirer
    .prompt([
      {
        name: "deptBudget",
        type: "list",
        message: "Select the department to view the budget:",
        choices: departments,
      },
    ])
    .then((response) => {
      //use get id from above to get the id from the name selected in the prompt
      let deptID = getID(departments, response.deptBudget);
      db.query(
        "SELECT salary FROM role WHERE department_id = ?",
        deptID,
        function (err, res) {
          if (err) throw err;
          let salaries = 0;
          res.forEach((item) => {
            salaries += item.salary;
          });
          console.log(
            "Combined salaries for the ",
            response.deptBudget + " is " + salaries
          );
          start();
        }
      );
    });
}

// call logoArt to initialize the application
logoArt();
