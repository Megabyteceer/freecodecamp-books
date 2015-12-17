'use strict';

var Book = require('../models/book.js');
//var Wanting = require('../models/wanting.js');

var oauthSignature = require("oauth-signature");
var https = require("https");
var querystring = require("querystring");

var apiKey = process.env.GOOGLE_BOOKS_API_KEY;

function BooksHandler () {
	
	
	
	
	this.getBooks = function (req, res) {
	

			if (req.query.newBookName) {
				//find books by google API
				var options = {	
				  hostname: 'www.googleapis.com',
				  port: 443,
				  path: '/books/v1/volumes?fields=items/volumeInfo/title,items/volumeInfo/imageLinks/thumbnail,items/volumeInfo/authors,items/id&langRestrict=en&key='+apiKey+'&q='+encodeURIComponent('intitle:"'+req.query.newBookName+'"'),
				  method: 'GET'
				};
				var reqs = https.request(options, function(r) {
				
				  var data = '';
					
				  r.on('data', function(d) {
				    data+= d;
				  });
				  
				  r.on('end', function(){
				    var ret = [];
				    data = JSON.parse(data);
				    if(data.items){
						data.items.forEach(function(b){
							
							if (b.volumeInfo.imageLinks) {
								var o = {'id':b.id, 'title':b.volumeInfo.title};
								
								o.img = b.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://');
							
								if(b.volumeInfo.authors){
									o.authors = b.volumeInfo.authors.join(',');
								} 
								ret.push(o)
							}
						});
						res.json(ret);
				    } else {
				    	res.end();
				    }
				  });
				});
				reqs.end();
				reqs.on('error', function(e) {
				  throw e;
				});	
			} else if (req.query.myBooks) {
				//get my boks
				Book.find({'userId':req.user.id}).
				  exec(function(err, books){
				  	if(err)	{
				  		res.end(err)
				  	} else {
			  			res.json(books);
				  	}
				  });
			} else if (req.query.booksIWant) {
				//get boks i want
				Book.find({'borrowUserId':req.user.id}).
				  exec(function(err, books){
				  	if(err)	{
				  		res.end(err)
				  	} else {
			  			res.json(books);
				  	}
				  });
			} else {
				//get all books
				var q={'borrowUserId':null};
				if(req.user){
					q.userId = {'$ne':req.user.id};
				}
				
				
				
				Book.find(q).
				  exec(function(err, books){
				  	if(err)	{
				  		res.end(err)
				  	} else {
			  			res.json(books);
				  	}
				  });
			}
	};
	
	
	
	this.postBook = function(req, res) {
		
		var bookId = req.body.id.replace('/','').replace('?','');

			var options = {
				  hostname: 'www.googleapis.com',
				  port: 443,
				  path: '/books/v1/volumes/'+bookId+'?fields=volumeInfo/title,volumeInfo/imageLinks/thumbnail,volumeInfo/authors&key='+apiKey,
				  method: 'GET'
				};
				var reqs = https.request(options, function(r) {
				
				  var data = '';
					
				  r.on('data', function(d) {
				    data+= d;
				  });
				  
				  r.on('end', function() {
				    
				    data = JSON.parse(data);
				   
				   var book = new Book();
				   
				   book.title  = data.volumeInfo.title;
				   book.userId  = req.user.id;
				   if(data.volumeInfo.authors){
					 book.author = data.volumeInfo.authors.join(',');
				   } 
				   if (data.volumeInfo.imageLinks) {
					 book.imgUrl = data.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://');
				   }
				   
				   book.save();

				   res.end();
		
				    
				  });
				  
				});
				
				reqs.end();
				
				reqs.on('error', function(e) {
				  throw e;
				});	
	}
	
	
	this.borrowBook = function(req, res){
		Book.findOne({'_id':req.params.id}).
		  exec(function(err, book){
		  	if(err)	{
		 		res.end(err)
		  	} else {
		  		if(book.borrowUserId){
		  			res.end('Book already borrowed.');
		  		}
		  		
				book.borrowUserId = req.user.id;
				book.borrowUserName = req.user.displayName;
				book.borrowApproved = false;
				book.save();
				res.end();
			}
		  });
	}
	
	this.returnBook = function(req, res){
		Book.findOne({'_id':req.params.id}).
		  exec(function(err, book){
		  	if(err)	{
		 		res.end(err)
		  	} else {
		  		if(book.borrowUserId != req.user.id){
		  			res.end('You not borrowed this book.');
		  		} else {
		  		
					book.borrowUserId = null;
					book.borrowUserName = null;
					book.borrowApproved = false;
					book.save();
					res.end();
		  		}
			}
		  });
	}
	
	this.refuseBook = function(req, res){
		Book.findOne({'_id':req.params.id}).
		  exec(function(err, book){
		  	if(err)	{
		 		res.end(err)
		  	} else {
		  		if(book.userId != req.user.id){
		  			res.end('Access denied.');
		  		} else {
		  		
					book.borrowUserId = null;
					book.borrowUserName = null;
					book.borrowApproved = false;
					book.save();
					res.end();
		  		}
			}
		  });
	}
	
	
	this.approveBook = function(req, res){
		Book.findOne({'_id':req.params.id}).
		  exec(function(err, book){
		  	if(err)	{
		 		res.end(err)
		  	} else {
		  		if(book.userId != req.user.id){
		  			res.end('Access denied.');
		  		} else {
					book.borrowApproved = true;
					book.save();
					res.end();
		  		}
			}
		  });
	}
	
	
	
	
	
	this.deleteBook = function(req, res) {
		
		
		Book.findOne({'_id':req.params.id, 'userId':req.user.id}).
				  exec(function(err, book){
				  	if(err)	{
				  		res.end(err)
				  	} else {
			  			book.remove();
			  			res.end();
				  	}
				  });
		
		
	}
	
	

}

module.exports = BooksHandler;
