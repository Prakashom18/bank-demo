const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path"); // Added for path handling
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Helper to read users
function getUsers() {
  return JSON.parse(fs.readFileSync("users.json"));
}

// --- UPDATED ROOT ROUTE ---
// Serves the login page directly as the entry point
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// LOGIN (Vulnerable logic)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  
  const user = users.find(u => username == u.username && password == u.password);

  if(user){
    res.redirect(`/dashboard?user=${username}`);
  } else {
    res.status(401).send("Login Failed");
  }
});

// DASHBOARD
app.get("/dashboard", (req,res)=>{
  const userParam = req.query.user;
  const users = getUsers();
  const user = users.find(u => u.username == userParam);

  // Guard clause to prevent server crash if user isn't found
  if (!user) {
    return res.redirect("/");
  }

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
  const { to, amount } = req.body;
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

app.listen(3000,()=>console.log("Bank server running on http://localhost:3000"));