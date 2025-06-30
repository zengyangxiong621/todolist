// js的内存地址详解

console.log('=== JavaScript内存地址详解 ===\n');

// 1. 内存结构概述
console.log('1. JavaScript内存分为两个区域：');
console.log('   - 栈内存（Stack）：存储原始类型值和引用地址');
console.log('   - 堆内存（Heap）：存储引用类型的实际数据\n');

// 2. 原始类型的内存存储
console.log('2. 原始类型在栈内存中的存储：');

let a = 10;
let b = a;  // 复制值
b = 20;

console.log('原始类型示例：');
console.log('a =', a); // 10
console.log('b =', b); // 20
console.log('修改b不影响a，因为它们在栈中存储的是独立的值\n');

// 内存示意图（注释形式）
/*
栈内存：
┌──────┬──────┐
│ a    │  10  │
├──────┼──────┤
│ b    │  20  │
└──────┴──────┘
*/

// 3. 引用类型的内存存储
console.log('3. 引用类型在内存中的存储：');

let obj1 = { name: '张三', age: 25 };
let obj2 = obj1;  // 复制引用地址
obj2.age = 30;

console.log('引用类型示例：');
console.log('obj1:', obj1); // { name: '张三', age: 30 }
console.log('obj2:', obj2); // { name: '张三', age: 30 }
console.log('修改obj2影响了obj1，因为它们指向同一个堆内存地址\n');

// 内存示意图（注释形式）
/*
栈内存：                    堆内存：
┌──────┬──────────┐         ┌─────────────────────┐
│ obj1 │ 0x001234 │────────→│ { name:'张三',      │
├──────┼──────────┤         │   age: 30 }         │
│ obj2 │ 0x001234 │────────→│                     │
└──────┴──────────┘         └─────────────────────┘
*/

// 4. 函数参数传递
console.log('4. 函数参数传递：');

// 原始类型参数（值传递）
function changePrimitive(x) {
    x = 100;
    console.log('函数内部 x =', x);
}

let num = 50;
console.log('调用前 num =', num);
changePrimitive(num);
console.log('调用后 num =', num); // 仍然是50
console.log();

// 引用类型参数（引用传递）
function changeReference(obj) {
    obj.value = 200;
    console.log('函数内部 obj.value =', obj.value);
}

let myObj = { value: 100 };
console.log('调用前 myObj.value =', myObj.value);
changeReference(myObj);
console.log('调用后 myObj.value =', myObj.value); // 变成了200
console.log();

// 5. 浅拷贝 vs 深拷贝
console.log('5. 浅拷贝 vs 深拷贝：');

// 浅拷贝示例
let original = {
    name: '李四',
    hobbies: ['读书', '游戏'],
    address: { city: '北京', district: '朝阳' }
};

// 方法1：Object.assign浅拷贝
let shallowCopy1 = Object.assign({}, original);
// 方法2：扩展运算符浅拷贝
let shallowCopy2 = { ...original };

console.log('浅拷贝测试：');
shallowCopy1.name = '王五'; // 不影响原对象
shallowCopy1.hobbies.push('运动'); // 影响原对象（共享引用）
shallowCopy1.address.city = '上海'; // 影响原对象（共享引用）

console.log('原对象:', original);
console.log('浅拷贝对象:', shallowCopy1);
console.log();

// 深拷贝示例
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

let original2 = {
    name: '赵六',
    hobbies: ['电影', '音乐'],
    address: { city: '广州', district: '天河' }
};

let deepCopy = deepClone(original2);
console.log('深拷贝测试：');
deepCopy.name = '孙七';
deepCopy.hobbies.push('旅游');
deepCopy.address.city = '深圳';

console.log('原对象:', original2);
console.log('深拷贝对象:', deepCopy);
console.log();

// 6. 内存地址比较
console.log('6. 内存地址比较：');

let arr1 = [1, 2, 3];
let arr2 = [1, 2, 3];
let arr3 = arr1;

console.log('数组内容比较：');
console.log('arr1 == arr2:', arr1 == arr2);   // false，不同的内存地址
console.log('arr1 === arr2:', arr1 === arr2); // false，不同的内存地址
console.log('arr1 === arr3:', arr1 === arr3); // true，相同的内存地址
console.log();

// 7. 内存泄漏示例
console.log('7. 常见内存泄漏场景：');

// 场景1：全局变量
function createGlobalLeak() {
    // 忘记声明var/let/const，创建了全局变量
    globalVariable = '这是一个全局变量，可能导致内存泄漏';
}

// 场景2：闭包引用
function createClosureLeak() {
    let largeData = new Array(1000000).fill('大量数据');
    
    return function() {
        // 闭包持有对largeData的引用
        console.log('闭包函数被调用');
    };
}

// 场景3：事件监听器未移除
function createEventLeak() {
    let element = document.createElement('div');
    let largeObject = { data: new Array(100000).fill('数据') };
    
    element.addEventListener('click', function() {
        // 事件处理函数持有对largeObject的引用
        console.log(largeObject.data.length);
    });
    
    // 忘记移除事件监听器会导致内存泄漏
    // element.removeEventListener('click', handler);
}

console.log('内存泄漏预防措施：');
console.log('- 避免创建全局变量');
console.log('- 及时清理事件监听器');
console.log('- 注意闭包中的引用');
console.log('- 使用WeakMap和WeakSet');
console.log();

// 8. WeakMap和WeakSet - 弱引用
console.log('8. 弱引用集合（WeakMap/WeakSet）：');

// WeakMap示例
let wm = new WeakMap();
let key = { id: 1 };
wm.set(key, '关联数据');

console.log('WeakMap示例：');
console.log('获取数据:', wm.get(key));

// 当key对象没有其他引用时，会被垃圾回收
// key = null; // 这样设置后，WeakMap中的条目也会被回收

// WeakSet示例
let ws = new WeakSet();
let obj = { name: 'test' };
ws.add(obj);

console.log('WeakSet示例：');
console.log('是否包含对象:', ws.has(obj));
console.log();

// 9. 垃圾回收机制简介
console.log('9. JavaScript垃圾回收机制：');
console.log('主要算法：');
console.log('- 引用计数：跟踪对象被引用的次数');
console.log('- 标记清除：从根对象开始标记可达对象，清除未标记的对象');
console.log('- 分代回收：新生代和老生代分别处理');
console.log();

// 10. 内存使用最佳实践
console.log('10. 内存使用最佳实践：');
console.log('- 及时释放不再使用的引用（设为null）');
console.log('- 使用对象池复用对象');
console.log('- 避免在循环中创建大量对象');
console.log('- 使用适当的数据结构');
console.log('- 监控内存使用情况');

// 示例：手动释放引用
let largeArray = new Array(1000000).fill('数据');
console.log('\n手动释放示例：');
console.log('大数组创建完成，长度:', largeArray.length);

// 使用完毕后释放引用
largeArray = null;
console.log('大数组引用已释放，等待垃圾回收');

console.log('\n=== 内存地址详解完毕 ===');