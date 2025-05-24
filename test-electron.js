const Store = require('electron-store');
const store = new Store();
store.set('testKey', 'testValue');
console.log('Valor:', store.get('testKey'));
