'use strict';




(function() {

    var waitCalls = 0;

    function showWait() {
        waitCalls++;
        if (waitCalls === 1) {
            $('.loader-frame').fadeIn();
        }
    }

    function hideWait() {
        waitCalls--;
        if (waitCalls === 0) {
            $('.loader-frame').fadeOut();
        }
    }


    angular.module('megabyte.books-club')

    .controller('BooksController', function($http, $timeout, $rootScope, $window, $controller) {


        var userController = $controller('UserController');


        var controller = this;
        controller.tab = 'all';
        controller.showLoader = 0;
        
        controller.findedBooks = [];
        
        controller.wantBooks = [];
        controller.myBooks = [];
        controller.allBooks = [];


        controller.newNameChanged = function() {


            if (controller.newName && (controller.newName.length > 2)) {

                showWait();
                $http.get('/api/book?newBookName=' + controller.newName).then(function(res) {

                    hideWait();
                    if (res.data && res.data.length) {
                        controller.findedBooks = res.data;
                    }

                }, hideWait);
            }
            else {
                controller.findedBooks = [];
            }

        }

        controller.deleteBook = function(book) {
            showWait();
            $http.delete('/api/book/'+book._id).then(function(res) {
                renewMyBooks();
                hideWait();

            }, hideWait);
        }
        
        controller.borrowBook = function(book) {
            if($rootScope.loggedIn) {
                showWait();
                $http.post('/api/book/'+book._id).then(function(res) {
                    renewAllBooks();
                    renewBooksIWant();
                    hideWait();
                }, hideWait);
            } else {
                userController.loginClick();
            }
        }
        
        controller.returnBook = function(book) {
           showWait();
           $http.get('/api/book/return/'+book._id).then(function(res) {
              renewAllBooks();
              renewBooksIWant();
              hideWait();
           }, hideWait);
        }
        
        controller.approveBook = function(book) {
           showWait();
           $http.get('/api/book/approve/'+book._id).then(function(res) {
              renewMyBooks();
              hideWait();
           }, hideWait);
        }
        
        controller.refuseBook = function(book) {
           showWait();
           $http.get('/api/book/refuse/'+book._id).then(function(res) {
              renewMyBooks();
              hideWait();
           }, hideWait);
        }
        
        
        
        


        function renewMyBooks() {
            if($rootScope.loggedIn) {
                showWait();
                $http.get('/api/book?myBooks=1').then(function(res) {
                    hideWait();
                    controller.myBooks = res.data;
                    controller.myBooks.sort(function(a,b){
                       if(a.borrowUserId){
                           if(!b.borrowUserId){
                                return -1;
                           } else {
                               
                               if(a.borrowApproved && !b.borrowApproved) {
                                   return 1;
                               } else if (!a.borrowApproved && b.borrowApproved) {
                                   return -1;
                               }
                               
                               
                           }
                       } else {
                           if(b.borrowUserId){
                               return 1;
                           }
                       }
                       return 0;
                    });
                    
                    controller.approvNeedCount = controller.myBooks.filter(function(b) {
                        return b.borrowUserId && !b.borrowApproved;
                    }).length;
                    
                    
                }, hideWait);
            }
        }
        
        function renewBooksIWant() {
            if($rootScope.loggedIn) {        
                showWait();
                $http.get('/api/book?booksIWant=1').then(function(res) {
                    hideWait();
                    controller.wantBooks = res.data;
                }, hideWait);
                
            }
        }
        
        $rootScope.$watch('[loggedIn]', function (newValue, oldValue) {
           if(newValue){
              renewMyBooks();
              renewBooksIWant();
           } else {
               controller.myBooks = [];
           }
        }, true);
        
        function renewAllBooks() {
            showWait();
            $http.get('/api/book').then(function(res) {
                hideWait();
                controller.allBooks = res.data;
            }, hideWait);
        }
        renewAllBooks();
        
        
        
        
        controller.clearSearch = function(){
            controller.findedBooks = [];
            controller.newName ='';
        }
        
        controller.clickFinded = function(item) {
            controller.findedBooks.splice(controller.findedBooks.indexOf(item), 1);
            
            showWait();
            $http.post('/api/book', {
                'id': item.id
            }).then(function(res) {
                renewMyBooks();
                hideWait();
            }, hideWait);
        }

       

    });


})();
