const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];

const isValid = (username)=>{ //returns boolean
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let user = users.filter((user) => {
    return user.username == username && user.password == password;
  });
  if(user.length > 0) {
    return true;
  }else {
    return false;
  }
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  let { username, password } = req.body;
  if(username && password) {
    if(authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
        data: username,
      }, 'access', {expiresIn: 60 * 60}
      );
      req.session.authorization = {
        accessToken, password
      }
      return res.status(200).send({message: "user logged in successfully"});
    }else {
      return res.status(401).json({message: "user not authenticated"});
    }
  }
  return res.status(401).json({message: "Error login: lost username or password"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  let isbn = req.params.isbn;
  // this is getting the username from the session
  let username = req.user.data;
  // get review from the query
  let review = req.query.review;
  // get the book from the booksdb
  let book = books[isbn];
  if(book) {
    // if the user has already reviewed the book, then update the review
    // if the user has not reviewed the book, then add the review
    book["reviews"][username] = review;
    console.log(book["reviews"]);
    return res.status(200).json({message: "review added successfully"});
  }
  return res.status(300).json({message: "Error: isbn not found"});
});

// delete a user's review to a book
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // first get the book details
  let book = books[req.params.isbn];
  if(book){
    // get the username from the session
    let username = req.user.data;
    // check if the user has already reviewed the book
    if(book["reviews"][username]) {
      // if the user has reviewed the book, then delete the review
      delete book["reviews"][username];
      return res.status(200).json({message: "review deleted successfully"});
    }else {
      return res.status(401).json({message: "Error: user has not reviewed the book"});
    }
  }else {
    return res.send(401).json({message: "Error: isbn not found"});
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
