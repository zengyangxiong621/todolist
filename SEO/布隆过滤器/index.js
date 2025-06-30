// 实现一个 BloomFilter 布隆过滤器

class BloomFilter {
  constructor(size = 10000, hashFunctions = 5) {
    // 初始化位数组，使用 Uint8Array 存储
    this.size = size;
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
    
    // 创建指定数量的哈希函数
    this.hashFunctions = this._createHashFunctions(hashFunctions);
  }

  // 添加元素到布隆过滤器
  add(element) {
    const item = String(element);
    
    // 应用每个哈希函数，并设置对应位为1
    for (const hashFunc of this.hashFunctions) {
      const position = hashFunc(item);
      console.log('item', item);
      console.log('position', position);
      this._setBit(position);
    }
  }

  // 检查元素是否可能在集合中
  has(element) {
    const item = String(element);
    
    // 应用每个哈希函数，检查对应位是否都为1
    for (const hashFunc of this.hashFunctions) {
      const position = hashFunc(item);
      if (!this._getBit(position)) {
        // 如果任一位为0，则元素必定不在集合中
        return false;
      }
    }
    
    // 所有位都为1，元素可能在集合中（存在误判可能）
    return true;
  }

  // 设置指定位为1
  _setBit(position) {
    const byteIndex = Math.floor(position / 8);
    const bitOffset = position % 8;
    console.log('1 << bitOffset', bitOffset, 1 << bitOffset)
    this.bitArray[byteIndex] |= (1 << bitOffset);
    console.log('this.bitArray[byteIndex]', this.bitArray[byteIndex]);
    console.log('---------------------------------')
  }

  // 获取指定位的值
  _getBit(position) {
    const byteIndex = Math.floor(position / 8);
    const bitOffset = position % 8;
    return (this.bitArray[byteIndex] & (1 << bitOffset)) !== 0;
  }

  // 创建指定数量的哈希函数
  _createHashFunctions(count) {
    const hashFunctions = [];
    
    for (let i = 0; i < count; i++) {
      hashFunctions.push((item) => {
        // 使用不同的种子生成不同的哈希函数
        return this._hashFunction(item, i + 1) % this.size;
      });
    }
    
    return hashFunctions;
  }

  // 基础哈希函数 (简化版的FNV-1a算法)
  _hashFunction(str, seed = 0) {
    let hash = 2166136261 ^ seed;
    
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0; // 转换为无符号整数
  }

  // 计算当前的误判率
  getEstimatedFalsePositiveRate(itemCount) {
    // 误判率公式: (1 - e^(-k*n/m))^k
    // k: 哈希函数数量, n: 元素数量, m: 位数组大小
    const k = this.hashFunctions.length;
    const m = this.size;
    const n = itemCount;
    
    return Math.pow(1 - Math.exp(-k * n / m), k);
  }

  // 清空布隆过滤器
  clear() {
    this.bitArray.fill(0);
  }
}

// 使用示例
function testBloomFilter() {
  // 创建一个布隆过滤器，大小为10000位，使用5个哈希函数
  const filter = new BloomFilter(10000, 5);
  
  // 添加一些元素
  filter.add("apple");
  filter.add("banana");
  filter.add("orange");
  
  // 检查元素是否存在
  console.log("Has apple:", filter.has("apple"));       // 应该返回 true
  console.log("Has banana:", filter.has("banana"));     // 应该返回 true
  console.log("Has grape:", filter.has("grape"));       // 应该返回 false
  
  // 添加更多元素
  for (let i = 0; i < 1000; i++) {
    filter.add(`item-${i}`);
  }
  
  // 计算误判率
  console.log("估计的误判率:", filter.getEstimatedFalsePositiveRate(1003));
  
  // 测试误判率
  let falsePositives = 0;
  const testCount = 10000;
  
  for (let i = 0; i < testCount; i++) {
    const testItem = `test-${i}`;
    if (filter.has(testItem)) {
      falsePositives++;
    }
  }
  console.log('filter', filter);
  console.log(`实际误判率: ${falsePositives / testCount}`);
}

// 运行测试
testBloomFilter();

module.exports = BloomFilter;