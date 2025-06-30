# 生成器（Generator）

## 1. 基本概念

生成器是一种特殊的函数，它可以被暂停执行和恢复执行。通过 `function*` 声明，使用 `yield` 关键字来暂停执行 
并且返回中间值。

## 2. 基本语法

```javaScript
// 生成器函数声明
function* generatorFunction() {
  yield 1;
  yield 2;
  yield 3;
}

// 使用生成器
const generator = generatorFunction();
console.log(generator.next()); // { value: 1, done: false }
console.log(generator.next()); // { value: 2, done: false }
console.log(generator.next()); // { value: 3, done: false }
console.log(generator.next()); // { value: undefined, done: true }
```

## 3.生成器的特点

### 3.1 状态管理
+ 生成器函数执行后返回一个生成器对象
+ 生成器对象维护了函数的执行状态
+ 每次调用 `next()` 时从上次暂停的地方继续执行

```javascript

function* counter() {
  let count = 0;
  while(true) {
    yield count++;
  }
}

const counterGen = counter();
console.log('counterGen', ...counterGen)

```

### 3.2 双向通信

生成器支持在暂停点和恢复点之间进行双向通信:

```javascript

function* diologue() {
  const name = yield 'What is your name?';
  const age = yield `Hello ${name}, how old are you?`;
  yield `${name} is ${age} years old.`;
}
const diologueGen = diologue();
console.log(diologueGen.next().value); // What is your name?
console.log(diologueGen.next('John').value); // Hello John, how old are you?
console.log(diologueGen.next(25).value); // John is 25 years old.

```

### 3.3 异步流程控制

生成器可以很好地处理异步操作，通过 `yield` 关键字可以暂停执行，等待异步操作完成后再继续执行。

```javascript
function* fetchData() {
  try {
    const users = yield fetch('api/users');
    const posts = yield fetch('api/posts');
    return {
      users, 
      posts
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 4. 生成器方法

生成器对象提供了三个重要的方法
+ `next(value)`
 - 继续执行到下一个 `yield` 语句
 - `value` 参数会作为上一个 `yield` 表达式的返回值

+ `return(value)`
  - 结束生成器
  - 返回给定的值

+ `throw(error)`
  - 抛出错误
  - 生成器会被终止
  - 可以在生成器内部捕获错误

## 5. 最佳实践

+ 异步操作处理
  - 使用执行器函数自动化异步流程
  - 考虑使用 `async/await` 作为替代方案

+ 错误处理
  - 在生成器内使用 `try/catch`  
  - 通过执行器统一处理错误

+ 状态管理
  - 使用生成器管理复杂的状态变化
  - 避免无限生成器导致的内存问题

+ 性能考虑
  - 适度使用生成器
  - 注意内存占用
  - 考虑使用其他方案代替

## 6. 注意事项

+ 生成器函数不能用箭头函数语法
+ `yield` 只能在生成器函数内部使用
+ 生成器对象是一次性的，遍历完成后需要重新创建
+ 生成器函数的 `this` 绑定遵循普通函数的规则

## 7.执行器函数

执行时函数是一个用于自动化处理生成器异步流程的工具函数。它能够自动执行生成器，处理异步操作，并将接过传回生成器。

### 7.1 基本实现

```javascript

function run(generatorFunction) {
  const generator = generatorFunction();

  function handle(result) {
    if (result.done) return Promise.resolve(result.value); 
    return Promise.resolve(result.value).then(res => {
      return handle(generator.next(res));
    }).cath(err => handle(generator.throw(err)))
  }

  return handle(generator.next())
}

```

### 7.2 工作原理

+ 自动化流程
 - 接受一个生成器函数作为参数
 - 创建生成器实例
 - 自动调用 `next()` 方法
 - 处理异步操作的结果

+ 异步处理
  - 将 `yield` 的值包装成 `Promise`
  - 等待 `Promise` 完成
  - 将结果传回给生成器
  - 继续执行下一个 `yield`

+ 错误处理
  - 使用 `try/catch` 捕获错误
  - 将错误通过 `throw(err)` 传回给生成器
  - 允许在生成器内统一处理错误

  