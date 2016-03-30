(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Mindex = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var indexOf = require('./indexOf');

    /**
     * If array contains values.
     */
    function contains(arr, val) {
        return indexOf(arr, val) !== -1;
    }
    module.exports = contains;


},{"./indexOf":2}],2:[function(require,module,exports){


    /**
     * Array.indexOf
     */
    function indexOf(arr, item, fromIndex) {
        fromIndex = fromIndex || 0;
        if (arr == null) {
            return -1;
        }

        var len = arr.length,
            i = fromIndex < 0 ? len + fromIndex : fromIndex;
        while (i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if (arr[i] === item) {
                return i;
            }

            i++;
        }

        return -1;
    }

    module.exports = indexOf;


},{}],3:[function(require,module,exports){


    /**
     * Create slice of source array or array-like object
     */
    function slice(arr, start, end){
        var len = arr.length;

        if (start == null) {
            start = 0;
        } else if (start < 0) {
            start = Math.max(len + start, 0);
        } else {
            start = Math.min(start, len);
        }

        if (end == null) {
            end = len;
        } else if (end < 0) {
            end = Math.max(len + end, 0);
        } else {
            end = Math.min(end, len);
        }

        var result = [];
        while (start < end) {
            result.push(arr[start++]);
        }

        return result;
    }

    module.exports = slice;



},{}],4:[function(require,module,exports){
var kindOf = require('./kindOf');
var isPlainObject = require('./isPlainObject');
var mixIn = require('../object/mixIn');

    /**
     * Clone native types.
     */
    function clone(val){
        switch (kindOf(val)) {
            case 'Object':
                return cloneObject(val);
            case 'Array':
                return cloneArray(val);
            case 'RegExp':
                return cloneRegExp(val);
            case 'Date':
                return cloneDate(val);
            default:
                return val;
        }
    }

    function cloneObject(source) {
        if (isPlainObject(source)) {
            return mixIn({}, source);
        } else {
            return source;
        }
    }

    function cloneRegExp(r) {
        var flags = '';
        flags += r.multiline ? 'm' : '';
        flags += r.global ? 'g' : '';
        flags += r.ignoreCase ? 'i' : '';
        return new RegExp(r.source, flags);
    }

    function cloneDate(date) {
        return new Date(+date);
    }

    function cloneArray(arr) {
        return arr.slice();
    }

    module.exports = clone;



},{"../object/mixIn":10,"./isPlainObject":5,"./kindOf":6}],5:[function(require,module,exports){


    /**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value && typeof value === 'object' &&
            value.constructor === Object);
    }

    module.exports = isPlainObject;



},{}],6:[function(require,module,exports){


    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    module.exports = kindOf;


},{}],7:[function(require,module,exports){
var hasOwn = require('./hasOwn');

    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }


        if (_hasDontEnumBug) {
            var ctor = obj.constructor,
                isProto = !!ctor && obj === ctor.prototype;

            while (key = _dontEnums[i++]) {
                // For constructor, if it is a prototype object the constructor
                // is always non-enumerable unless defined otherwise (and
                // enumerated above).  For non-prototype objects, it will have
                // to be defined on this object, since it cannot be defined on
                // any prototype objects.
                //
                // For other [[DontEnum]] properties, check if the value is
                // different than Object prototype value.
                if (
                    (key !== 'constructor' ||
                        (!isProto && hasOwn(obj, key))) &&
                    obj[key] !== Object.prototype[key]
                ) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    module.exports = forIn;



},{"./hasOwn":9}],8:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var forIn = require('./forIn');

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn(obj, function(val, key){
            if (hasOwn(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    module.exports = forOwn;



},{"./forIn":7,"./hasOwn":9}],9:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],10:[function(require,module,exports){
var forOwn = require('./forOwn');

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments[i];
            if (obj != null) {
                forOwn(obj, copyProp, target);
            }
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
    }

    module.exports = mixIn;


},{"./forOwn":8}],11:[function(require,module,exports){
var slice = require('../array/slice');
var contains = require('../array/contains');

    /**
     * Return a copy of the object, filtered to only contain properties except the blacklisted keys.
     */
    function omit(obj, var_keys){
        var keys = typeof arguments[1] !== 'string'? arguments[1] : slice(arguments, 1),
            out = {};

        for (var property in obj) {
            if (obj.hasOwnProperty(property) && !contains(keys, property)) {
                out[property] = obj[property];
            }
        }
        return out;
    }

    module.exports = omit;



},{"../array/contains":1,"../array/slice":3}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createIndex;

var _clone = require("mout/lang/clone");

var _clone2 = _interopRequireDefault(_clone);

var _omit = require("mout/object/omit");

var _omit2 = _interopRequireDefault(_omit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Mindex
 * @class Mindex
 */

var Mindex = function () {

  /**
   * @param  {Array} fieldList
   * @return {Mindex}
   * @constructor
   */

  function Mindex(fieldList) {
    _classCallCheck(this, Mindex);

    /**
     * Field list
     * @type {Array}
     */
    this.fieldList = [];

    /**
     * Values
     * @type {Array}
     */
    this.values = [];

    /**
     * Keys
     * @type {Array}
     */
    this.keys = [];

    /**
     * Index
     * @type {Boolean}
     */
    this.isIndex = false;

    /**
     * Greater comparisions
     * @type {String}
     */
    this.GE = "<=";
    this.GT = "<";

    /**
     * Lower comparisions
     * @type {String}
     */
    this.LE = ">=";
    this.LT = ">";

    return this;
  }

  _createClass(Mindex, [{
    key: "sort",
    value: function sort(a, b) {

      if (a === null && b === null) {
        return 0;
      }

      if (a === null) {
        return -1;
      }

      if (b === null) {
        return 1;
      }

      if (a < b) {
        return -1;
      }

      if (a > b) {
        return 1;
      }

      return 0;
    }
  }, {
    key: "binarySearch",
    value: function binarySearch(array, value) {

      var lo = 0;
      var hi = array.length;
      var compared = 0;
      var mid = 0;

      for (; lo < hi;) {
        mid = (lo + hi) / 2 << 0;
        compared = this.sort(value, array[mid]);
        if (compared === 0) {
          return {
            found: true,
            index: mid
          };
        }
        if (compared < 0) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      };

      return {
        found: false,
        index: hi
      };
    }

    /**
     * Array validation
     * @param  {Array}   array
     * @return {Boolean}
     */

  }, {
    key: "isArray",
    value: function isArray(array) {
      return array instanceof Array;
    }

    /**
     * Faster array concat
     * @param {Array} a
     * @param {Array} b
     */

  }, {
    key: "concat",
    value: function concat(a, b) {

      var i = 0;
      var bLength = b.length;

      for (; i < bLength;) {
        a.push(b[++i]);
      };

      return void 0;
    }
  }, {
    key: "insertAt",
    value: function insertAt(array, index, value) {
      array.splice(index, 0, value);
    }
  }, {
    key: "removeAt",
    value: function removeAt(array, index) {
      array.splice(index, 1);
    }

    /**
     * Clear instance
     */

  }, {
    key: "clear",
    value: function clear() {
      this.values = [];
      this.keys = [];
    }

    /**
     * Insert new record
     * @param {Object} data
     */

  }, {
    key: "insertRecord",
    value: function insertRecord(data) {
      var keyList = this.fieldList.map(function (field) {
        return data[field] || null;
      });
      if (data.id === void 0) {
        this.set(keyList, data.id);
      }
    }

    /**
     * Remove a record
     * @param {Object} data
     */

  }, {
    key: "removeRecord",
    value: function removeRecord(data) {
      var keyList = this.fieldList.map(function (field) {
        return data[field] || null;
      });
      this.remove(keyList, data.id);
    }

    /**
     * Update a record
     * @param {Object} data
     */

  }, {
    key: "updateRecord",
    value: function updateRecord(data) {
      this.removeRecord(data);
      this.insertRecord(data);
      return void 0;
    }

    /**
     * Get
     * @param  {Array} keyList
     * @return {Array}
     */

  }, {
    key: "get",
    value: function get(keyList) {

      if (this.isArray(keyList) === false) {
        keyList = [keyList];
      }

      var key = keyList.shift() || null;
      var pos = this.binarySearch(this.keys, key);

      if (keyList.length === 0) {
        if (pos.found === true) {
          if (this.values[pos.index].isIndex === true) {
            return this.values[pos.index].getAll();
          }
          return this.values[pos.index];
        }
        return [];
      }

      if (pos.found === true) {
        return this.values[pos.index].get(keyList);
      }

      return [];
    }

    /**
     * Get
     * @param {Array} keyList
     * @param {*}     value
     */

  }, {
    key: "set",
    value: function set(keyList, value) {

      if (this.isArray(keyList) === false) {
        keyList = [keyList];
      }

      var key = keyList.shift() || null;
      var pos = this.binarySearch(this.keys, key);

      if (keyList.length === 0) {
        if (pos.found === true) {
          var dataLocation = this.binarySearch(this.values[pos.index], value);
          if (dataLocation.found === false) {
            this.insertAt(this.values[pos.index], dataLocation.index, value);
          }
        } else {
          this.insertAt(this.keys, pos.index, key);
          this.insertAt(this.values, pos.index, [value]);
        }
      } else {
        if (pos.found === true) {
          this.values[pos.index].set(keyList, value);
        } else {
          this.insertAt(this.keys, pos.index, key);
          var newIndex = createIndex();
          newIndex.set(keyList, value);
          this.insertAt(this.values, pos.index, newIndex);
        }
      }

      return void 0;
    }

    /**
     * Get all
     * @return {Array}
     */

  }, {
    key: "getAll",
    value: function getAll() {

      var results = [];

      var value = null;

      var i = 0;
      var length = this.values.length;

      for (; i < length; ++i) {
        value = this.values[i];
        if (value.isIndex === true) {
          this.concat(results, value.getAll());
        } else {
          this.concat(results, value);
        }
      };

      return results;
    }

    /**
     * Query
     * @param  {Object} query
     * @return {Array}
     */

  }, {
    key: "query",
    value: function query(_query) {

      var left = null;
      var right = null;

      if (_query[this.GT] !== void 0) {
        left = _query[this.GT];
        _query.leftInclusive = false;
      } else if (_query[this.GE] !== void 0) {
        left = _query[this.GE];
        _query.leftInclusive = true;
      }

      if (_query[this.LT] !== void 0) {
        right = _query[this.LT];
        _query.rightInclusive = false;
      } else if (_query[this.LE] !== void 0) {
        right = _query[this.LE];
        _query.rightInclusive = true;
      }

      if (left.length !== right.length) {
        throw new Error('Key arrays must be same length');
      }

      return this.between(left, right, (0, _omit2.default)(_query, [this.GT, this.GE, this.LT, this.LE]));
    }

    /**
     * Remove
     * @param {Array} keyList
     * @param {*}     value
     */

  }, {
    key: "remove",
    value: function remove(keyList, value) {

      if (this.isArray(keyList) === false) {
        keyList = [keyList];
      }

      var key = keyList.shift();
      var pos = this.binarySearch(this.keys, key);

      if (keyList.length === 0) {
        if (pos.found === true) {
          var dataLocation = this.binarySearch(this.values[pos.index], value);
          if (dataLocation.found === true) {
            this.removeAt(this.values[pos.index], dataLocation.index);
            if (this.values[pos.index].length === 0) {
              this.removeAt(this.keys, pos.index);
              this.removeAt(this.values, pos.index);
            }
          }
        }
      } else {
        if (pos.found === true) {
          this.values[pos.index].remove(keyList, value);
        }
      }

      return void 0;
    }
  }, {
    key: "between",
    value: function between(left, right, opts) {

      opts = Object.assign({
        leftInclusive: true,
        rightInclusive: false,
        limit: 0,
        offset: 0
      }, opts);

      var results = this._between(left, right, opts);

      if (opts.limit > 0) {
        return results.slice(opts.offset, opts.limit + opts.offset);
      }

      return results.slice(opts.offset);
    }
  }, {
    key: "_between",
    value: function _between(left, right, opts) {

      var results = [];

      var leftKey = left.shift();
      var rightKey = right.shift();

      var pos = null;

      var limited = opts.limit > 0;

      if (leftKey !== undefined) {
        pos = this.binarySearch(this.keys, leftKey);
      } else {
        pos = {
          found: false,
          index: 0
        };
      }

      if (left.length === 0) {

        if (pos.found === false && opts.leftInclusive === false) {
          pos.index++;
        }

        for (var i = pos.index; i < this.keys.length; i += 1) {
          if (rightKey !== undefined) {
            if (opts.rightInclusive === true) {
              if (this.keys[i] > rightKey) {
                break;
              }
            } else {
              if (this.keys[i] >= rightKey) {
                break;
              }
            }
          }

          if (this.values[i].isIndex === true) {
            this.concat(results, this.values[i].getAll());
          } else {
            this.concat(results, this.values[i]);
          }

          if (limited === true) {
            if (results.length >= opts.limit + opts.offset) {
              break;
            }
          }
        }
      } else {

        var currKey = null;

        for (var _i = pos.index; _i < this.keys.length; _i += 1) {
          currKey = this.keys[_i];
          if (currKey > rightKey) break;

          if (this.values[_i].isIndex === true) {
            if (currKey === leftKey) {
              results = results.concat(this.values[_i]._between((0, _clone2.default)(left), right.map(function () {
                return undefined;
              }), opts));
            } else if (currKey === rightKey) {
              results = results.concat(this.values[_i]._between(left.map(function () {
                return undefined;
              }), (0, _clone2.default)(right), opts));
            } else {
              this.concat(results, this.values[_i].getAll());
            }
          } else {
            this.concat(results, this.values[_i]);
          }

          if (limited === true) {
            if (results.length >= opts.limit + opts.offset) {
              break;
            }
          }
        }
      }

      if (limited === true) {
        return results.slice(0, opts.limit + opts.offset);
      }

      return results;
    }
  }]);

  return Mindex;
}();

/**
 * Create a mindex
 * @param  {Array}  fieldList
 * @return {Mindex}
 */


function createIndex() {
  var fieldList = arguments.length <= 0 || arguments[0] === undefined ? fieldList || [] : arguments[0];


  var instance = new Mindex();

  if (instance.isArray(fieldList) === false) {
    throw new Error('fieldList must be an array.');
  }

  instance.fieldList = fieldList;
  instance.isIndex = true;

  instance.clear();

  return instance;
}

},{"mout/lang/clone":4,"mout/object/omit":11}]},{},[12])(12)
});