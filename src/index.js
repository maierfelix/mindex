import clone from "mout/lang/clone";
import omit  from "mout/object/omit";

/**
 * Mindex
 * @class Mindex
 */
class Mindex {

  /**
   * @param  {Array} fieldList
   * @return {Mindex}
   * @constructor
   */
  constructor(fieldList) {

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

    return (this);

  }

  sort(a, b) {
    
    if (a === null && b === null) {
      return (0);
    }

    if (a === null) {
      return (-1);
    }

    if (b === null) {
      return (1);
    }

    if (a < b) {
      return (-1);
    }

    if (a > b) {
      return (1);
    }

    return (0);

  }

  binarySearch(array, value) {

    let lo = 0;
    let hi = array.length;
    let compared = 0;
    let mid = 0;

    for (;lo < hi;) {
      mid = ((lo + hi) / 2) << 0;
      compared = this.sort(value, array[mid]);
      if (compared === 0) {
        return ({
          found: true,
          index: mid
        });
      }
      if (compared < 0) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    };

    return ({
      found: false,
      index: hi
    });

  }

  /**
   * Array validation
   * @param  {Array}   array
   * @return {Boolean}
   */
  isArray(array) {
    return (
      array instanceof Array
    );
  }

  /**
   * Faster array concat
   * @param {Array} a
   * @param {Array} b
   */
  concat(a, b) {

    let i = 0;
    let bLength = b.length;

    for (; i < bLength;) {
      a.push(b[++i]);
    };

    return void 0;

  }

  insertAt(array, index, value) {
    array.splice(index, 0, value);
  }

  removeAt(array, index) {
    array.splice(index, 1);
  }

  /**
   * Clear instance
   */
  clear() {
    this.values = [];
    this.keys = [];
  }

  /**
   * Insert new record
   * @param {Object} data
   */
  insertRecord(data) {
    let keyList = this.fieldList.map(function (field) {
      return data[field] || null
    });
    if (data.id === void 0) {
      this.set(keyList, data.id);
    }
  }

  /**
   * Remove a record
   * @param {Object} data
   */
  removeRecord(data) {
    let keyList = this.fieldList.map(function (field) {
      return data[field] || null
    });
    this.remove(keyList, data.id);
  }

  /**
   * Update a record
   * @param {Object} data
   */
  updateRecord(data) {
    this.removeRecord(data);
    this.insertRecord(data);
    return void 0;
  }

  /**
   * Get
   * @param  {Array} keyList
   * @return {Array}
   */
  get(keyList) {

    if (this.isArray(keyList) === false) {
      keyList = [keyList];
    }

    let key = keyList.shift() || null;
    let pos = this.binarySearch(this.keys, key);

    if (keyList.length === 0) {
      if (pos.found === true) {
        if (this.values[pos.index].isIndex === true) {
          return (
            this.values[pos.index].getAll()
          );
        }
        return (
          this.values[pos.index]
        );
      }
      return ([]);
    }

    if (pos.found === true) {
      return (
        this.values[pos.index].get(keyList)
      );
    }

    return ([]);

  }

  /**
   * Get
   * @param {Array} keyList
   * @param {*}     value
   */
  set(keyList, value) {

    if (this.isArray(keyList) === false) {
      keyList = [keyList];
    }

    let key = keyList.shift() || null;
    let pos = this.binarySearch(this.keys, key);

    if (keyList.length === 0) {
      if (pos.found === true) {
        let dataLocation = this.binarySearch(this.values[pos.index], value);
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
        let newIndex = createIndex();
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
  getAll() {

    let results = [];

    let value = null;

    let i = 0;
    let length = this.values.length;

    for (; i < length; ++i) {
      value = this.values[i];
      if (value.isIndex === true) {
        this.concat(results, value.getAll());
      } else {
        this.concat(results, value);
      }
    };

    return (results);
  }

  /**
   * Query
   * @param  {Object} query
   * @return {Array}
   */
  query(query) {

    let left = null;
    let right = null;

    if (query[this.GT] !== void 0) {
      left = query[this.GT];
      query.leftInclusive = false;
    } else if (query[this.GE] !== void 0) {
      left = query[this.GE];
      query.leftInclusive = true;
    }

    if (query[this.LT] !== void 0) {
      right = query[this.LT];
      query.rightInclusive = false;
    } else if (query[this.LE] !== void 0) {
      right = query[this.LE];
      query.rightInclusive = true;
    }

    if (left.length !== right.length) {
      throw new Error('Key arrays must be same length');
    }

    return (
      this.between(
        left, right, omit(query, [this.GT, this.GE, this.LT, this.LE])
      )
    );

  }

  /**
   * Remove
   * @param {Array} keyList
   * @param {*}     value
   */
  remove(keyList, value) {

    if (this.isArray(keyList) === false) {
      keyList = [keyList];
    }

    let key = keyList.shift();
    let pos = this.binarySearch(this.keys, key);

    if (keyList.length === 0) {
      if (pos.found === true) {
        let dataLocation = this.binarySearch(this.values[pos.index], value);
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

  between(left, right, opts) {

    opts = Object.assign({
      leftInclusive: true,
      rightInclusive: false,
      limit: 0,
      offset: 0
    }, opts);

    let results = this._between(left, right, opts);

    if (opts.limit > 0) {
      return (
        results.slice(opts.offset, opts.limit + opts.offset)
      );
    }

    return (
      results.slice(opts.offset)
    );

  }

  _between(left, right, opts) {

    let results = [];

    let leftKey = left.shift();
    let rightKey = right.shift();

    let pos = null;

    let limited = opts.limit > 0;

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

      for (let i = pos.index; i < this.keys.length; i += 1) {
        if (rightKey !== undefined) {
          if (opts.rightInclusive === true) {
            if (this.keys[i] > rightKey) { break }
          } else {
            if (this.keys[i] >= rightKey) { break }
          }
        }

        if (this.values[i].isIndex === true) {
          this.concat(results, this.values[i].getAll());
        } else {
          this.concat(results, this.values[i]);
        }

        if (limited === true) {
          if (results.length >= (opts.limit + opts.offset)) {
            break
          }
        }
      }

    } else {

      let currKey = null;

      for (let i = pos.index; i < this.keys.length; i += 1) {
        currKey = this.keys[i];
        if (currKey > rightKey) break;

        if (this.values[i].isIndex === true) {
          if (currKey === leftKey) {
            results = results.concat(this.values[i]._between(clone(left), right.map(function () { return undefined }), opts))
          } else if (currKey === rightKey) {
            results = results.concat(this.values[i]._between(left.map(function () { return undefined }), clone(right), opts))
          } else {
            this.concat(results, this.values[i].getAll());
          }
        } else {
          this.concat(results, this.values[i]);
        }

        if (limited === true) {
          if (results.length >= (opts.limit + opts.offset)) {
            break;
          }
        }
      }

    }

    if (limited === true) {
      return (
        results.slice(0, opts.limit + opts.offset)
      );
    }

    return (results);

  }

}

/**
 * Create a mindex
 * @param  {Array}  fieldList
 * @return {Mindex}
 */
export default function createIndex(fieldList = fieldList || []) {

  let instance = new Mindex();

  if (instance.isArray(fieldList) === false) {
    throw new Error('fieldList must be an array.')
  }

  instance.fieldList = fieldList;
  instance.isIndex = true;

  instance.clear();

  return (instance);

}