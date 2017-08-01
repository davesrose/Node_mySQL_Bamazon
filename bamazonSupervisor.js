var Table = require("cli-table"); //npm table for displaying tables

var mysql = require("mysql"); //npm mysql
var inquirer = require("inquirer"); //npm inquirer

var connection = mysql.createConnection({ //new mysql connection from bamazon_DB
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "dsravi12",
  database: "bamazon_DB"
});

function start(response, table) { //initial start function that creates department table and stores database's department table

	var table = new Table({ //new table with head array
		head: ["department_id", "department_name", "over_head_costs", "product_sales", "total_profit"],
		// style: {head: []}
	});
	connection.query("SELECT * FROM departments INNER JOIN products ON departments.department_name=products.department_name", function(err, res) {
		connection.query("SELECT * FROM departments", function(err, response) { //grabbing all items from departments database
			// console.log(response);
			if(err)throw err;
			var tableArr = []; //new table array
			for (var i=0; i < response.length; i++) { //for loop that first creates variables from the database item
				var id = response[i].department_id;
				var name = response[i].department_name;
				var overHead = response[i].over_head_costs;
				var sales = response[i].product_sales;
				if (sales === undefined) { //if sales hasn't been generated yet, assign as 0
					sales = 0;
				}
				var profit = parseInt(sales) - parseInt(overHead); //get profit by subtracting sales and over heaad
				table.push(
					[id, name, "$"+overHead, "$"+sales, "$"+profit], //push variables into table's next line
				)
			};
			// console.log(table.toString());
			main(res, response, table); //run main function that passes departments database and generated table
		});
	});

};

function main(res, response, table) { //main function that displays main menu
	inquirer.prompt([{
		name: "choice",
		type: "list",
		message: "What would you like to do?", 
		choices: ["View Product Sales by Department", "Create New Department", "Visit a new department's over head cost", "----Exit----"]
	}]).then(function(ans) {
		if (ans.choice === "View Product Sales by Department") { //if choice is view sales
			// start(response, table);
			var noInventory = false; //create no inventory boolean
			for (var z=0; z < response.length; z++) { //create for loop
				var overHead = response[z].over_head_costs; //define overhead as department's over_head_costs
				if (overHead === 0) { // if over head costs equal 0
					noInventory = true; //set boolean to true
					var deptName = response[z].department_name; //get department's name
				}
			}
			if (noInventory === true) { //if boolean is true
				//alert that the department has been added by new items.
				console.log(deptName+" is a new department added by the manager.  Please evaluate the over head costs.")
			}
			console.log(table.toString()); //display saved table
			returnMenu(); //run returnMenu function (that asks user if they want to go to main menu or exit)
		} else if (ans.choice === "Create New Department") {
			createDepartment(response, table); //create new department function
		} else if (ans.choice === "Visit a new department's over head cost") {
			createOverHead(res, response, table); //create new over head costs function
		} else if (ans.choice === "----Exit----") {
			process.exit() //exit
		};
	});
};

start(); //run starting function

function returnMenu() { //function that asks user if they want to return to main menu or exit
	console.log("-")
	inquirer.prompt([
	{
		name: "confirm",
		type: "confirm",
		message: "Do you want to go to the main menu?"
	}]).then(function(ans) {
		if (ans.confirm === true) {
			start();
		} else {
			process.exit();
		}
	})
};

function createOverHead(res, response, table) { //create over head costs function
	for (var i=0; i < response.length; i++) { //loop for alerting supervisor if a department currently has no over head costs figured yet
		if (response[i].over_head_costs === 0) {
			console.log(response[i].over_head_costs+" currently does not have any over head costs yet.")
		}
	};
	var isTrue = false; //create isTrue boolean
	inquirer.prompt([{
		name: "choice",
		type: "list",
		message: "Select which department you'd like details on",
		choices: function() { //function for listing each department
			function unique(input) {
				return input.reduce(function(acc, current) {
					if (acc.indexOf(current.department_name+" | Over head costs: "+current.over_head_costs) > -1) {
						return acc
					} else {
						return acc.concat([current.department_name+" | Over head costs: "+current.over_head_costs]);
					}
				}, [])
			}
			var itemArr = unique(response);
			itemArr.push("----Exit-----") //add exit option
			return itemArr;			
		}
	}]).then(function(ans) {
		if (ans.choice === "----Exit-----") { //if exit selected
			process.exit(); //exit
		} else { //else get selected department name by splicing answer's ' | Over head costs: '
			var currentDept = ans.choice.split(' | Over head costs: ')[0];
			console.log(currentDept+" department selected.  Details on department:"); //confirm current department
			for (var z=0; z < response.length; z++) { //run for loop to get full details of current department
				if(response[z].department_name === currentDept) {
					var currDeptArr = [];
					currDeptArr.push(response[z]);
				}
			}
			//create new table with selected department's details
			var deptTable = new Table({head: ["department_id", "department_name", "over_head_costs", "product_sales", "total_profit"]});
			var id = currDeptArr[0].department_id;
			name = currDeptArr[0].department_name;
			overHead = currDeptArr[0].over_head_costs; //setting current department's variables
			for (var z=0; z < response.length; z++) { //run for loop to see if department.product_sales has been created yet
				var sales = response[z].product_sales;
				if (sales === undefined) { //if not, set sales to 0
					sales = 0;
				}
			}
			var profit = parseInt(sales) - parseInt(overHead); //create profit variable by subtracting sales with overhead
			deptTable.push([id, name, "$"+overHead, "$"+sales, "$"+profit]); //create table row with array from above variables
			console.log(deptTable.toString()); //display selected department table
			console.log("Item's in the selected department:");
			//create new product table
			var prodTable = new Table({head: ["item_id", "product_name", "department_name", "price", "stock_quantity"]})
			for (var e=0; e < res.length; e++) { //for loop using the passed product and department joins
				if(name === res[e].department_name) { //loop for finding selected department's name with object's name
					//if equal, push that product's detail in the product table
					prodTable.push([res[e].item_id, res[e].product_name, res[e].department_name, res[e].price, res[e].stock_quantity],)
				}
			}
			console.log(prodTable.toString()); //display the product details in the same department
			console.log("-------------"); //rendering line break
			inquirer.prompt([{
				name: "change",
				type: "confirm",
				message: "Do you want to change over head costs?" //ask if user wants to change the overhead costs of the department
			}]).then(function(answer) {
				if (answer.change === true) {
				console.log(name+" department selected, with an over head cost of: $"+overHead); //confirm department and current over head
				inquirer.prompt([{
					name: "overHead",
					type: "input",
					message: "Enter a new over head cost for this department.  It must be a number."
				}]).then(function(ans) {
					if (isNaN(ans.overHead) === false) { //if input overhead is a number
						var newOverHead = ans.overHead; //create new over head variable and then update the database's over head value
						connection.query("UPDATE departments SET ? WHERE ?", [{over_head_costs: newOverHead},{department_name: name}], function(err, response) {
							if(err)throw err;
						});
						console.log(name+" department has had its over head cost changed to: $"+newOverHead); //confirm value has been updated
						returnMenu(); //run function for asking if user wants to go to main menu or exit
					} else { //else input wasn't a number
						console.log("You have to enter a number");
						returnMenu();
					}
				});
				} else { //if user doesn't want to change over head costs
					start(); //go back to the start
				}
			});
			
		}
	})
};


function createDepartment(response, table) { //create new department function
	inquirer.prompt([{
		name: "dept",
		type: "input",
		message: "Type in the new department name." //input a new department name
	}]).then(function(ans) {
		var newDept = ans.dept; //answer for checking if answer is new
		for (var i=0; i < response.length; i++) { //for loop for checking duplicates
			if (newDept === response[i].department_name) { //if answer has same name as a department's name
				newDept = false; //set newDept as false
			} 
		}
		if (newDept === ans.dept) { //if newDept is still the typed answer
			inquirer.prompt([{
				name: "overHead",
				type: "input",
				message: "Type an over head amount for the new department (must be a number)" //type over head cost
			}]).then(function(ans) {
				var overHead = parseInt(ans.overHead); //make sure answer is number
				if (isNaN(overHead) !== false) { //if value is not a number
					console.log("It must be a number"); //alert that user must type a number
					createDepartment(response, table); //rerun createDepartment
				} else { //else value is number
					//insert new department's name, overhead costs, and product sales (which since it's new, has a 0 value)
					connection.query("INSERT INTO departments SET ?", {department_name: newDept, over_head_costs: overHead, product_sales: 0}, function(err, response) {
						if(err)throw err;
					});
					console.log("Department: "+newDept+" has been added, with an over head cost of: "+overHead); //confirm new dept added
					returnMenu(); //ask user if they want to go to main menu or exit
				}

			});
		} else if (newDept === false) { //if department answer wasn't new
			console.log(ans.dept+" is not a new department.") //alert user
			returnMenu(); //ask if they want to go to main menu
		}
	});
};