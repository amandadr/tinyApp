const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const getUserByEmail = (userData, email) => {
  const usersArr = Object.entries(userData);
  for (const user of usersArr) {
    if (user[1].email === email) {
      // user[1] represents the user object in the array [..., {id, email, pass}]
    
      return user[1];
    }
  }
  console.log('User not found');
  return undefined;
};

const getLongURL = (urlData, shortURL) => {
  return urlData[shortURL].longURL;
};

const urlsForUser = (urlData, id) => {
  const asArray = Object.entries(urlData);
  const result = asArray.filter(([key, obj]) => {
    if (obj.userID === id) {
      return obj;
    }
  });
  return Object.fromEntries(result);
};

const authorizeUser = (urlData, shortURL, user) => {
  // check id from users data against shortURL userID,
  return user.id === urlData[shortURL].userID;
};

module.exports = { generateRandomString, getUserByEmail, getLongURL,  urlsForUser, authorizeUser, };