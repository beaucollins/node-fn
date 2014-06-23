
module.exports = {
  arglock: arglock,
  when: when,
  counts: counts,
  debounce: debounce,
  times: times,
  rateLimit: rateLimit
};

/****************************

when(check, fn, args ...)

returns a function that will only be called when `check()` returns true.
Additional argrument are used in the returned function.

check - function to determine if `fn` should be called
fn - function to be called if `check` returns true
args - arguments to be used when `fn` is called

returns function

Example

    var doLog = false;
        toggle = function() { doLog = !doLog; return doLog; };
        logEveryOther = fn.when(toggle, console.log.bind(console), 'Hello World');

logEveryOther('boom');

// => 'Hello World', 'boom'

logEveryOther('bam');

// < silence >

logEveryOther('foo', 'bar');

// => 'Hello World', 'foo', 'bar'


*****************************/
function when(check, fn){

  var args = [].slice.call(arguments, 2);

  return function(){
    if (check()) return fn.apply(this, args.concat([].slice.call(arguments)));
  };

}

/****************************
debounce(every, fn, args ...)

Perform a function every `n` times. Additional arguments are applied to `fn` when called. 

every - number of times to call function before firing `fn`
fn - function to be called after `every` n times.
args - additinal args to be applied to `fn` when called

Example:

  var logEvery4 = fn.debounce(5, console.log.bind(console), "Log!");

  logEvery4('Hi');
  => < silence > 
  
  logEvery4('Hi');
  => < silence > 
  
  logEvery4('Hi');
  => < silence > 
  
  logEvery4('Hi');
  => "Log!", "Hi"

****************************/
function debounce(every, fn){

  var args = [].slice.call(arguments, 2),
      count = 0,
      debouncer = function(){
        count ++;
        return count % every === 0;
      };

  return when.apply(this, [debouncer, fn].concat(args));
}

/****************************
counts(times, fn, args ...)

Returned function will execute a maximum of `times`.

times - number of times `fn` can be executed
fn - function to be called
args - applied to `fn` when called

Example:

  var log = fn.counts(2, console.log.bind(console), 'Hello');

  log('World!);
  // => 'Hello', 'World!'
  
  log('Everyone');
  // => 'Hello', 'Everyone'
  
  log('World!);
  // => <silence>
  
****************************/
function counts(times, fn){

  var args = [].slice.call(arguments, 2),
    count = 0,
    counter = function(){
      if (count == times) return true;
      count ++;
      return false;
    };

  return when.apply(this, [counter, fn].concat(args));

}

/***************************
arglock(fn, args ...)

Returns function that will have `args` applied when called.

Example:

  var log = fn.arglock(console.log.bind(console), 'Test');

  log('1');
  => 'Test', '1'

***************************/
function arglock(){
  var slice = [].slice,
      args = slice.apply(arguments);

  if (args.length === 0 || typeof(args[0]) != 'function') throw new Error("first argument must be a function");

  var fn = args.shift();

  return function(){
    return fn.apply(this, args.concat(slice.apply(arguments)));
  };
}

/***************************
times(count, fn, args ...)

Returns a function that will execute `fn` `count` times with `args` applied.

count - number fo times to call `fn`
fn - callback to be execuited
args - arguments to be applied to `fn` when called

Example:

  var log = fn.times(3, console.log.bind(console), 'Hello');

  log('World!);
  => 'Hello', 'World!'
  => 'Hello', 'World!'
  => 'Hello', 'World!'


***************************/
function times(count, fn){

  var args = [].slice.call(arguments, 2),
      multiplied = function(){
        var results = [];
        for (var i = 0; i < count; i++) {
          results.push(fn.apply(this, args));
        }
        return results;
      };

  return multiplied;

}

/**************************
rateLimit(wait, fn, args);

Returns a function that will only execute `fn` after waiting `wait` milliseconds
since the last time called.

wait - number of milliseconds to wait
fn - function to call after waiting `wait` milliseconds
args - arguments to apply to `fn` when called

returns function - sets timeout when called that waits `wait` milliseconds to call `fn` and 
        returns a function that cancels the timeout when called.

Example:

  var log = fn.rateLimit(100, console.log.bind(console), 'Hello'),
      cancel = log('World!');
  
  // after 100 ms unless `cancel` is called
  // => 'Hello', 'World!'


**************************/
function rateLimit(wait, fn) {

  var clear,
      limited = function() {
        if (clear) clear();

        var args = arguments,
        timeoutId = setTimeout(function(){
          fn.apply(this, args);
        }, wait);

        clear = function() {
          clearTimeout(timeoutId);
        };

        return clear;

      };

  return limited;

}