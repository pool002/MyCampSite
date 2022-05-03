/*
This is a function that takes a Function as input and also returns a function.
The usage of this function is to wrap all our async functions in such a way, that
if an ERROR occurs anywhere in the body of the function, the promise is REJECTED
and we can catch the error and pass it to next() which in turn calls the error
handler in our index file. 
*/

function wrapper(func){ 
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};

module.exports = wrapper;