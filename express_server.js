const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000; //default

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

/// FUNCTIONS ///
function generateRandomString() {
  charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    let random = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(random, random + 1);
  }
  return randomString;
};

const getUserByEmail = (users, email) => {
  if (users.hasOwnProperty(email)) {
    return users[email];
  }
  console.log('User not found; will create new user...')
  return false;
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

// REGISTER
app.get("/register", (req, res) => {
  const templateVars = {
    users, user: req.cookies["user_id"]
  };

  res.render("urls_register", templateVars);
});
// recieve newUser 
app.post("/register", (req, res) => {
  // generate a unique id to assign to each new key
  let id = generateRandomString();
  // pull user details from forms
  const { email, password } = req.body;

  // return broken request for empty forms or enrolled user
  if (!email || !password || getUserByEmail(users, email) !== false) {
    res.sendStatus(400);
  } else {
    users[email] = {
      id,
      email,
      password,
    };

    res.cookie('user_id', getUserByEmail(users, email))
  
    console.log("NEW USER CREATED", getUserByEmail(users, email));
  
    return res.redirect("/urls");
  }
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
// update post
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
app.get('/login', (req, res) => {
  const templateVars = {
    users, user: req.cookies["user_id"]
  };

  res.render("urls_login", templateVars);
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const currentUser = getUserByEmail(users, email);
  // if currentUser isn't found
  if (!currentUser || password !== currentUser['password']) {
    res.status(403).send("WHO DO YOU THINK YOU ARE!?\n Make sure you're registered and your password is spelled correctly.")
  } else {
    res.cookie('user_id', currentUser)
    return res.redirect("/urls");
  }
})

//LOGOUT
app.post('/logout', (req, res) => {

  res.clearCookie('user_id');

  res.redirect('/login');
});


// listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});