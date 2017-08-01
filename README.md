I followed most of the homework, accept I thought Bamazon should be more like Amazon.  If a customer orders more then what's in stock, they'll be alerted to how many are backordered.  Further orders are prevented.  Included are examples of each interface:

#**node bamazonCustomer.js:**#

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