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
