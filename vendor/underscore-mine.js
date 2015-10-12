//源码没看懂的点
//1. _.bind
(function() {
	var root = this;
	var ArrayProto = Array.prototype,
		ObjProto = Object.prototype,
		FunProto = Function.prototype;
	var slice = ArrayProto.slice,
		unshift = ArrayProto.unshift,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty;

	var nativeForEach = ArrayProto.forEach,
		nativeMap = ArrayProto.map,
		nativeSome = ArrayProto.some,
		nativeEvery = ArrayProto.every,
		nativeFilter = ArrayProto.filter,
		nativeReduce = ArrayProto.reduce,
		nativeReduceRight = ArrayProto.reduceRight,
		nativeIndexOf = ArrayProto.indexOf,
		nativeLastIndexOf = ArrayProto.lastIndexOf,
		nativeIsArray = Array.isArray,
		nativeKeys = Object.keys,
		nativeBind = FunProto.bind;

	var breaker = {};

	var _ = function(obj) {
		return new wrapper(obj);
	};

	var wrapper = function(obj) {
		this._wrapped = obj;
	};

	_.prototype = wrapper.prototype;

	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = _;
		}
		exports._ = _;
	} else {
		root['_'] = _;
	}

	//Tools
	_.has = function(obj, property) {
		return hasOwnProperty.call(obj, property);
	}

	_.isArray = nativeIsArray || function(obj) {
		return toString.call(obj) === '[object Array]';
	}

	_.isArguments = function(obj) {
		return toString.call(obj) === '[object Arguments]'; 
	}

	_.identity = function(value) {
		return value;
	}

	_.values = function(obj) {
		return _.map(obj, _.identity);
	}

	_.toArray = function(obj) {
		if(!obj) return [];
		if(_.isArray(obj)) return obj;
		if(_.isArguments(obj)) return slice.call(obj);

		return _.values(obj);
	}

	_.isFunction = function(method) {
		return toString.call(method) === '[object Function]';
	}

	//Collections
	var each = _.each = _.forEach = function(obj, fn, context) {
		if (obj == null) return;
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(fn, context);
		} else if (toString.call(obj) === '[object Array]') {
			for (var i = 0, l = obj.length; i < l; i++) {
				fn.call(context, obj[i], i, obj);
			}
		} else {
			for (var k in obj) {
				if (_.has(k)) {
					fn.call(context, obj[k], k, obj);
				}
			}
		}
	};

	_.map = function(obj, fn, context) {
		var result = [];
		if (obj == null) return result;
		if (nativeMap && obj.map === nativeMap) {
			result = obj.map(fn);
		} else {
			each(obj, function(item, i, array) {
				result.push(fn.call(context, item, i, array));
			}, context);
		}

		return result;
	};

	_.reduce = function(obj, fn, initValue, context) {
		if (obj == null) obj = [];;
		if (nativeReduce && obj.reduce === nativeMap) {
			return initValue ? obj.reduce(fn, initValue) : obj.reduce(fn);
		}

		var initial = slice.call(arguments).length > 2,
			previous;

		each(obj, function(value, i, array) {
			if (!initial) {
				previous = value;
				initial = true;
			} else {
				previous = fn.call(context, previous, obj[i], i, obj);
			}
		});

		return previous;
	};

	_.reduceRight = function(obj, fn, initValue, context) {
		if (obj == null) obj = [];;
		if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
			return initValue ? obj.reduceRight(fn, initValue) : obj.reduceRight(fn);
		} 

		var reverseObj = _.toArray(obj).reverse();
		return initValue ? _.reduce(obj, fn, initValue, context) : _.reduce(obj, fn);
	};

	var any = _.some = _.any = function(obj, iterator, context) {
		iterator || (iterator = _.identity);
		var result = false;
		if(!obj) return result;
		each(obj, function(value, i, list) {
			if(result || (result = iterator.call(context, value, i, list))) return breaker;
		});

		return result;
	};

	_.find = _.detect = function(obj, iterator, context){
		var result;
		any(obj, function(value, item, list) {
			if(iterator.call(context, value, item, list)) {
				result = value;
				return true;
			}
		});

		return result;
	}

	_.filter = _.select = function(obj, iterator, context) {
		var result = [];
		if(!obj) return result;
		if(nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
		each(obj, function(value, item, list) {
			iterator.call(context, value, item, list) && result.push(value);
		});	

		return result;
	}

	_.reject =function(obj, iterator, context) {
		var result = [];
		if(!obj) return result;
		each(obj, function(value, item, list) {
			!iterator.call(context, value, item, list) && result.push(value);
		});	

		return result;
	}

	_.every = _.all = function(obj, iterator, context) {
		var result = true;
		if(!obj) return result;
		if(nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
		each(obj, function(value, item, list) {
			if(!iterator.call(context, value, item, list)) {
				result = false;
				return breaker;
			}
		})

		return !!result;
	}

	_.include = _.contains = function(obj, target) {
		var found = false;
		if(!obj) return found;
		found = any(obj, function(value) {
			return value === target;
		});
		return found;
	}

	_.invoke = function(obj, method) {
		var args = slice.call(arguments, 2);
		return _.map(obj, function(value, item, list) {
			return _.isFunction(method) ? method || value : value[method].apply(value, args);
		})
	}
}).call(this);