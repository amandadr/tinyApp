const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/// DATA ///
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "010101"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "010101"
  },
};
// shortURL = urlDatabase[id]
// longURL = urlDatabase[shortURL].longURL
// userID = urlDatabase[shortURL].userID

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
const generateRandomString = () => { 
  return Math.random().toString(36).slice(2, 8); 
};

const getUserByEmail = (userData, email) => {
  const usersArr = Object.entries(userData);
  for (const user of usersArr) {
    if (user[1].email === email) {
      // user[1] represents the user object {id, email, pass}
      return user[1];
    };
  };
  console.log('User not found')
  return false;
};

const urlsForUser = (urlData, id) => {
  const asArray = Object.entries(urlData);
  const result = asArray.filter(([key, obj]) => {
    if (obj.id === id){
      return obj;
    }
  });
  return Object.fromEntries(result);
}


// CONST REFERENCE
// const user = req.cookies["user_id"];
// const userEmail = user.email;

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
  const user = req.cookies["user_id"];

  if (!user) {
    res.status(403).send("*Please login to see your shortened URLs*")
  } else {
    const templateVars = { urls: urlDatabase, user };
  
    res.render("urls_index", templateVars);
  }

});


// CREATE NEW URL
app.get("/urls/new", (req, res) => {
  const user = req.cookies["user_id"];

  const templateVars = {
    user
  };
  // redirect if not logged in
  if (!templateVars['user']) {
    res.redirect('/login')
  }
  res.render("urls_new", templateVars);
});
// recieve new shortURL
app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];

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
  const user = req.cookies["user_id"];
  const shortURL = req.params.id;

  const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };

  if (!user) {
    res.status(403).send("*Please login to see your shortened URL*");
  } else if (users[user] !== urlDatabase[shortURL].userID) {
    res.status(403).send("This one's not your's! Go make your own :)")
  } else if (!urlDatabase[shortURL]) {
    res.status(404).send("The short URL you're looking for doesn't exist :(")
  } else {
    res.render("urls_show", templateVars);
  }
});
// redirect from page
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});


//UPDATE
app.get('/urls/:id', (req, res) => {
  const user = req.cookies["user_id"];
  const shortURL = req.params.id;

  // extract the site to display
  const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };

  res.render("urls_show", templateVars);
});
// update post
app.post('/urls/:id', (req, res) => {
  //get the info input to through the form
  const { newURL } = req.body;
  //get shortURL
  const shortURL = req.params.id
  // update database
  urlDatabase[shortURL] = newURL;
  
  res.redirect(`/urls/${shortURL}`);
});


//DELETE
app.post('/urls/:id/delete', (req, res) => {
  const user = req.cookies["user_id"];

  // if authorized, extract the id we need to delete from the url of the request
  if (user) {
    const shortURL = req.params.id;
    
    delete urlDatabase[shortURL];
    
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});


// REGISTER
app.get("/register", (req, res) => {
  const user = req.cookies["user_id"];

  const templateVars = {
    users, user,
  };
  
  // redirect if logged in
  if (templateVars['user']) {
    res.redirect('/urls')
  }

  res.render("urls_register", templateVars);
});
// recieve newUser 
app.post("/register", (req, res) => {
  // generate a unique id to assign to each new key
  let id = generateRandomString();
  
  // pull user details from forms
  const { email, password } = req.body;
  const currentUser = getUserByEmail(users, email);

  // return broken request for empty forms or enrolled user
  if (!email || !password || currentUser !== false) {
    res.sendStatus(400);
  //or, add them to the database as a new user
  } else {
    users[id] = {
      id,
      email,
      password,
    };

    res.cookie('user_id', users[id])
  
    console.log("NEW USER CREATED", users[id].email);
  
    return res.redirect("/urls");
  }
});


//LOGIN
app.get('/login', (req, res) => {
  const user = req.cookies["user_id"];

  const templateVars = {
    users, user,
  };

  if (!user) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect('/urls')
  }
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const currentUser = getUserByEmail(users, email);
  // if currentUser isn't found
  if (currentUser === false || password !== currentUser.password) {
    res.status(403).send("WHO DO YOU THINK YOU ARE!?\n Go make sure you're registered.")
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