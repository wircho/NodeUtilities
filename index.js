module.exports = {
//Utilities
	pad: function(num, size) {
	  var s = num+"";
	  while (s.length < size) s = "0" + s;
	  return s;
	},
	def: function(x) {
	  return typeof x !== 'undefined';
	},
	fallback: function(x,y) {
	  return def(x) ? x : y;
	}
	err: function(error) {
	  if (error.constructor === Error) {
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
	},
	errstr: function(error) {
	  return err(error).message;
	},
	errdict: function(error) {
	  return {error:errstr(error)};
	},
	geterr: function(data) {
	  var str = (def(data.errors) && data.errors.length > 0) ? data.errors[0] : data.error;
	  if (def(str) && def(str.message)) {
	    str = str.message;
	  }
	  return !def(str) ? undefined : err(str);
	},
	projf: function() {
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
	},
	projff: function() {
	  var args = Array.prototype.slice.call(arguments);
	  var f = args[0];
	  var globalArray = args.slice(1);
	  return function() {
	    var args = Array.prototype.slice.call(arguments);
	    var array = globalArray.map(x=>(def(x) ? x() : undefined));
	    for (var i=0; i<array.length; i+=1) {
	      if (!def(array[i])) {
	        array[i] = args.shift();
	      }
	    }
	    array = array.concat(args);
	    return f.apply(this,array);
	  }
	},
//Object utilities
	mutate: function(object,newValues) {
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
	},
	remove: function(object,key) {
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
	},
	rotate: function(array,amount) {
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
};