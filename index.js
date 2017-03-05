//Utilities
function pad(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}
function def(x) {
  return typeof x !== 'undefined';
}
function fallback(x,y) {
  return def(x) ? x : y;
}
function nullFallback(x,y) {
  if (def(x) && x !== null) {
    return x;
  }
  return y;
}
function err(error) {
  if (error.constructor === Error
  	|| error.constructor === SyntaxError
  	|| error.constructor === EvalError
  	|| error.constructor === RangeError
  	|| error.constructor === ReferenceError
  	|| error.constructor === TypeError
  	|| error.constructor === URIError
  ) {
    return error;
  }else {
    var data = error.data;
    if (def(data)) {
      var error1 = geterr(data);
      if (def(error1)) {
        return error1
      }else {
        try {
          var parsedData = JSON.parse(data);
        } catch(error2) {
          return err(data.toString());
        }
        var parsedError = geterr(parsedData);
        if (def(parsedError)) {
          return parsedError;
        }else {
          return err(data.toString());
        }
      }
    }else if (def(error.message)) {
      return Error(error.message.toString());
    }else {
      return Error(error.toString());
    }
  }
}
function errstr(error) {
  return err(error).message;
}
function errdict(error) {
  return {error:errstr(error)};
}
function geterr(data) {
  var str = (def(data.errors) && data.errors.length > 0) ? data.errors[0] : data.error;
  if (def(str) && def(str.message)) {
    str = str.message;
  }
  return !def(str) ? undefined : err(str);
}
function projf() {
  var args = Array.prototype.slice.call(arguments);
  var f = args[0];
  var globalArray = args.slice(1);
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var array = globalArray.slice();
    for (var i=0; i<array.length; i+=1) {
      if (!def(array[i])) {
        array[i] = args.shift();
      }
    }
    array = array.concat(args);
    return f.apply(this,array);
  }
}
function projff() {
  var args = Array.prototype.slice.call(arguments);
  var f = args[0];
  var globalArray = args.slice(1);
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var array = globalArray.map(function(x){ return def(x) ? x() : undefined});
    for (var i=0; i<array.length; i+=1) {
      if (!def(array[i])) {
        array[i] = args.shift();
      }
    }
    array = array.concat(args);
    return f.apply(this,array);
  }
}
//Concurrency Utilities
function Maybe() {
  var res = undefined;
  var rej = undefined;
  this.promise = new Promise(function(rs,rj) {
    res = rs;
    rej = rj;
  });
  this.resolve = res;
  this.reject = rej;
}
//Object Utilities
function mutate(object,newValues) {
  var copy = {};
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      if (!def(newValues[property])) {
        copy[property] = object[property];
      }
    }
  }
  for (var property in newValues) {
    if (newValues.hasOwnProperty(property)) {
      copy[property] = newValues[property];
    }
  }
  return copy;
}
function remove(object,key) {
  var keys = (key.constructor === Array) ? key : [key];
  var copy = {};
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      if (keys.indexOf(property) === -1) {
        copy[property] = object[property];
      }
    }
  }
  return copy;
}
function rotate(array,amount) {
  while (amount < 0) {
    amount += array.length;
  }
  if (amount > 0) {
    amount = amount % array.length;
    var first = array.slice(0,amount);
    var second = array.slice(amount);
    return second.concat(first);
  }else {
    return array;
  }
}
function loop(object,f) {
  var result = new Array();
  if (object.constructor === Array) {
    for (var i = 0; i < object.length; i += 1) {
      result.push(f(i,object[i]));
    }
  } else {
    for (var prop in object) {
      if(!object.hasOwnProperty(prop)) continue;
      result.push(f(prop,object[prop]));
    }
  }
  return result;
}
//Front End Utilities
var defaults = {
  areAvailable: function() {
    return def(Storage);
  },
  useCache: true,
  "set": function(key, value) {
    localStorage.setItem(key,value);
    if (this.useCache) {
      this.cache[key] = value;
    }
  },
  "get": function(key) {
    return fallback(this.cache[key],localStorage.getItem(key));
  },
  "remove": function(key) {
    localStorage.removeItem(key);
    delete this.cache[key];
  }, 
  "cache": {}
}

module.exports = {
//Utilities
	pad,
	def,
	fallback,
  nullFallback,
	err,
	errstr,
	errdict,
	geterr,
	projf,
	projff,
//Concurrency Utilities
  Maybe,
//Object Utilities
	mutate,
	remove,
	rotate,
  loop,
//Front End Utilities
  defaults
//
};