const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/// DATA ///
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

/// FUCNTIONS ///
function generateRandomString() {
  charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    let random = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(random, random + 1);
  }
  return randomString;
};

// homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});
// display json object containing urls
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// hello test (prints hello world(bold))
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// READ - display the form
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };

  res.render("urls_index", templateVars);
});

// CREATE - add a new shortened url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// recieve new ID
// (triggers when form is submitted)
app.post("/urls", (req, res) => {
  // generate a unique id to assign to each new key
  let newID = generateRandomString();

  urlDatabase[`${newID}`] = req.body.longURL;

  res.redirect(`/urls/${newID}`);
});

// register
app.get("/register", (req, res) => {
    const templateVars = {
      user: req.cookies["user_id"]
    };

    res.render("urls_register", templateVars);
});
// recieve newUser 
app.post("/register", (req, res) => {
  // generate a unique id to assign to each new key
  // const email = req.body.email;
  // const password = req.body.password;
  const { email, password } = req.body;
  let id = generateRandomString();

  users[id] = {
    id,
    email,
    password,
  };

  res.cookie('user_id', users[id])

  res.redirect(`/urls`);
});


// display specific url
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies["user_id"] };

  res.render("urls_show", templateVars);
});
// redirect from specific display page
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  res.redirect(longURL);
});

//UPDATE
app.get('/urls/:id', (req, res) => {
  // extract the site to display
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies["user_id"] };

  res.render("urls_show", templateVars);
});
// trigger a post
app.post('/urls/:id', (req, res) => {
  //get the info input to through the form
  const { newURL } = req.body;
  //get id
  const id = req.params.id
  // update database
  urlDatabase[id] = newURL;

  res.redirect(`/urls/${id}`);
});

//DELETE
app.post('/urls/:id/delete', (req, res) => {
  // extract the id we need to delete from the url of the request
  const id = req.params.id;

  delete urlDatabase[id];

  res.redirect('/urls');
});

//LOGIN
app.post('/login', (req, res) => {
  const userInput = req.body['username'];
  
  res.cookie('username', userInput)

  
  res.redirect('/urls');
});

//LOGOUT
app.post('/logout', (req, res) => {
  
  res.clearCookie('username');

  
  res.redirect('/urls');
});


// listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});