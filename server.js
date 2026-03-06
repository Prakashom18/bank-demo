const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new sqlite3.Database("bank.db");

// Create users table
db.run(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY,
username TEXT,
password TEXT,
balance INTEGER
)
`);

// Insert demo users
db.run("INSERT OR IGNORE INTO users VALUES(1,'admin','admin123',5000)");
db.run("INSERT OR IGNORE INTO users VALUES(2,'user','user123',3000)");


// LOGIN (SQL Injection vulnerable)
app.post("/login",(req,res)=>{

const username = req.body.username;
const password = req.body.password;

const query =
"SELECT * FROM users WHERE username='"+username+"' AND password='"+password+"'";

db.get(query,(err,row)=>{

if(row){

res.redirect(`/dashboard?user=${row.username}`);

}
else{

res.send("Login Failed");

}

});

});


// Dashboard page
app.get("/dashboard",(req,res)=>{

const user = req.query.user;

db.get("SELECT * FROM users WHERE username='"+user+"'",(err,row)=>{

res.send(`
<h1>Online Banking Dashboard</h1>

<h3>Welcome ${user}</h3>

<p>Account Balance: $${row.balance}</p>

<a href="/transfer.html">Transfer Money</a>

<br><br>

<a href="/profile?name=${user}">Profile</a>

`);

});

});


// Transfer (CSRF vulnerable)
app.post("/transfer",(req,res)=>{

const to = req.body.to;
const amount = req.body.amount;

res.send(`
<h2>Transfer Successful</h2>
<p>$${amount} sent to ${to}</p>
`);

});


// Profile (XSS vulnerable)
app.get("/profile",(req,res)=>{

const name = req.query.name;

res.send(`
<h1>Profile</h1>
Welcome ${name}
`);

});


app.listen(3000,()=>{

console.log("Bank server running on port 3000");

});