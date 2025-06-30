// 1. 基本创建和使用
const s1 = Symbol();
const s2 = Symbol();
console.log('基本比较:', s1 === s2);  // false，每个 Symbol 都是唯一的
console.log("s1", s1);

// 2. 可以添加描述，便于调试
const s3 = Symbol('描述');
console.log('描述:', s3.description)

// 3. 作为对象属性的键
const MY_KEY = Symbol();
const obj = {
  [MY_KEY]: 'value',
  'strKey': 'strValue',
  'numKey': 1
};  

// Symbol 属性不会出现在常规的属性枚举中
console.log('常规属性枚举:', Object.keys(obj)); //  [ 'strKey', 'numKey' ]
console.log('Symbol键枚举:', Object.getOwnPropertySymbols(obj)); //  [Symbol()]
console.log('reflect枚举:', Reflect.ownKeys(obj)); //  ['strKey', 'numKey', Symbol()]
console.log('取值', obj[Symbol()]); // undefined
console.log('取值', obj[MY_KEY]); // value

// 4. Symbol.for - 全局 Symbol 注册
const s4 = Symbol.for('shared');
const s5 = Symbol.for('shared');
console.log('s4 === s5:', s4 === s5); // true

// 5. 举一个在开发中必须要使用到 Symbol 的场景

// 场景：在类或组件中创建真正的私有属性
// 问题：普通的字符串属性名可能会被外部访问或意外覆盖

// 不使用Symbol的情况 - 属性可能被意外访问
class User {
  constructor(name) {
    this.name = name;
    this._password = '123456'; // 约定的私有属性，但仍可被外部访问
  }
}

const user1 = new User('张三');
console.log('外部可以访问私有属性:', user1._password); // 可以访问到
user1._password = 'hacked'; // 可以被修改
console.log('私有属性被篡改:', user1._password);

// 使用Symbol创建真正的私有属性
const PASSWORD_KEY = Symbol('password');
const INTERNAL_ID = Symbol('internalId');

class SecureUser {
  constructor(name) {
    this.name = name;
    this[PASSWORD_KEY] = '123456'; // 使用Symbol作为键
    this[INTERNAL_ID] = Math.random(); // 内部ID
  }
  
  // 只有类内部知道Symbol键，外部无法访问
  validatePassword(password) {
    return this[PASSWORD_KEY] === password;
  }
  
  getInternalId() {
    return this[INTERNAL_ID];
  }
}

const user2 = new SecureUser('李四');
console.log('用户名:', user2.name); // 正常访问
console.log('枚举属性:', Object.keys(user2)); // 只显示 ['name']
console.log('无法直接访问私有属性:', user2._password); // undefined
console.log('无法通过字符串访问:', user2['password']); // undefined
console.log('验证密码:', user2.validatePassword('123456')); // true
console.log('获取内部ID:', user2.getInternalId()); // 0.xxxx

// 另一个场景：防止第三方库属性名冲突
const REACT_COMPONENT_KEY = Symbol('reactComponent');

// 假设我们要给DOM元素添加一个标记，但不想与其他库冲突
function markAsReactComponent(element, component) {
  element[REACT_COMPONENT_KEY] = component;
}

function getReactComponent(element) {
  return element[REACT_COMPONENT_KEY];
}

// 使用
const div = document.createElement('div');
markAsReactComponent(div, 'MyComponent');
console.log('React组件标记:', getReactComponent(div)); // 'MyComponent'
console.log('DOM属性不会被污染:', Object.keys(div)); // 不包含我们添加的Symbol属性

/*

  1. 创建真正的私有属性
  问题背景： JavaScript中没有原生的私有属性支持，传统的下划线约定(_password)只是约定，外部仍可访问和修改。
  Symbol解决方案：
  使用Symbol作为属性键，外部无法通过字符串访问
  不会出现在Object.keys()等常规枚举中
  只有持有Symbol引用的代码才能访问
  
  2. 防止第三方库属性名冲突
  问题背景： 当多个库都要给同一个对象添加属性时，可能会发生命名冲突。
  Symbol解决方案：
  每个Symbol都是唯一的，不会与其他库的属性名冲突
  即使描述相同，Symbol实例也不相等
  保证了库之间的隔离性
  这两个场景在现代前端开发中经常遇到，特别是在开发组件库、框架或需要数据隐藏的应用时，Symbol是必不可少的工具。
*/