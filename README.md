# basic-config-store

A global config storage for basic application values that can accessed across the app. The `setConfigProperty` and 
`getConfigProperty` methods provide read/write access of any properties currently in the global config storage. An 
implementation of the [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) is used for notifying any 
updates to the stored values. The `observeConfig` and `unobserveConfig` methods are used for watching changes to a
stored value.

## Installation
``
$ npm install basic-config-store
``

## API
```
import { setConfigProperty } from 'basic-config-store';

setConfigProperty('hello.world','hello world');

---

import { getConfigProperty } from 'basic-config-store';

const hw = getConfigProperty('hello.world');

console.info(hw); //hello world
```

### BasicConfigStore
The BasicConfig class cannot be instantiated directly, the methods: `createBasicConfig()` 
will return a new instance of the BasicConfig class.

### getConfigProperty(property)
Returns the current value of the property being accessed.

`property {String}` - string path to the property to be update. e.g. 'path.to.the.property.to.get'

### setConfigProperty(property, value)
This method will set the new value of the property in the global config. The update to the property will be notified to
any object observing this property.

`property {String}` - string path to the property to be update. e.g. 'path.to.the.property.to.set'

`value {*}` - the new value that will be set.

### observeConfig(observer, property, handler)
Registers an observer and its method that will be called when the property is updated. 

`observer {Object}` - the object will be notified of any change to the property.

`property {String}` - string path to the property that will be observed. e.g. 'path.to.the.property.to.be.observed'

`handler {Function}` - the observer's method that will be called after the property is updated. The handler method 
signature should include a _data_ parameter. The _data_ parameter has two properties: **property**, and **value**

### unobserveConfig(observer, property)
Unregisters an observer and its method that is currently observing the property for updates.

`observer {Object}` - the object will be notified of any change to the property.

`property {String}` - string path to the property that will be unobserved. e.g. 'path.to.the.property.to.be.unobserved'

### createConfig()
This method will create a new instance of the BasicConfigStore class. The new instance will provide local storage of properties 
that do not need to be stored in the global space.

### Example
```
import { setConfigProperty, getConfigProperty } from 'basic-config-store';

let hw = getConfigProperty('hello.world');

console.info(hw); //undefined

setConfigProperty('hello.world','hello world');

hw = getConfigProperty('hello.world');

console.info(hw); //hello world
```

### Example
```
import { setConfigProperty, observeConfig, unobserveConfig } from 'basic-config-store';

class Observer
{
  constructor()
  {
    observeConfig(this, 'http.response.abc123', this.responseHandler.bind(this));
  }
  
  responseHandler(data)
  {
    console.info(data.property); // 'http.response.abc123'
    
    console.info(data.value); // {status: 'success', resonse: {}}
    
    unobserveConfig(this, 'http.response.abc123');
  }
  
}

const ob = new Observer();

setConfigProperty('http.response.abc123', {status: 'success', resonse: {}});
```

### Example
```
import { createConfig, setConfigProperty } from 'basic-config-store';

const local = createBasicConfig();

class Observer
{
  constructor()
  {
    local.observeConfig(this, 'http.response.abc123', this.responseHandler.bind(this));
  }
  
  responseHandler(data)
  {
    console.info(data.property); // 'http.response.abc123'
    
    console.info(data.value); // {status: 'success', resonse: {}}
    
    local.unobserveConfig(this, 'http.response.abc123');
  }
  
}

const ob = new Observer();

local.setConfigProperty('http.response.abc123', {status: 'success', resonse: {}}); // updates in the local config

setConfigProperty('http.response.abc123', {status: 'failure', error: {}}); // updates the global config
```

License [MIT](LICENSE)
