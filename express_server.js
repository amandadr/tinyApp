const express = require("express");
const app = express();
const PORT = 8080; //default

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = { urls: urlDatabase };

  res.render("urls_index", templateVars);
});

// CREATE - add a new shortened url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// recieve
// (triggers when form is submitted)
app.post("/urls", (req, res) => {
  // generate a unique id to assign to each new key
  let newID = generateRandomString();

  urlDatabase[`${newID}`] = req.body.longURL;

  res.redirect(`/urls/${newID}`);
});

// display specific url
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };

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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);
});
// trigger a post
app.post('/urls/:id', (req, res) => {
  //get the info input to through the form
  const { newURL } = req.body;
  //get id
  const id = req.params.id

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
  const userInput = req.body.username;

  res.cookie('username', userInput)

  res.redirect('/urls');
});


// listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});