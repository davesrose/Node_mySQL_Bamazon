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

function updateSales(totalPrice, department) {
	connection.query("SELECT * FROM departments WHERE department_name = ?", department, function(err, res) {
		var totalSales = res[0].product_sales;
		if (totalSales !== undefined) {
			totalPrice += totalSales;
			connection.query("UPDATE departments SET ? WHERE ?", [{product_sales: totalPrice},{department_name: department}], function(err, response) {
				if(err)throw err;
			});
		} else {
			connection.query("ALTER TABLE departments ADD COLUMN (product_sales INTEGER(11) NOT NULL)", function(err, result) {
				if(err)throw err;
				connection.query("UPDATE departments SET ? WHERE ?", [{product_sales: totalPrice},{department_name: department}], function(err, response) {
					if(err)throw err;
				});
			});
		};
	});
}

function updateQuantity(stockQuantity, itemName) {
	connection.query("UPDATE products SET ? WHERE ?",[{stock_quantity: stockQuantity},{product_name: itemName}], function(err, res) {
		if(err)throw err;
		if (stockQuantity < 0) {
			stockQuantity = 0;
		}
		console.log(itemName+" now has "+stockQuantity+" left in stock.");
		start();
	})
}

function buyItem(itemName) {
	connection.query("SELECT * FROM products WHERE product_name = ?", itemName, function(err, results) {
		if (results[0].stock_quantity <= 0) {
			console.log("Item ID:"+results[0].item_id+" | Product Name:"+results[0].product_name+" | Department:"+results[0].department_name+" | $"+results[0].price+" | Quantity: 0")
			console.log("The stock for this item is empty, do you want to select another item to buy?");
			inquirer.prompt([{
				name: "buyAnother",
				type: "confirm",
				message: "Do you want to buy a different item?"
			}]).then(function(ans) {
				if (ans.buyAnother === true) {
					start();
				} else {
					process.exit();
				}
			});
		} else {
			console.log("Item ID:"+results[0].item_id+" | Product Name:"+results[0].product_name+" | Department:"+results[0].department_name+" | $"+results[0].price+" | Quantity:"+results[0].stock_quantity)
			inquirer.prompt([{
				name: "quantity",
				type: "input",
				message: "Input quantity of item you want to purchase (must be number)"
			}]).then(function(ans) {
				var quantity = ans.quantity;
				if (isNaN(quantity) === false) {
					var totalPrice = results[0].price * ans.quantity;
					stockQuantity = results[0].stock_quantity - quantity;
					var department = results[0].department_name;
					updateSales(totalPrice, department);
					if (stockQuantity < 0) {
						var remainder = stockQuantity * -1;
						console.log("You've ordered "+quantity+" | "+results[0].product_name+" | For a total of: $"+totalPrice);
						console.log(remainder+" | "+results[0].product_name+" are backordered");
						updateQuantity(stockQuantity, itemName);
					} else {
						console.log("You've ordered "+quantity+" | "+results[0].product_name+" | For a total of: $"+totalPrice);
						updateQuantity(stockQuantity, itemName);
					}
				} else {
					console.log("You need to enter a number");
					buyItem(itemName);					
				}
			})
		}

	});
}

function start() {
	connection.query("SELECT * FROM products", function(err, results) {
		if(err)throw err;
		inquirer.prompt([
		{
			name: "products",
			type: "list",
			choices: function() {
				var itemArr = [];
				for (var i=0; i < results.length; i++) {
					itemArr.push(results[i].product_name+" -$"+results[i].price);
				}
				itemArr.push("----Exit-----")
				return itemArr;
			},
			message: "Select which product you'd like to buy"
		}
		]).then(function(ans) {
			if (ans.products === "----Exit-----") {
				process.exit();
			} else {
				var itemName = ans.products.split(' -$')[0];
				buyItem(itemName);
			}
		});
	});
};

start();