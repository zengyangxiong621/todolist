# JavaScript基础知识点完整列表

## 基础语法
- 变量声明（var、let、const）
- 数据类型（原始类型、引用类型）
- 类型检测（typeof、instanceof）
- 类型转换（隐式转换、显式转换）
- 运算符（算术、比较、逻辑、位运算、三元运算符）
- 条件语句（if/else、switch）
- 循环语句（for、while、do-while、for...in、for...of）
- 异常处理（try/catch/finally、throw）

## 数据类型详解
### 原始类型
- undefined
- null
- boolean
- number
- string
- symbol
- bigint

### 引用类型
- Object
- Array
- Function
- Date
- RegExp
- Error

## 函数
- 函数声明与函数表达式
- 函数参数（默认参数、剩余参数、解构参数）
- 返回值
- 作用域（全局作用域、函数作用域、块级作用域）
- 作用域链
- 闭包
- 立即执行函数（IIFE）
- 回调函数
- 高阶函数
- 递归函数
- 箭头函数

## 对象
- 对象字面量
- 属性访问（点语法、方括号语法）
- 属性描述符
- 对象方法
- this关键字
- call、apply、bind
- 对象解构
- 属性的枚举
- Object静态方法

## 数组
- 数组创建方式
- 数组索引
- 数组长度
- 数组方法
  - 变更方法：push、pop、shift、unshift、splice、sort、reverse
  - 访问方法：concat、join、slice、toString、indexOf、lastIndexOf
  - 迭代方法：forEach、map、filter、reduce、some、every、find、findIndex

## 原型与继承
- 原型对象（prototype）
- 原型链（__proto__）
- 构造函数
- new操作符
- instanceof操作符
- 继承模式
- class语法糖
- super关键字
- 静态方法

## 异步编程
- 同步与异步概念
- 回调函数
- Promise
  - Promise状态
  - then、catch、finally
  - Promise.all、Promise.race、Promise.allSettled
- async/await
- 事件循环
- 宏任务与微任务
- setTimeout、setInterval
- requestAnimationFrame

## DOM操作
- DOM树结构
- 节点类型
- 元素选择
  - getElementById
  - getElementsByClassName
  - getElementsByTagName
  - querySelector、querySelectorAll
- 元素操作
  - 创建元素
  - 插入元素
  - 删除元素
  - 克隆元素
- 属性操作
- 样式操作
- 文本内容操作

## 事件处理
- 事件绑定方式
- 事件对象
- 事件流（捕获、目标、冒泡）
- 事件委托
- 常用事件类型
- preventDefault、stopPropagation
- 自定义事件

## BOM（浏览器对象模型）
- window对象
- location对象
- navigator对象
- screen对象
- history对象
- document对象

## 字符串操作
- 字符串创建
- 字符串属性和方法
- 模板字符串
- 正则表达式
- 字符串匹配和替换

## 错误处理与调试
- 错误类型
- try...catch...finally
- throw语句
- 自定义错误
- 调试技巧
- console对象方法

## ES6+新特性
- let和const
- 解构赋值
- 模板字符串
- 箭头函数
- 默认参数
- 剩余参数和扩展运算符
- 迭代器和生成器
- Set和Map
- Symbol
- 代理（Proxy）
- 反射（Reflect）
- 模块化（import/export）

## 面向对象编程
- 封装
- 继承
- 多态
- 抽象
- 设计模式基础

## 函数式编程基础
- 纯函数
- 高阶函数
- 柯里化
- 函数组合
- 不可变性

## 模块化
- CommonJS
- AMD
- ES6模块
- 模块导入导出

## JSON操作
- JSON.stringify
- JSON.parse
- JSON数据格式

## 本地存储
- localStorage
- sessionStorage
- cookie操作

## 网络请求
- XMLHttpRequest
- Fetch API
- 跨域问题（CORS、JSONP）

## 性能优化
- 内存管理
- 垃圾回收
- 性能监测
- 代码优化技巧