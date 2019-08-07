const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {  username: getEmailbyID(req.cookies["userID"]), urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["userID"]) {
  let templateVars = {  username: getEmailbyID(req.cookies["userID"]) }
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: getEmailbyID(req.cookies["userID"]), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  for (let key in urlDatabase) {
    if (urlDatabase[key] === req.body.longURL) {
      res.redirect(`/urls`)
      return
    }
  }
  urlDatabase[shortURL] = { longURL: req.body['longURL'], userID: req.cookies["userID"] }
  console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
 delete urlDatabase[req.params.shortURL]
 res.redirect("/urls")
})

app.post("/urls/:shortURL/redir", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`)
})

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body['longURL']
  res.redirect(`/urls`)
})

app.get("/login", (req, res) => {
  let templateVars = {  username: getEmailbyID(req.cookies["userID"]) }
  res.render('urls_login', templateVars)
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID")
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  let templateVars = {  username: getEmailbyID(req.cookies["userID"]) }
  res.render('urls_register', templateVars)
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === ""|| emailChecker(req.body.email) === false) {
    res.status(400)
    return res.send("email already exists")
  }
  let userID = generateRandomString()
  users[userID] = {"id": userID, 
                  "email": req.body.email,
                  "password": req.body.password }
  res.cookie("userID", userID)
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
 if (!emailChecker(req.body.email) && passwordChecker(req.body.password)) {
   let userID = getIDbyEmail(req.body.email)
  res.cookie("userID", userID)
   return res.redirect("/urls")
 }
 res.status(403)
 return res.send("wrong email or password")
})

function generateRandomString() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 7; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function emailChecker(email) {
  for (let key in users) {
    if (users[key]["email"] === email) {
      return false
    }
  } return true
}

function passwordChecker(password) {
  for (let key in users) {
    if (users[key]["password"] === password) {
      return true
    }
  } return false
}

function getEmailbyID (userID) {
  if(userID && users[userID]){
    console.log("User Found")
    return users[userID]["email"]
  }else {
    return null
  }
}

function getIDbyEmail (userEmail) {
  for (let key in users) {
    if (users[key]["email"] === userEmail) {
      return users[key]["id"]
    }
  }
}