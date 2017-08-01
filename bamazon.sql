DROP DATABASE IF EXISTS bamazon_DB;

CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products (
	item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(100) DEFAULT "Bamazon Echo" NOT NULL,
    department_name VARCHAR(100) DEFAULT "Electronics" NOT NULL,
    price INTEGER(11) DEFAULT 98.99 NOT NULL,
    stock_quantity INTEGER(11)  DEFAULT 100 NOT NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Avatar blu-ray", "movies", 20.00, 26), ("Blade Runner Final Cut blu-ray", "movies", 22.00, 35), ("Titanic blu-ray", "movies", 20.00, 22), ("The Kite Runner", "books", 12.00, 60), ("The Girl in the Spider's Web", "books", 13.00, 45), ("His Bloody Project", "books", 11.00, 32), ("Heart of Darkness", "bindle books", 0.00, 100), ("In the Heart of the Sea", "bindle books", 11.00, 95), ("Bounty paper towels", "home goods", 4.00, 65), ("Tide detergent", "home goods", 9.00, 35);

CREATE TABLE departments (
	department_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(100) DEFAULT "movies" NOT NULL,
    over_head_costs INTEGER(11) DEFAULT 0,
    PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("movies", 500), ("books", 400), ("bindle books", 350), ("home goods", 300);

SELECT * FROM products;
SELECT * FROM departments;