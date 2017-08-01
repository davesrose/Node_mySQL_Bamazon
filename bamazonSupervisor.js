var Table = require("cli-table");

var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "dsravi12",
  database: "bamazon_DB"
});

function start(response, table) {

	var table = new Table({
		head: ["department_id", "department_name", "over_head_costs", "product_sales", "total_profit"],
		// style: {head: []}
	});
	// connection.query("SELECT * FROM departments INNER JOIN products ON departments.department_name=products.department_name", function(err, response) {
	connection.query("SELECT * FROM departments", function(err, response) {
		// console.log(response);
		if(err)throw err;
		var tableArr = [];
		for (var i=0; i < response.length; i++) {
			var id = response[i].department_id;
			var name = response[i].department_name;
			var overHead = response[i].over_head_costs;
			var sales = response[i].product_sales;
			if (sales === undefined) {
				sales = 0;
			}
			var profit = parseInt(sales) - parseInt(overHead);
			table.push(
				[id, name, "$"+overHead, "$"+sales, "$"+profit],
			)
		};
		// console.log(table.toString());
		main(response, table);
	});

};

function main(response, table) {
	inquirer.prompt([{
		name: "choice",
		type: "list",
		message: "What would you like to do?",
		choices: ["View Product Sales by Department", "Create New Department", "Visit a new department's over head cost"]
	}]).then(function(ans) {
		if (ans.choice === "View Product Sales by Department") {
			// start(response, table);
			var noInventory = false;
			for (var z=0; z < response.length; z++) {
				var overHead = response[z].over_head_costs;
				if (overHead === 0) {
					noInventory = true;
					var deptName = response[z].department_name;
				}
			}
			if (noInventory === true) {
				console.log(deptName+" is a new department added by the manager.  Please evaluate the over head costs.")
			}
			console.log(table.toString());
			returnMenu();
		} else if (ans.choice === "Create New Department") {
			createDepartment(response, table);
		} else if (ans.choice === "Visit a new department's over head cost") {
			createOverHead(response, table);
		};
	});
};

start();

function returnMenu() {
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

function createOverHead(response, table) {
	for (var i=0; i < response.length; i++) {
		if (response[i].over_head_costs === 0) {
			console.log(response[i].over_head_costs+" currently does not have any over head costs yet.")
		}
	};
	var isTrue = false;
	inquirer.prompt([{
		name: "choice",
		type: "list",
		message: "Select which department you'd like details on",
		choices: function() {
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
			itemArr.push("----Exit-----")
			return itemArr;			
		}
	}]).then(function(ans) {
		if (ans.choice === "----Exit-----") {
			process.exit();
		} else {
			var currentDept = ans.choice.split(' | Over head costs: ')[0];
			console.log(currentDept+" department selected.  Details on department:");
			for (var z=0; z < response.length; z++) {
				if(response[z].department_name === currentDept) {
					var currDeptArr = [];
					currDeptArr.push(response[z]);
				}
			}
			var deptTable = new Table({head: ["department_id", "department_name", "over_head_costs", "product_sales", "total_profit"]});
			var id = currDeptArr[0].department_id;
			name = currDeptArr[0].department_name;
			overHead = currDeptArr[0].over_head_costs;
			for (var z=0; z < response.length; z++) {
				var sales = response[z].product_sales;
				if (sales === undefined) {
					sales = 0;
				}
			}
			var profit = parseInt(sales) - parseInt(overHead);
			deptTable.push([id, name, "$"+overHead, "$"+sales, "$"+profit]);
			console.log(deptTable.toString());
			console.log("-------------");
			inquirer.prompt([{
				name: "change",
				type: "confirm",
				message: "Do you want to change over head costs?"
			}]).then(function(answer) {
				if (answer.change === true) {
				console.log(name+" department selected, with an over head cost of: $"+overHead);
				inquirer.prompt([{
					name: "overHead",
					type: "input",
					message: "Enter a new over head cost for this department.  It must be a number."
				}]).then(function(ans) {
					if (isNaN(ans.overHead) === false) {
						var newOverHead = ans.overHead;
						connection.query("UPDATE departments SET ? WHERE ?", [{over_head_costs: newOverHead},{department_name: name}], function(err, response) {
							if(err)throw err;
						});
						console.log(name+" department has had its over head cost changed to: $"+newOverHead);
						returnMenu();
					} else {
						console.log("You have to enter a number");
						returnMenu();
					}
				});
				} else {
					start();
				}
			});
			
		}
	})
};


function createDepartment(response, table) {
	inquirer.prompt([{
		name: "dept",
		type: "input",
		message: "Type in the new department name."
	}]).then(function(ans) {
		var newDept = ans.dept;
		for (var i=0; i < response.length; i++) {
			if (newDept === response[i].department_name) {
				newDept = false;
			} 
		}
		if (newDept === ans.dept) {
			inquirer.prompt([{
				name: "overHead",
				type: "input",
				message: "Type an over head amount for the new department (must be a number)"
			}]).then(function(ans) {
				var overHead = parseInt(ans.overHead);
				if (isNaN(overHead) !== false) {
					console.log("It must be a number");
					createDepartment(response, table);
				} else {
					connection.query("INSERT INTO departments SET ?", {department_name: newDept, over_head_costs: overHead, product_sales: 0}, function(err, response) {
						if(err)throw err;
					});
					console.log("Department: "+newDept+" has been added, with an over head cost of: "+overHead);
					returnMenu();			
				}

			});
		} else if (newDept === false) {
			console.log(ans.dept+" is not a new department.")
			returnMenu();
		}
	});
};