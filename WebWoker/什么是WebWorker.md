# 什么是WebWorker

## 定义

**WebWorker** 是HTML5提供的一种在后台运行JavaScript的技术，它允许网页在**独立的线程**中执行脚本，不会阻塞主线程（UI线程）的执行。

## 核心特点

### 1. 多线程并行
```javascript
// 主线程
console.log('主线程开始');

// 创建WebWorker，在独立线程中运行
const worker = new Worker('worker.js');

console.log('主线程继续执行'); // 不会被阻塞
```

### 2. 线程隔离
- **独立的全局作用域**：Worker有自己的全局对象
- **独立的内存空间**：不能直接访问主线程的变量
- **独立的执行上下文**：互不干扰

### 3. 消息通信
```javascript
// 主线程向Worker发送消息
worker.postMessage({
    command: 'start',
    data: [1, 2, 3, 4, 5]
});

// 接收Worker返回的消息
worker.onmessage = function(event) {
    console.log('Worker返回:', event.data);
};
```

## WebWorker类型

### 1. Dedicated Worker (专用Worker)
```javascript
// 只能被创建它的脚本使用
const worker = new Worker('dedicated-worker.js');
```

### 2. Shared Worker (共享Worker)
```javascript
// 可以被多个脚本、窗口、iframe共享
const sharedWorker = new SharedWorker('shared-worker.js');
```

### 3. Service Worker (服务Worker)
```javascript
// 用于离线缓存、推送通知等
navigator.serviceWorker.register('service-worker.js');
```

## 使用场景

### 1. 数据处理和计算
```javascript
// worker.js - 处理大量数据
self.onmessage = function(event) {
    const data = event.data;
    
    // 执行复杂计算
    const result = heavyComputation(data);
    
    // 返回计算结果
    self.postMessage(result);
};

function heavyComputation(data) {
    // 模拟耗时计算
    let sum = 0;
    for (let i = 0; i < data.length * 1000000; i++) {
        sum += Math.random();
    }
    return sum;
}
```

### 2. 图像处理
```javascript
// image-worker.js
self.onmessage = function(event) {
    const imageData = event.data;
    
    // 图像滤镜处理
    const processedData = applyFilter(imageData);
    
    self.postMessage(processedData);
};

function applyFilter(imageData) {
    const data = imageData.data;
    
    // 灰度滤镜
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;     // R
        data[i + 1] = gray; // G
        data[i + 2] = gray; // B
    }
    
    return imageData;
}
```

### 3. 网络请求
```javascript
// fetch-worker.js
self.onmessage = function(event) {
    const { url, options } = event.data;
    
    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            self.postMessage({
                success: true,
                data: data
            });
        })
        .catch(error => {
            self.postMessage({
                success: false,
                error: error.message
            });
        });
};
```

### 4. 实时数据处理
```javascript
// data-processor-worker.js
let buffer = [];

self.onmessage = function(event) {
    const { type, data } = event.data;
    
    switch(type) {
        case 'add':
            buffer.push(data);
            break;
            
        case 'process':
            const result = processBuffer();
            self.postMessage(result);
            break;
            
        case 'clear':
            buffer = [];
            break;
    }
};

function processBuffer() {
    // 处理缓冲区数据
    return buffer.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
}
```

## 完整使用示例

### 主线程 (main.js)
```javascript
class WorkerManager {
    constructor() {
        this.worker = null;
        this.isWorking = false;
    }
    
    // 初始化Worker
    init() {
        this.worker = new Worker('calculation-worker.js');
        
        // 监听Worker消息
        this.worker.onmessage = (event) => {
            this.handleWorkerMessage(event.data);
        };
        
        // 监听Worker错误
        this.worker.onerror = (error) => {
            console.error('Worker错误:', error);
            this.isWorking = false;
        };
    }
    
    // 发送任务给Worker
    startCalculation(data) {
        if (this.isWorking) {
            console.log('Worker正在工作中...');
            return;
        }
        
        this.isWorking = true;
        this.worker.postMessage({
            command: 'calculate',
            data: data
        });
        
        console.log('任务已发送给Worker');
    }
    
    // 处理Worker返回的消息
    handleWorkerMessage(message) {
        const { command, result, progress } = message;
        
        switch(command) {
            case 'progress':
                console.log(`计算进度: ${progress}%`);
                break;
                
            case 'complete':
                console.log('计算完成:', result);
                this.isWorking = false;
                break;
                
            case 'error':
                console.error('计算出错:', message.error);
                this.isWorking = false;
                break;
        }
    }
    
    // 终止Worker
    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.isWorking = false;
        }
    }
}

// 使用示例
const workerManager = new WorkerManager();
workerManager.init();

// 开始计算
workerManager.startCalculation({
    numbers: Array.from({length: 1000000}, (_, i) => i + 1)
});
```

### Worker线程 (calculation-worker.js)
```javascript
// Worker全局作用域
self.onmessage = function(event) {
    const { command, data } = event.data;
    
    switch(command) {
        case 'calculate':
            performCalculation(data);
            break;
            
        default:
            sendMessage('error', null, 'Unknown command');
    }
};

function performCalculation(data) {
    try {
        const numbers = data.numbers;
        let result = 0;
        const total = numbers.length;
        
        for (let i = 0; i < total; i++) {
            // 执行计算
            result += Math.sqrt(numbers[i]);
            
            // 每处理1000个数据报告一次进度
            if (i % 1000 === 0) {
                const progress = Math.round((i / total) * 100);
                sendMessage('progress', null, null, progress);
            }
        }
        
        // 发送完成消息
        sendMessage('complete', result);
        
    } catch (error) {
        sendMessage('error', null, error.message);
    }
}

function sendMessage(command, result = null, error = null, progress = null) {
    self.postMessage({
        command,
        result,
        error,
        progress
    });
}

// Worker中可用的API
console.log('Worker启动');
console.log('Worker全局对象:', self);
```

## WebWorker限制

### 1. 无法访问的对象
```javascript
// ❌ Worker中无法访问
// - DOM对象 (document, window)
// - 父对象 (parent)
// - 某些全局函数 (alert, confirm)

// ✅ Worker中可以访问
// - navigator对象
// - location对象
// - XMLHttpRequest
// - setTimeout/setInterval
// - WebSocket
// - IndexedDB
```

### 2. 数据传输限制
```javascript
// ❌ 不能传输的数据类型
// - 函数
// - DOM元素
// - 复杂对象(带有方法的对象)

// ✅ 可以传输的数据类型
// - 基本数据类型
// - 纯数据对象
// - 数组
// - ArrayBuffer
// - ImageData
```

## 性能优化

### 1. 避免频繁通信
```javascript
// ❌ 低效：频繁发送单个数据
for (let i = 0; i < 1000; i++) {
    worker.postMessage(i);
}

// ✅ 高效：批量发送数据
const batch = Array.from({length: 1000}, (_, i) => i);
worker.postMessage(batch);
```

### 2. 使用Transferable Objects
```javascript
// 转移ArrayBuffer所有权，避免复制
const buffer = new ArrayBuffer(1024);
worker.postMessage(buffer, [buffer]);
// 主线程中buffer变为不可用
```

### 3. 合理管理Worker生命周期
```javascript
class WorkerPool {
    constructor(workerScript, poolSize = 4) {
        this.workers = [];
        this.taskQueue = [];
        this.availableWorkers = [];
        
        // 创建Worker池
        for (let i = 0; i < poolSize; i++) {
            const worker = new Worker(workerScript);
            worker.onmessage = (event) => this.handleWorkerMessage(event, worker);
            this.workers.push(worker);
            this.availableWorkers.push(worker);
        }
    }
    
    // 执行任务
    execute(data) {
        return new Promise((resolve, reject) => {
            const task = { data, resolve, reject };
            
            if (this.availableWorkers.length > 0) {
                this.assignTask(task);
            } else {
                this.taskQueue.push(task);
            }
        });
    }
    
    assignTask(task) {
        const worker = this.availableWorkers.pop();
        worker.currentTask = task;
        worker.postMessage(task.data);
    }
    
    handleWorkerMessage(event, worker) {
        const task = worker.currentTask;
        task.resolve(event.data);
        
        // 释放Worker
        worker.currentTask = null;
        this.availableWorkers.push(worker);
        
        // 处理队列中的下一个任务
        if (this.taskQueue.length > 0) {
            const nextTask = this.taskQueue.shift();
            this.assignTask(nextTask);
        }
    }
    
    // 销毁Worker池
    terminate() {
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
        this.availableWorkers = [];
        this.taskQueue = [];
    }
}
```

## 总结

WebWorker是实现JavaScript多线程的重要技术：

| 特性 | 描述 | 优势 |
|------|------|------|
| **并行执行** | 独立线程运行 | 不阻塞UI |
| **线程安全** | 隔离的执行环境 | 避免竞态条件 |
| **消息通信** | 通过postMessage交换数据 | 结构化数据传输 |
| **适用场景** | 计算密集型任务 | 提升用户体验 |

**使用WebWorker的关键是合理设计任务分工和数据通信，充分发挥多线程的优势！**