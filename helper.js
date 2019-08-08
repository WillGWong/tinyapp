function getEmailbyID(userID, userList) {
  if (userID && userList[userID]) {
    return userList[userID]["email"];
  } else {
    return null;
  }
}

function getIDbyEmail(userEmail, userList) {
  for (let key in userList) {
    if (userList[key]["email"] === userEmail) {
      return userList[key]["id"];
    }
  } return null;
}

function urlsForUser(id, urlList) {
  let resultObj = {};
  for (let key in urlList) {
    if (urlList[key]["userID"] === id || urlList[key]["userID"] === "aJ48lW") {
      resultObj[key] = urlList[key]["longURL"];
    }
  }
  return resultObj;
}

function emailChecker(email, userList) {
  for (let key in userList) {
    if (userList[key]["email"] === email) {
      return false;
    }
  } return true;
}

function numberOfVisitors(shortURL, database) {
  let resultObj = {};
  let count = 0;
  for (let key in database) {
    if (database[key]["shortURL"] === shortURL) {
      resultObj[database[key]["id"]] = 1;
    }
  }
  for (let key in resultObj) {
    count ++;
  }
  return count;
}

function getTimeAndIDbyURL(shortURL, database) {
  let resultObj = {};
  for (let key in database) {
    if (database[key]["shortURL"] === shortURL) {
      resultObj[database[key]["timestamp"]] = {time: database[key]["timestamp"], userID: database[key]["id"]};
    }
  }
  return resultObj;
}

function generateRandomString() {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = { getEmailbyID, getIDbyEmail, urlsForUser, emailChecker, numberOfVisitors, getTimeAndIDbyURL, generateRandomString };