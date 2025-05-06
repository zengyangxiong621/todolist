// 生成器函数声明
function* generatorFuntion() {
  yield 1;
  yield 2;
  yield 3;
}

// 使用生成器
const generator = generatorFuntion();
console.log(generator.next()); // { value: 1, done: false }
// console.log(generator.next()); // { value: 2, done: false }
// console.log(generator.next()); // { value: 3, done: false }
// console.log(generator.next()); // { value: undefined, done: true }

console.log('1',...generator)

function* counter() {
  let count = 0;
  while(true) {
    yield count++;
  }
}

const counterGen = counter();
console.log(counterGen.next().value); // 0
console.log(counterGen.next().value); // 1
console.log(counterGen.next().value); // 2
// console.log('counterGen', ...counterGen)
// Mock API 响应
const mockApi = {
  '/api/users': [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' }
  ],
  '/api/posts': [
    { id: 1, title: '文章1', userId: 1 },
    { id: 2, title: '文章2', userId: 2 }
  ]
};

// Mock fetch 函数
const mockFetch = (url) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        json: () => Promise.resolve(mockApi[url])
      });
    }, 1000); // 模拟网络延迟
  });
};

function* fetchData() {
  try {
    const users = yield mockFetch('/api/users');
    const userData = yield users.json();
    console.log('用户数据:', userData);

    const posts = yield mockFetch('/api/posts');
    const postData = yield posts.json();
    console.log('文章数据:', postData);

    return { userData, postData };
  } catch (error) {
    console.error('Error:', error);
  }
}






const fetchGenerator = fetchData();
Promise.resolve(fetchGenerator.next()).then(res => {
  return Promise.resolve(res.value)
}).then(res => {
  return Promise.resolve(fetchGenerator.next(res));
}).then(res => {
  return Promise.resolve(res.value);
}).then(res => {
  console.log('value', res);
});

const runGenerator = (generatorFunction) => {
  const generator = generatorFunction();
  function handle(result) {
    if (result.done) return Promise.resolve(result.value);
    return Promise.resolve(result.value)
     .then(res => {
        return handle(generator.next(res));
      })
     .catch(err => handle(generator.throw(err)));
  }
  return handle(generator.next());
}




// 执行器函数
function run(generatorFunction) {
  const generator = generatorFunction();
  console.log('generator', generator);
  function handle(result) {
    console.log('result', result);
    if (result.done) return Promise.resolve(result.value);
    
    return Promise.resolve(result.value)
      .then(res => {
        console.log('res', res);
        return handle(generator.next(res));
      })
      .catch(err => handle(generator.throw(err)));
  }
  const generatorNext = generator.next();
  console.log('generator.next()', generatorNext);
  return handle(generatorNext);
}

// // 执行异步操作
// run(fetchData).then(result => {
//   console.log('最终结果:', result);
// });