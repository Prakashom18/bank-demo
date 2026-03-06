const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Helper to read users
function getUsers() {
  return JSON.parse(fs.readFileSync("users.json"));
}

// Helper to write users
function saveUsers(users) {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// LOGIN (SQL Injection vulnerable)
// Root route - redirect to login page
app.get("/", (req, res) => {
  res.redirect("/login.html");
});
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // vulnerable: simulates SQLi by doing string matching on JSON
  const users = getUsers();
  const user = users.find(u => username == u.username && password == u.password);

  if(user){
    res.redirect(`/dashboard?user=${username}`);
  } else {
    res.send("Login Failed");
  }
});

// DASHBOARD
app.get("/dashboard", (req,res)=>{
  const userParam = req.query.user;
  const users = getUsers();
  const user = users.find(u=>u.username==userParam);

  res.send(`
    <h1>Online Banking Dashboard</h1>
    <h3>Welcome ${user.username}</h3>
    <p>Balance: $${user.balance}</p>
    <a href="/transfer.html">Transfer Money</a><br><br>
    <a href="/profile?name=${user.username}">Profile</a>
  `);
});

// TRANSFER (CSRF vulnerable)
app.post("/transfer",(req,res)=>{
  const to = req.body.to;
  const amount = req.body.amount;
  res.send(`
    <h2>Transfer Successful</h2>
    <p>$${amount} sent to ${to}</p>
  `);
});

// PROFILE (XSS vulnerable)
app.get("/profile",(req,res)=>{
  const name = req.query.name;
  res.send(`
    <h1>Profile Page</h1>
    Welcome ${name}
  `);
});

app.listen(3000,()=>console.log("Bank server running on port 3000"));