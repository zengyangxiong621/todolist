# 迭代器
## 1. 什么是迭代器

迭代器（iterator）是一个特殊的对象，它提供了一种方法来遍历一个容器对象内的所有元素。在 `javascript` 中，迭代器对象必须实现 `next()` 方法，该方法返回一个包含`value` 和 `done` 两个属性的对象。

## 2. 什么是可迭代对象

+ 可迭代对象实现了 `Symbol.iterator` 方法，*该方法返回一个迭代器对象*。

+ 可迭代对象可以使用 `for...of` 循环来遍历。


## 3. 迭代器作用

+ 提供统一的遍历接口，使得不同的数据结构可以使用相同的遍历方式。
> 不同的数据结构（Array, Set, Map, String, TypedArray, arguments）可以使用相同的遍历方式。

```javascript
const arr = [1, 2, 3];
const set = new Set([1, 2, 3]);
const map = new Map([['a', 1], ['b', 2], ['c', 3]]);

for (const item of arr) console.log(item);
for (const item of set) console.log(item);
for (const [key, value] of map) console.log(key, value);
```

+ 实现惰性计算，只有在需要的时候才计算下一个值。
  - 只有在调用 next() 时才会计算下一个值
  - 可以处理大数据集合而不会占用过多内存
  - 可以处理无限序列

  ```javascript
    function* infiniteNumbers() {
      let n = 1;
      while (true) {
        yield n++;
      }
    }

    const numbers = infiniteNumbers();
    console.log(numbers.next().value); // 1
    console.log(numbers.next().value); // 2
    // 虽然是无限序列，但只会在需要时计算下一个值
  ```

+ 使数据结构和使用分离
  - 数据的生产者和消费者解耦
  - 迭代器封装了数据的访问方式
  - 数据结构可以随时变更内部实现，而不影响使用方

```javascript
// 一个数据集合类，内部实现可以随时改变
class DataCollection {
  constructor() {
    // 初始实现使用数组存储数据
    this.data = ['A', 'B', 'C'];
  }

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => ({
        value: this.data[index],
        done: index++ >= this.data.length
      })
    };
  }
}

// 使用方式
const collection = new DataCollection();

// 使用者不需要知道内部实现，只需要使用统一的遍历接口
for (const item of collection) {
  console.log(item); // 输出：A, B, C
}

// 即使后续改变内部实现，使用方式依然不变
class DataCollection2 {
  constructor() {
    // 改用 Map 存储数据
    this.data = new Map([
      [0, 'A'],
      [1, 'B'],
      [2, 'C']
    ]);
  }

  [Symbol.iterator]() {
    return this.data.values();
  }
}

// 使用方式完全相同
const collection2 = new DataCollection2();
for (const item of collection2) {
  console.log(item); // 输出：A, B, C
}
```
  - 数据生产者（DataCollection）和 消费者（使用 for...of 的代码）完全解耦
  - 即使内部实现从数据改为 Map，使用方式保持不变
  - 迭代器接口封装了数据访问的细节
  - 使用者不需要关心数据是如何存储和获取的，只需要使用统一的遍历方式
 
+ 支持 `for...of` 循环，可以使用 `for...of` 循环来遍历可迭代对象。

## 4. 实际应用场景

+ 分页数据处理：按需加载数据，减少内存占用
+ 文件流处理：逐行读取大文件
+ 数据库查询结果处理：流式处理大量查询结构
+ 自定义数据结构：为自定义数据结构提供标准遍历接口
+ 异步数据量：结合 async/await 处理异步数据流

## 5. 可迭代对象为什么使用 [Symbol.iterator]() 方法生成一个迭代器
### 5.1 唯一性
+ Symbol 的值是唯一的，不会与其他属性名冲突
+ 避免了命名冲突的问题，确保了接口的统一性
+ 防止被意外覆盖或修改

### 5.2 内部实现机制
+ js引擎内部使用这个特定的 Symbol 来识别可迭代对象
+ for...of、展开运算符等等语法糖都会寻找这个特定的 Symbol
+ 保证了语言特性的一致性和可靠性


