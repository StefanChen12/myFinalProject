const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const fs = require('fs');

// check if user exists
const userExists = (username) => {
  let user = [];
  user = users.filter((user) => {
    return user.username == username;
  })
  if(user.length > 0) {
    return true;
  }else {
    return false;
  }
}

// use promise to get books(task 14)
let readingBooks = new Promise((res, rej) => {
  setTimeout(() => {
    res(books);
  }, 1000);
});

// register a new user
public_users.post("/register", (req,res) => {
  //Write your code here
  let { username, password } = req.body;
  if(username && password) {
    if(!userExists(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "user registered successfully"});
    }else{
      return res.status(401).json({message: "user already exists"});
    }
  }
  return res.status(401).json({message: "cannot register"});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  //Write your code here
  readingBooks.then((data) => {
    return res.status(200).send(JSON.stringify(data, null, 2));
  }).catch((err) => {
    return res.status(401).json({message: "Error reading file"});
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // get isbn from the params
  let isbn = req.params.isbn;
  readingBooks.then((data) => {
    let book = data[isbn];
    if(book) {
      return res.status(200).send(JSON.stringify(book, null, 2));
    } else {
      return res.status(404).json({message: "Book not found"});
    }
  })
  .catch((err) => {
    return res.status(401).json({message: "Error reading file"});
  });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  // look for all objects and see if any of then has the same auther name
  let author = req.params.author;
  let book = [];
  readingBooks.then((data) => {
    for(let i in data) {
      if(data[i].author == author) {
        book.push(books[i]);
      }
    }
    if(book.length > 0) {
      return res.status(200).send(JSON.stringify(book, null, 2));
    } else {
      return res.status(401).json({message: "Book not found"});
    }
  }).catch((err) => {
    return res.status(401).json({message: "Error reading file"});
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  let title = req.params.title;
  let book = "";
  readingBooks.then((data) => {
    for(let i in data) {
      if(data[i].title == title) {
        book = data[i];
        break;
      }
    }
    if(book) {
      return res.status(200).send(JSON.stringify(book, null, 2));
    }
    return res.status(300).json({message: "no book found"});
  }).catch((err) => {
    res.status(401).json({message: "Error reading file"});
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  let book = books[isbn];
  if(book) {
    return res.status(200).send(book.reviews);
  }
  return res.status(401).json({message: "no book found"});
});

module.exports.general = public_users;
module.exports.userExists = userExists;