var mysql = require("mysql"); //npm mysql
var inquirer = require("inquirer"); //npm inquirer

var connection = mysql.createConnection({ //new mysql connection from the bamazon_DB database
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "dsravi12",
  database: "bamazon_DB"
});

function updateSales(totalPrice, department) { //function for updating the departments table for tracking customer sales
	connection.query("SELECT * FROM departments WHERE department_name = ?", department, function(err, res) { //select all columns in with the same department name as the product ordered
		var totalSales = res[0].product_sales; //get product_sales from this department's saved table
		if (totalSales !== undefined) { //if sales is defined
			totalPrice += totalSales; //add the database's sales with the passed product sale
			connection.query("UPDATE departments SET ? WHERE ?", [{product_sales: totalPrice},{department_name: department}], function(err, response) { //update the product's department name's sales with the total sales
				if(err)throw err;
			}); //end connection
		} else { //else sales undefined
			connection.query("ALTER TABLE departments ADD COLUMN (product_sales INTEGER(11) NOT NULL)", function(err, result) { //query for adding product_sales to the departments database
				if(err)throw err;
				connection.query("UPDATE departments SET ? WHERE ?", [{product_sales: totalPrice},{department_name: department}], function(err, response) { //update the department's sales with the passed value
					if(err)throw err;
				}); //end update query
			}); //end insert column query
		};
	}); //end departments selection
}

function updateQuantity(stockQuantity, itemName) { //function for updating product's quantity
	connection.query("UPDATE products SET ? WHERE ?",[{stock_quantity: stockQuantity},{product_name: itemName}], function(err, res) { //update query finding product name and changing stock quantity (which was found by taking the database's quantity and subtracting customer's order)
		if(err)throw err;
		if (stockQuantity < 0) { //if stock quantity is a negative number, that's how many items are on back order
			stockQuantity = 0; //so set it back to 0 for display
		}
		console.log(itemName+" now has "+stockQuantity+" left in stock."); //prompt user the left over stock
		start(); //go back to start
	})
}

function buyItem(itemName) { //buyItem function that has itemName argument from start()
	connection.query("SELECT * FROM products WHERE product_name = ?", itemName, function(err, results) { //get query results from the passed itemName
		if (results[0].stock_quantity <= 0) { //if the item's quantity is less then or equal to 0
			console.log("Item ID:"+results[0].item_id+" | Product Name:"+results[0].product_name+" | Department:"+results[0].department_name+" | $"+results[0].price+" | Quantity: 0") //list the details (and just show 0 for quantity)
			console.log("The stock for this item is empty, do you want to select another item to buy?"); //ask if user wants to buy something else
			inquirer.prompt([{
				name: "buyAnother",
				type: "confirm",
				message: "Do you want to buy a different item?"
			}]).then(function(ans) {
				if (ans.buyAnother === true) { //this is a confirm prompt that will either start over again, or exit
					start();
				} else {
					process.exit();
				}
			});
		} else { //else stock is greater then 0
			console.log("Item ID:"+results[0].item_id+" | Product Name:"+results[0].product_name+" | Department:"+results[0].department_name+" | $"+results[0].price+" | Quantity:"+results[0].stock_quantity) //list all the item details
			inquirer.prompt([{
				name: "quantity",
				type: "input",
				message: "Input quantity of item you want to purchase (must be number)" //user input for quantity of item
			}]).then(function(ans) {
				var quantity = ans.quantity; //variable for answer
				if (isNaN(quantity) === false) { //if answer is a number
					var totalPrice = results[0].price * ans.quantity; //find total price
					stockQuantity = results[0].stock_quantity - quantity; //find current quantity by subtracting database's quantity with user's input
					var department = results[0].department_name; //variable for department's name
					updateSales(totalPrice, department); //run updateSales (which update's the departments table)
					if (stockQuantity < 0) { //if quantity is less then 0
						var remainder = stockQuantity * -1; //find the remaining quantity that would be backordered
						console.log("You've ordered "+quantity+" | "+results[0].product_name+" | For a total of: $"+totalPrice); //display details of order
						console.log(remainder+" | "+results[0].product_name+" are backordered"); //and alert how many are backordered
						updateQuantity(stockQuantity, itemName); //update total quantity in the products database
					} else { //else, quantity is greater then 0
						console.log("You've ordered "+quantity+" | "+results[0].product_name+" | For a total of: $"+totalPrice); //display details of user's purchase
						updateQuantity(stockQuantity, itemName); //update total quantity in the products database
					}
				} else { //else input wasn't a number
					console.log("You need to enter a number");
					buyItem(itemName); //go	back to buyItem				
				}
			})
		}

	});
}

function start() {
	connection.query("SELECT * FROM products", function(err, results) { //query all products data from database
		if(err)throw err;
		inquirer.prompt([
		{
			name: "products",
			type: "list",
			choices: function() { //prompt user with list of results
				var itemArr = [];
				for (var i=0; i < results.length; i++) {
					itemArr.push(results[i].product_name+" -$"+results[i].price);
				}
				itemArr.push("----Exit-----") //push an exit function to return to command prompt
				return itemArr;
			},
			message: "Select which product you'd like to buy"
		}
		]).then(function(ans) {
			if (ans.products === "----Exit-----") { //if exit is selected
				process.exit(); //exit
			} else {
				var itemName = ans.products.split(' -$')[0]; //else create variable name itemName
				buyItem(itemName); //run buyItem with itemName argument
			}
		});
	});
};

start(); //start the first function