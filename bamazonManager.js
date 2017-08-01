var mysql = require("mysql"); //npm mysql
var inquirer = require("inquirer"); //npm inquirer

var connection = mysql.createConnection({ //setting new mysql connection from bamazon_DB
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "dsravi12",
  database: "bamazon_DB"
});

function viewItems() { //view items function
	console.log("View Items for Sale");
	connection.query("SELECT * FROM products", function(err, results) { //query that calls all products info
		if(err)throw err;
		inquirer.prompt([
		{
			name: "products",
			type: "list",
			choices: function() { //user prompt with list of item's name, price, and quantity
				var itemArr = [];
				for (var i=0; i < results.length; i++) {
					itemArr.push(results[i].product_name+" -$"+results[i].price+" | Quantity: "+results[i].stock_quantity);
				}
				itemArr.push("----Exit-----") //also push an exit option
				return itemArr;
			},
			message: "Select which product you'd like to see details on"
		}
		]).then(function(ans) {
			if (ans.products === "----Exit-----") { //if input is exit
				process.exit(); //exit
			} else { //else
				var itemName = ans.products.split(' -$')[0]; //get item name by splicing answers that have -$ after the product name
				for (var z=0; z < results.length; z++) {
					if (itemName === results[z].product_name) {
						var itemDetail = results[z]; //create an itemDetail object from the same item name property of the database's results
					}
				}
				//display all details of the item object
				console.log("ID: "+itemDetail.item_id+" | Name: "+itemDetail.product_name+" | Department: "+itemDetail.department_name+" | Price: $"+itemDetail.price+" | Quantity: "+itemDetail.stock_quantity);
				inquirer.prompt([
				{
					name: "confirm",
					type: "confirm",
					message: "Do you want to go to the main menu?"
				}]).then(function(ans) {
					if (ans.confirm === true) { //confirm prompt for either going back to start (main menu) or exit
						start();
					} else {
						process.exit();
					}
				})
			}
		});
	});
};

function lowInventory() { //function for showing and changing low inventory quantity
	console.log("View Items that are low in inventory (5 or less)");
	var query = "SELECT * FROM products WHERE stock_quantity<=5"; //just select products with stock_quantity less then or equal to 5
	connection.query(query, function(err, results) {
		if(err)throw err;
		inquirer.prompt([{
			name: "products",
			type: "list",
			message: "Select which product you'd like to add inventory to",
			choices: function() {
				var itemArr = [];
				for(var i=0; i < results.length; i++) { //create loop to display all returned products details
					itemArr.push(results[i].product_name+" -$"+results[i].price+" | Quantity: "+results[i].stock_quantity);
				}
				itemArr.push("----Exit-----"); //add option for exit
				return itemArr;
			}
		}]).then(function(ans) {
			if (ans.products === "----Exit-----") { //if exit selected, exit
				process.exit();
			} else {
				var itemName = ans.products.split(' -$')[0]; //else create name variable by splicing selected answer at the: -$ point
				for (var z=0; z < results.length; z++) {
					if (itemName === results[z].product_name) { //when the name is equal to the results name, assign it's object
						var itemDetail = results[z];
					}
				}
				if (itemDetail.stock_quantity >= 0) { //If the item's quantity is greater then 0
					console.log("There are "+itemDetail.stock_quantity+" items left.  How many more do you want to buy?"); //confirm current quantity
					inquirer.prompt([{
						name: "quant",
						type: "input",
						message: "Input a number of stock quantity." //ask for how much to add
					}]).then(function(ans) {
						if (isNaN(ans.quant) === false) { //if it is a number
							var quant = parseInt(ans.quant)+parseInt(itemDetail.stock_quantity); //add the answered quantity with the stock quantity
							//run update query to set new quantity to product
							connection.query("UPDATE products SET ? WHERE ?",[{stock_quantity: quant},{product_name: itemDetail.product_name}], function(err, res) {
								if(err)throw err;
								console.log("-----Quantity has been updated-----"); //confirm quantity has been updated
								inquirer.prompt([
								{
									name: "confirm",
									type: "confirm",
									message: "Do you want to go to the main menu?" //ask if user wants to return to main menu
								}]).then(function(ans) {
									if (ans.confirm === true) { //if true
										start(); //go back to start
									} else {
										process.exit(); //or exit
									}
								})
							});
						} else { //else answer wasn't number
							console.log("You must enter a number"); //alert user that they need to enter number
							lowInventory(); //rerun lowInventory function
						}
					});
				} else { //else stock quantity of item is less then 0 (and have backorders)
					var back = itemDetail.stock_quantity * -1; //find the remainder backorders
					console.log("There are currently "+back+" stock items backordered.  Be sure to order more then that.") //display quantity backordered
					inquirer.prompt([{
						name: "quant",
						type: "input",
						message: "Input a number of stock quantity." //
					}]).then(function(ans) {
						if (isNaN(ans.quant) === false) {
							var quant = ans.quant - back;
							connection.query("UPDATE products SET ? WHERE ?",[{stock_quantity: quant},{product_name: itemDetail.product_name}], function(err, res) {
								if(err)throw err;
								console.log("-----Quantity has been updated-----");
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
							});
						} else {
							console.log("You must enter a number");
							lowInventory();
						}
					});
				}
			};
		});
	});
};

function addInventory() {
	console.log("Add to an item's inventory");
	var query = "SELECT * FROM products";
	connection.query(query, function(err, results) {
		if(err)throw err;
		inquirer.prompt([{
			name: "products",
			type: "list",
			message: "Select which product you'd like to add inventory to",
			choices: function() {
				var itemArr = [];
				for(var i=0; i < results.length; i++) {
					itemArr.push(results[i].product_name+" -$"+results[i].price+" | Quantity: "+results[i].stock_quantity);
				}
				itemArr.push("----Exit-----");
				return itemArr;
			}
		}]).then(function(ans) {
			if (ans.products === "----Exit-----") {
				process.exit();
			} else {
				var itemName = ans.products.split(' -$')[0];
				for (var z=0; z < results.length; z++) {
					if (itemName === results[z].product_name) {
						var itemDetail = results[z];
					}
				}
				if (itemDetail.stock_quantity >= 0) {
					console.log("There are "+itemDetail.stock_quantity+" items left.  How many more do you want to buy?");
					inquirer.prompt([{
						name: "quant",
						type: "input",
						message: "Input a number of stock quantity."
					}]).then(function(ans) {
						if (isNaN(ans.quant) === false) {
							var quant = parseInt(ans.quant)+parseInt(itemDetail.stock_quantity);
							connection.query("UPDATE products SET ? WHERE ?",[{stock_quantity: quant},{product_name: itemDetail.product_name}], function(err, res) {
								if(err)throw err;
								console.log("-----Quantity has been updated-----");
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
							});
						} else {
							console.log("You must enter a number");
							lowInventory();
						}
					});
				} else {
					var back = itemDetail.stock_quantity * -1;
					console.log("There are currently "+back+" stock items backordered.  Be sure to order more then that.")
					inquirer.prompt([{
						name: "quant",
						type: "input",
						message: "Input a number of stock quantity."
					}]).then(function(ans) {
						if (isNaN(ans.quant) === false) {
							var quant = ans.quant - back;
							connection.query("UPDATE products SET ? WHERE ?",[{stock_quantity: quant},{product_name: itemDetail.product_name}], function(err, res) {
								if(err)throw err;
								console.log("-----Quantity has been updated-----");
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
							});
						} else {
							console.log("You must enter a number");
							lowInventory();
						}
					});
				}
			};
		});
	});
};

function newDepartment(department) {
	var newDepartment = false;
	connection.query("SELECT * FROM departments", function(err, res) {
		if(err)throw err;
		for(var i=0; i < res.length; i++) {
			if (department !== res[i].department_name) {
				newDepartment = true;
			} else {
				newDepartment = false;
			}
		}
		if (newDepartment === true) {
			connection.query("INSERT INTO departments SET ?", {department_name: department, over_head_costs: 0, product_sales: 0}, function(err, response) {
				if(err)throw err;
				console.log(department+" is a new department.  The supervisor will have to figure the new over head costs for this new department.")
			})
		}
	})
}

function addItem() {
	console.log("Add a new item to sell");
	inquirer.prompt([{
		name: "name",
		type: "input",
		message: "Input item name"
	},{
		name: "department",
		type: "input",
		message: "Input item's department"
	},{
		name: "price",
		type: "input",
		message: "Input the item's price"
	},{
		name: "quant",
		type: "input",
		message: "Input the item's quantity"
	}]).then(function(ans) {
		var department = ans.department;
		newDepartment(department);
		connection.query("INSERT INTO products SET ?",
			{
				product_name: ans.name,
				department_name: ans.department,
				price: ans.price,
				stock_quantity: ans.quant
			}
			, function(err, res) {
			if(err)throw err;
			// console.log(res);
			var object = res.insertId;
			connection.query("SELECT * FROM products WHERE item_id = ?", object, function(err, response) {
				if(err)throw err;
				console.log("ADDED:----\n");
				console.log("ID: "+response[0].item_id+" | Name: "+response[0].product_name+" | Department: "+response[0].department_name+" | Price: $"+response[0].price+" | Quantity: "+response[0].stock_quantity);
				inquirer.prompt([{
					name: "confirm",
					type: "confirm",
					message: "Do you want to return to the main menu?"
				}]).then(function(answer) {
					if (answer.confirm === true) {
						start();
					} else {
						process.exit();
					}
				});
			});
		});
	})
};

function start() {
	inquirer.prompt([
	{
		name: "choices",
		type: "list",
		message: "Select what you want to do:",
		choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "----Exit----"]
	}]).then(function(ans) {
		if (ans.choices === "View Products for Sale") {
			viewItems();
		} else if (ans.choices === "View Low Inventory") {
			lowInventory();
		} else if (ans.choices === "Add to Inventory") {
			addInventory();
		} else if (ans.choices === "Add New Product") {
			addItem();
		} else if (ans.choices === "----Exit----") {
			process.exit();
		}
	});
};
start();