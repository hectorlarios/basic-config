'use strict';

/**
 * basic-config-store
 * Copyright(c) 2017 Hector Larios
 * MIT Licensed
 */
function BasicConfigStore()
{
  var _data = {};

  var _observerList = {};

  var _separator = '.';

  var _pattern = /\./;

  var _id = createRandomString();

  /**
   * Returns the name of the property to be modified after splitting the path parameter into an array. The last
   * item in the array is the value returned .
   *
   * @param path {String} - the path to the property to be modified.
   * @returns {String} - the name of the property to be modified.
   */
  function getPropertyName(path)
  {
    var _match = path.match(_pattern);

    if (_match)
    {
      var _path = path.split(_separator);

      var lastIndex = _path.length - 1;

      return _path[lastIndex];
    }

    return path;
  }

  /**
   * Returns the object that contains the property to be modified. The path parameter is split into an array; the, newly
   * created, array is used for finding the object contains the property. If the object does not exist, it will be created.
   *
   * @param path {String} - the path to the object containing the property that will be modified.
   * @returns {Object} - the object that has the property to be modified.
   */
  function getParentObject(path)
  {
    var _match = path.match(_pattern);

    var _obj = _data;

    if (_match)
    {
      var _path = path.split(_separator);

      var lastIndex = _path.length - 1;

      _path.every(function (name, index)
      {
        _obj = _obj[name] || (_obj[name] = {});

        return (index + 1) < lastIndex;
      });
    }

    return _obj;
  }

  /**
   * Return an array containing the handlers for property being observed. The key is the property in the observer list
   * containing the array. If the array does not exit, it will be created for future use.
   *
   * @param key {String} - the property in the observer list containing the array
   * @returns {Array} - an array containing the handlers for the property being observed
   */
  function getObserverList(key)
  {
    return _observerList[key] || (_observerList[key] = []);
  }

  /**
   * Returns the index of the array containing the observer's handler. The index is stored in the observer using the
   * property's path as the key.
   *
   * @param observer {Object} - the object that is observing the property.
   * @param property {String} - string path of the property being observed.
   * @returns {Number} - index of the array containing the observer's handler.
   */
  function getObserverIndex(observer, property)
  {
    var _basicConfig = observer['bc' + _id] || {};

    return _basicConfig[property];
  }

  /**
   * Stores the index of the array containing the observer's handler. The index is stored in the observer using the
   * property's path as the key.
   *
   * @param observer {Object} - the object that is observing the property.
   * @param property {String} - string path of the property being observed.
   * @param index {Number} - index of the array containing the observer's handler.
   */
  function setObserverIndex(observer, property, index)
  {
    var _basicConfig = observer['bc' + _id] || (observer['bc' + _id] = {});

    _basicConfig[property] = index;
  }

  /**
   * This method checks if any observer(s) exist for property that was updated. If there are any observers, the observer's
   * handler is called passing the property and its new value.
   *
   * @param property {String} - string path of the property that was modified.
   * @param value {*} - the new value of the property.
   */
  function notify(property, value)
  {
    if (_observerList[property])
    {
      var _list = getObserverList(property).concat();

      var i = _list.length;

      while (i--)
      {
        _list[i].call(null, { property: property, value: value });
      }
    }
  }

  /**
   * Registers a handler, for the observer object, that will be called when the property observed is modified.
   *
   * @param observer {Object} - the object that is observing the property.
   * @param property {String} - string path of the property being observed.
   * @param handler {Function} - the method to be called when the property is updated.
   */
  this.observeConfig = function observeConfig(observer, property, handler)
  {
    var _list = getObserverList(property);

    var _index = getObserverIndex(observer, property);

    if (isNaN(_index))
    {
      _list.push(handler);

      setObserverIndex(observer, property, _list.length - 1);
    }
  };

  /**
   * Unregisters the observer's handler for the property is being observed.
   *
   * @param observer {Object} - the object that is observing the property.
   * @param property {String} - string path of the property being observed.
   */

  this.unobserveConfig = function unobserveConfig(observer, property)
  {
    var _list = getObserverList(property);

    var _index = getObserverIndex(observer, property);

    if (!isNaN(_index))
    {
      _list.splice(_index, 1);

      setObserverIndex(observer, property, NaN);
    }
  };

  /**
   * Returns the value of the property in the config object.
   *
   * @param property {String} - string path of the property to look up.
   * @returns {*} - the value of the property
   */
  this.getConfigProperty = function getConfigProperty(property)
  {
    var _name = getPropertyName(property);

    var _parent = getParentObject(property);

    return _parent[_name];
  };

  /**
   * Sets the new value of the property in the config object, and notifies any observer(s) of the change.
   *
   * @param property {String} - string path of the property that will be updated.
   * @param value {*} - the new value of the property.
   */
  this.setConfigProperty = function setConfigProperty(property, value)
  {
    var _name = getPropertyName(property);

    var _parent = getParentObject(property);

    _parent[_name] = value;

    notify(property, value);
  };
}

/**
 * Returns an new instance of BasicConfigStore. The new instance can be used to manage different config values that do not need
 * to be in the global space.
 *
 * @returns {BasicConfigStore} - new instance of BasicConfigStore
 */
function createConfig()
{
  return new BasicConfigStore();
}

/**
 * Creates a random string that is generated using the Math.random method,
 * and a portion is generated using the current time.
 *
 * @returns {string} - random string .
 */
function createRandomString()
{
  var _time = (new Date()).getTime();

  var _timeHex = _time.toString(16).substr(-8);

  var _count = 24;

  var _value = '';

  while (_count--)
  {
    _value += "abcdef1234567890".substr(Math.floor(Math.random() * 16), 1);
  }

  _value = _value.slice(0, 20) + _timeHex + _value.slice(20);

  return _value.toUpperCase();
}

var global = new BasicConfigStore();

module.exports = {

  observeConfig: global.observeConfig,

  unobserveConfig: global.unobserveConfig,

  getConfigProperty: global.getConfigProperty,

  setConfigProperty: global.setConfigProperty,

  createConfig: createConfig

};