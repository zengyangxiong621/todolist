// 1. 简单迭代器
const createNumberIterator = (start, end) => {
  let current = start;
  return {
    next() {
      return current <= end
        ? { value: current++, done: false }
        : { value: undefined, done: true };
    }
  };
}

let numberIterator = createNumberIterator(1, 3);
console.log('numberIterator1', numberIterator.next());
console.log('numberIterator1', numberIterator.next());
console.log('numberIterator1', numberIterator.next());
console.log('numberIterator1', numberIterator.next());

let numberIterator2 = createNumberIterator(1, 3);
let result = numberIterator2.next();
while (!result.done) {
    console.log('numberIterator2', result);
    result = numberIterator2.next();
}

// 2. 可迭代对象 (实现 Symbol.iterator 方法)
const customIterable = {
  data: ["java", "golang", "javascript", "ruby"],
  [Symbol.iterator]: () => {
    let index = 0;
    return {
      next: () => {
        return index < customIterable.data.length
          ? { value: customIterable.data[index++], done: false }
          : { value: undefined, done: true };
      }
    };
  }
}

for (const item of customIterable) console.log(item);  // 输出 a, b, c

// 3. 生成器函数创建迭代器
function* numberGenerator(start, end) {
  let current = start;
  while (current <= end) {
    yield current;
    current++;
  }
}

// 生成器是一种特殊的函数，它可以被暂停和回复执行。生成器函数在执行时会返回一个生成器对象，这个对象遵循迭代器协议。
// 生成器对象是一个迭代器，而且同时也是一个可迭代对象。

const gen = numberGenerator(1, 3);
for (const num of gen) {
  console.log('gen', num); // 依次输出：1, 2, 3
}

const gen2 = numberGenerator(1, 3);
console.log('gen2', gen2.next()); 
console.log('gen2', gen2.next()); 
console.log('gen2', gen2.next()); 

const gen3 = numberGenerator(1, 3);
console.log('gen3', [...gen3]);

// 实现一个拓展运算符函数
// 利用迭代器、可迭代对象的特性
const spreed = (iterable) => {
  const result = [];
  // 1. 获取迭代器
  const iterator = iterable[Symbol.iterator]();

  // 2. 遍历迭代器
  let next = iterator.next();
  while (!next.done){
    result.push(next.value);
    next = iterator.next();
  }

  return result;
}