This is a project using Node.js and mySQL to create a database with customer, manager, and supervisor tables.

I followed most of the homework, accept I thought Bamazon should be more like Amazon.  If a customer orders more then what's in stock, they'll be alerted to how many are backordered.  Further orders are prevented.  Included are examples of each interface:

**node bamazonCustomer.js:**

User first selects product:--------------------------------------------------------
![Image of screenshot1](/images/01.jpg)

They see a detailed description, and they chose how many quanitities of the item they want:
![Image of screenshot2](/images/02.jpg)

If they don't enter a number, they'll be prompted to try again:
![Image of screenshot3](/images/03.jpg)

If I buy 10 books of Girl in the Spider's Web for presents, the total price is shown, along with stock quantity change.  The prompt then goes back to the main menu:
![Image of screenshot4](/images/04.jpg)

Proof of products database changing (Girl in the Spider's Web is now 35):
![Image of screenshot5](/images/05.jpg)

I've ordered 2 more Avatar Blu-rays then what's in stock.  I'm prompted that 2 are backordered, and future orders are refused.
![Image of screenshot6](/images/06.jpg)

Now if I try ordering Avatar again, I'm prompted that the stock is empty (for manager/supervisor views of the database, it will show as a negative number, and they'll be prompted of backorders)
![Image of screenshot7](/images/07.jpg)

**node bamazonManager.js:**

The Manager First sees options for viewing all products for sale, viewing low inventory, adding to inventory, or adding a new product:
![Image of screenshot8](/images/08.jpg)

If they select products for sale, they'll see how busy customers have been now (note that Avatar has 2 copies backordered...they will be alerted if selecting during low inventory):
![Image of screenshot9](/images/09.jpg)

If they select Titanic, the detailed description will read:
ID: 3 | Name: Titanic blu-ray | Department: movies | Price: $20 | Quantity: 2

Here are the items that have an inventory of less then 5:
![Image of screenshot10](/images/10.jpg)

If I select Avatar, I'll be prompted that 2 are backordered and that I should order more (also has validation that input must be number):
![Image of screenshot11](/images/11.jpg)

For the next menu item, I can input more quanitities for any item.  This is essentially like view low inventory, which had the ability to add to inventory as well.  I'll include a screenshot of several commands and prompts

The manager then has the option to add a new product.  If the new product has a new department, it will be updated to the departments database.  The manager will also be prompted that the supervisor will have to review and decide on the over head cost.
![Image of screenshot12](/images/12.jpg)

**node bamazonSupervisor.js:**

Here is evidence of my departments table dynamically inserting product_sales (furniture has 0 because the manager just added Danish table to products):
![Image of screenshot13](/images/13.jpg)

When the supervisor selects view product sales by department, they are notified of furniture being a new department, and see a table of each department:
![Image of screenshot14](/images/14.jpg)

When the supervisor selects create new department, they'll be prompted if what they entered has been used before:
![Image of screenshot15](/images/15.jpg)

When the supervisor selects visit a department's over head costs, they will get details and can change:
![Image of screenshot16](/images/16.jpg)

Finally, to make sure tables keep being updated.  The manager has added cutlery items to the new department, and customers have been buying in droves!  The supervisor now sees the new sales:
![Image of screenshot17](/images/17.jpg)

For future review of this project, I'd like the supervisor to also get a detailed view of the selected department's products as well.  I have been having problems getting a second cli-table to stay inline in the command prompt when it's being pushed from a mysql query.  I have tried one response using join inner department_name, but it was getting too complicated for the given time.

Note: after homework deadline, I was able to sleep on the solution for the supervisor CLI.  I've been able to get the detailed product table to be correctly rendered with the department view.  This is done by having an initial query with inner join of departments and products table (which is passed as "res").  The departments query is nested inside (as "response"), and department table is generated inside (as "table").  It appears new tables can correctly be displayed in the command prompt if they use saved objects instead of new queries.

