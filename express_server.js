/// SETUP ///
const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['super', 'secret'],
}))

/// HELPERS ///
const { generateRandomString, getUserByEmail, getLongURL, urlsForUser, authorizeUser } = require('./helpers');

/// DATA ///
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "010101"
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
};

/******/////// GET READY... ///////*****/

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

/********//////////// THE MEAT ///////////////*******/

// INDEX
app.get("/urls", (req, res) => {
  const user = req.session.user_id;

  if (!user) {
    res.status(403).send("*Please login to see your shortened URLs*")
  } else {
    const templateVars = { urls: urlsForUser(urlDatabase, user.id), user };

    res.render("urls_index", templateVars);
  }

});


// CREATE NEW URL
app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  
  const templateVars = {
    user
  };
  // redirect if not logged in
  if (!templateVars['user']) {
    res.redirect('/login')
  }
  res.render("urls_new", templateVars);
});

// ADD new shortURL
app.post("/urls", (req, res) => {
  const user = req.session.user_id;

  if (!user) {
    res.status(403).send("Gotta log in dude.");
  } else {
    // generate a unique id to assign to each new shortURL
    let newShortURL = generateRandomString();
  
    urlDatabase[`${newShortURL}`] = { longURL: req.body.longURL, userID: user.id };

    res.redirect(`/urls/${newShortURL}`);
  }
});


// SHOW (specific url)
app.get("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.id;

  const templateVars = { shortURL, longURL: getLongURL(urlDatabase, shortURL), user };

  if (!user) {
    res.status(403).send("*Please login to see your shortened URL*");
  } else if (!authorizeUser(urlDatabase, shortURL, user)) {
    res.status(403).send("This one's not your's! Go make your own :)")
  } else if (!urlDatabase[shortURL]) {
    res.status(404).send("The short URL you're looking for doesn't exist :(")
  } else {
    res.render("urls_show", templateVars);
  }
});


// REDIRECT from show page
app.get("/u/:id", (req, res) => {
  const longURL = getLongURL(urlDatabase, req.params.id);

  res.redirect(longURL);
});

// UPDATE /edit longURL
app.post('/urls/:id', (req, res) => {
  const newLongURL = req.body;
  const shortURL = req.params.id;
  const user = req.session.user_id;

  if (!authorizeUser(urlDatabase, shortURL, user)) {
    res.status(403).send("This one's not your's! Go make your own :)");
  } else {
    // update database
    urlDatabase[shortURL].longURL = newLongURL.newLongURL;
    console.log(urlDatabase)
    
    res.redirect(`/urls/${shortURL}`);
  }
});


//DELETE
app.post('/urls/:id/delete', (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.id;

  if (!shortURL) {
    res.status(404).send("shortURL not found - nothing to delete!")
  } else if (!user) {
    res.status(403).send("*Please login to modify your shortened URLs*");
  } else if (!authorizeUser(urlDatabase, shortURL, user)) {
    res.status(403).send("This one's not your's! Go make your own :)");
  } else {
    delete urlDatabase[shortURL];
    
    res.redirect('/urls');
  }
});


// REGISTER
app.get("/register", (req, res) => {
  const user = req.session.user_id;

  const templateVars = {
    users, user,
  };
  
  // redirect if logged in
  if (templateVars['user']) {
    res.redirect('/urls')
  } else {
    res.render("urls_register", templateVars);
  }
});

// ADD newUser, w/ hashed password
app.post("/register", (req, res) => {
  // pull user details from forms
  const { email, password } = req.body;
  const currentUser = getUserByEmail(users, email);
  // generate a unique id to assign to each new key
  const id = generateRandomString();
  
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  // return broken request for empty forms or enrolled user
  if (!email || !password || currentUser !== undefined) {
    res.sendStatus(400);
  // or, add them to the database as a new user
  } else {
    users[id] = {
      id,
      email,
      password: hash
    };

    // SET cookie,
    req.session.user_id = users[id];
  
    console.log("NEW USER CREATED", users[id].email);
  
    return res.redirect("/urls");
  }
});


// LOGIN
app.get('/login', (req, res) => {
  const user = req.session.user_id;

  const templateVars = {
    users, user,
  };

  if (!user) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect('/urls')
  }
});

// ADD currentUser (just logged in)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const currentUser = getUserByEmail(users, email);
  const comparePasswords = bcrypt.compareSync(password, currentUser.password);
  // if currentUser isn't found
  if (currentUser === undefined || !comparePasswords) {
    res.status(403).send("WHO DO YOU THINK YOU ARE!?\n Go make sure you're registered.")
  } else {
    req.session.user_id = currentUser;
    return res.redirect("/urls");
  }
})


// LOGOUT
app.post('/logout', (req, res) => {

  req.session = null;

  res.redirect('/login');
});


// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});