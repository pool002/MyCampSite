/* 
This is a class which inherits the builtin Error Class of JS.
It takes 2 optional parameters and after calling super(), it makes
the statusCode and message available in this class.
Whenever a new instance of this class is created it calls the default
error handler class in our index.js which in turn sets the statusCode and
displays the error message. 

Usage: throw new customError(404,'Couldn't find what you were looking for');
*/

class customError extends Error {
    constructor(statusCode, message) {      //Call this function with 2 params
        super();                            //Calling Parent i.e. Error class
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = customError;