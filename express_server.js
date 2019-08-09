const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const { getEmailbyID, getIDbyEmail, urlsForUser, emailChecker, numberOfVisitors, getTimeAndIDbyURL, generateRandomString, urlChecker } = require("./helper");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["secret keys", "hello"],
  maxAge: 24 * 60 * 60 * 1000
}));
app.set("view engine", "ejs");
app.use(methodOverride('_method'));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
};

const visits = {
  "Thu Aug 08 2019 20:50:43 GMT+0000 (UTC)": {
    id: "exampleUserID",
    timestamp: "Thu Aug 08 2019 20:50:43 GMT+0000 (UTC)",
    shortURL: "b6UTxQ"
  }
};

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
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
  if (req.session.user_id) {
    let templateVars = {  username: getEmailbyID(req.session.user_id, users), urls: urlsForUser(req.session.user_id, urlDatabase) };
    res.render("urls_index", templateVars);
  } else {
    res.send("Please go back and Login or Register");
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {  username: getEmailbyID(req.session.user_id, users) };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlChecker(req.params.shortURL, urlDatabase) === false) {
    return res.send("Could not find URL");
  }
  let longURL = urlDatabase[req.params.shortURL]["longURL"];
  let currentTime = Date().toLocaleString();
  visits[currentTime] = {
    "id": req.session.user_id,
    "timestamp": currentTime,
    "shortURL": req.params.shortURL };
  if (urlDatabase[req.params.shortURL]["tracker"]) {
    urlDatabase[req.params.shortURL]["tracker"]++;
  } else {
    urlDatabase[req.params.shortURL]["tracker"] = 1;
  }
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlChecker(req.params.shortURL, urlDatabase) === false) {
    return res.send("Could not find URL");
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL]["userID"] && urlDatabase[req.params.shortURL]["userID"]!== "aJ48lW") {
    return res.send("You do not have permission to view this");
  }
  let numVisitors = numberOfVisitors(req.params.shortURL, visits);
  let timeIdObj = getTimeAndIDbyURL(req.params.shortURL, visits);
  let templateVars = { username: getEmailbyID(req.session.user_id, users), shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"], tracks: urlDatabase[req.params.shortURL]["tracker"],
    uniqueVisits : numVisitors, timestamps: timeIdObj };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  for (let key in urlDatabase) {
    if (urlDatabase[key]["longURL"] === req.body.longURL && req.session.user_id === urlDatabase[key]["userID"]) {
      res.redirect(`/urls`);
      return;
    }
  }
  urlDatabase[shortURL] = { longURL: req.body['longURL'], userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});


app.delete("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.send("Please go back and Login or Register");
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL]["userID"] && urlDatabase[req.params.shortURL]["userID"]!== "aJ48lW") {
    res.send("You do not have permission to view this");
  }
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/redir", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.put("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.send("Please go back and Login or Register");
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL]["userID"] && urlDatabase[req.params.shortURL]["userID"]!== "aJ48lW") {
    res.send("You do not have permission to view this");
  }
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    urlDatabase[req.params.shortURL].longURL = req.body['longURL'];
  }
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect("/urls");
  }
  let templateVars = {  username: getEmailbyID(req.session.user_id, users) };
  res.render('urls_login', templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/new");
});

app.get("/register", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect("/urls");
  }
  let templateVars = {  username: getEmailbyID(req.session.user_id, users) };
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  if (emailChecker(req.body.email, users) === false) {
    res.status(400);
    return res.send("email already exists");
  } else if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    return res.send("Please enter a valid email and password");
  }
  let userID = generateRandomString();
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {"id": userID,
    "email": req.body.email,
    "password": hashedPassword };
  req.session.user_id = userID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userID = getIDbyEmail(req.body.email, users);
  if (!emailChecker(req.body.email, users) && bcrypt.compareSync(req.body.password, users[userID]['password'])) {
    req.session.user_id = userID;
    return res.redirect("/urls");
  }
  res.status(403);
  return res.send("wrong email or password");
});