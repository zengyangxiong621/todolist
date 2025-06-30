# 基础操作

## 1. 两数之和 (Two Sum)

### 题目描述
给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出和为目标值 `target` 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。

**示例 1：**
```
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
```

**示例 2：**
```
输入：nums = [3,2,4], target = 6
输出：[1,2]
```

### 解法一：暴力解法
```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
};
```

**时间复杂度：** O(n²)  
**空间复杂度：** O(1)

### 解法二：哈希表（推荐）
```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
};
```

**时间复杂度：** O(n)  
**空间复杂度：** O(n)

---

## 2. 三数之和 (3Sum)

### 题目描述
给你一个整数数组 `nums` ，判断是否存在三元组 `[nums[i], nums[j], nums[k]]` 满足 `i != j`、`i != k` 且 `j != k` ，同时还满足 `nums[i] + nums[j] + nums[k] == 0` 。

请你返回所有和为 0 且不重复的三元组。

**注意：** 答案中不可以包含重复的三元组。

**示例 1：**
```
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
解释：
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。
不同的三元组是 [-1,0,1] 和 [-1,-1,2] 。
```

### 解法：排序 + 双指针
```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    const result = [];
    const n = nums.length;
    
    // 排序
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < n - 2; i++) {
        // 跳过重复元素
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        // 如果最小值都大于0，后面不可能有解
        if (nums[i] > 0) break;
        
        let left = i + 1;
        let right = n - 1;
        
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                
                // 跳过重复元素
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
};
```

**时间复杂度：** O(n²)  
**空间复杂度：** O(1)

---

## 3. 四数之和 (4Sum)

### 题目描述
给你一个由 `n` 个整数组成的数组 `nums` ，和一个目标值 `target` 。请你找出并返回满足下述全部条件且不重复的四元组 `[nums[a], nums[b], nums[c], nums[d]]` ：

- `0 <= a, b, c, d < n`
- `a`、`b`、`c` 和 `d` 互不相同
- `nums[a] + nums[b] + nums[c] + nums[d] == target`

你可以按任意顺序返回答案。

**示例 1：**
```
输入：nums = [1,0,-1,0,-2,2], target = 0
输出：[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]
```

### 解法：排序 + 双重循环 + 双指针
```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function(nums, target) {
    const result = [];
    const n = nums.length;
    
    if (n < 4) return result;
    
    // 排序
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < n - 3; i++) {
        // 跳过重复元素
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        // 剪枝：如果最小的四个数之和都大于target
        if (nums[i] + nums[i + 1] + nums[i + 2] + nums[i + 3] > target) break;
        
        // 剪枝：如果当前数与最大的三个数之和都小于target
        if (nums[i] + nums[n - 3] + nums[n - 2] + nums[n - 1] < target) continue;
        
        for (let j = i + 1; j < n - 2; j++) {
            // 跳过重复元素
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            
            // 剪枝
            if (nums[i] + nums[j] + nums[j + 1] + nums[j + 2] > target) break;
            if (nums[i] + nums[j] + nums[n - 2] + nums[n - 1] < target) continue;
            
            let left = j + 1;
            let right = n - 1;
            
            while (left < right) {
                const sum = nums[i] + nums[j] + nums[left] + nums[right];
                
                if (sum === target) {
                    result.push([nums[i], nums[j], nums[left], nums[right]]);
                    
                    // 跳过重复元素
                    while (left < right && nums[left] === nums[left + 1]) left++;
                    while (left < right && nums[right] === nums[right - 1]) right--;
                    
                    left++;
                    right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }
    
    return result;
};
```

**时间复杂度：** O(n³)  
**空间复杂度：** O(1)

---

## 4. 删除排序数组中的重复项 (Remove Duplicates from Sorted Array)

### 题目描述
给你一个 **升序排列** 的数组 `nums` ，请你 **原地** 删除重复出现的元素，使每个元素 **只出现一次** ，返回删除后数组的新长度。元素的 **相对顺序** 应该保持 **一致** 。

由于在某些语言中不能改变数组的长度，所以必须将结果放在数组 `nums` 的第一部分。更规范地说，如果在删除重复项之后有 `k` 个元素，那么 `nums` 的前 `k` 个元素应该保存最终结果。

将最终结果插入 `nums` 的前 `k` 个位置后返回 `k` 。

**示例 1：**
```
输入：nums = [1,1,2]
输出：2, nums = [1,2,_]
解释：函数应该返回新的长度 2 ，并且原数组 nums 的前两个元素被修改为 1, 2 。不需要考虑数组中超出新长度后面的元素。
```

**示例 2：**
```
输入：nums = [0,0,1,1,1,2,2,3,3,4]
输出：5, nums = [0,1,2,3,4,_,_,_,_,_]
解释：函数应该返回新的长度 5 ， 并且原数组 nums 的前五个元素被修改为 0, 1, 2, 3, 4 。不需要考虑数组中超出新长度后面的元素。
```

### 解法：双指针
```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
    if (nums.length === 0) return 0;
    
    let slow = 0; // 慢指针指向不重复元素的位置
    
    for (let fast = 1; fast < nums.length; fast++) {
        if (nums[fast] !== nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }
    
    return slow + 1;
};
```

**时间复杂度：** O(n)  
**空间复杂度：** O(1)

### 解法思路
1. 使用双指针技巧，慢指针 `slow` 指向不重复元素的最后位置
2. 快指针 `fast` 遍历数组，当发现新的不重复元素时，将其复制到慢指针位置
3. 最终返回不重复元素的个数

---

## 5. 移除元素 (Remove Element)

### 题目描述
给你一个数组 `nums` 和一个值 `val`，你需要 **原地** 移除所有数值等于 `val` 的元素，并返回移除后数组的新长度。

不要使用额外的数组空间，你必须仅使用 `O(1)` 额外空间并 **原地** 修改输入数组。

元素的顺序可以改变。你不需要考虑数组中超出新长度后面的元素。

**示例 1：**
```
输入：nums = [3,2,2,3], val = 3
输出：2, nums = [2,2,_,_]
解释：函数应该返回新的长度 2, 并且 nums 中的前两个元素均为 2。你不需要考虑数组中超出新长度后面的元素。
```

**示例 2：**
```
输入：nums = [0,1,2,2,3,0,4,2], val = 2
输出：5, nums = [0,1,4,0,3,_,_,_]
解释：函数应该返回新的长度 5, 并且 nums 中的前五个元素为 0, 1, 3, 0, 4。注意这五个元素可为任意顺序。你不需要考虑数组中超出新长度后面的元素。
```

### 解法一：双指针（快慢指针）
```javascript
/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
var removeElement = function(nums, val) {
    let slow = 0; // 慢指针指向下一个有效元素的位置
    
    for (let fast = 0; fast < nums.length; fast++) {
        if (nums[fast] !== val) {
            nums[slow] = nums[fast];
            slow++;
        }
    }
    
    return slow;
};
```

**时间复杂度：** O(n)  
**空间复杂度：** O(1)

### 解法二：双指针（左右指针）
```javascript
/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
var removeElement = function(nums, val) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        if (nums[left] === val) {
            nums[left] = nums[right];
            right--;
        } else {
            left++;
        }
    }
    
    return left;
};
```

**时间复杂度：** O(n)  
**空间复杂度：** O(1)

### 解法对比
- **解法一（快慢指针）**：保持元素的相对顺序，适合需要保持顺序的场景
- **解法二（左右指针）**：可能改变元素顺序，但在目标元素较少时效率更高

## 💡 总结

这5道题目都是数组操作的基础题，主要考查：

1. **双指针技巧** - 快慢指针、左右指针
2. **哈希表应用** - 空间换时间的思想
3. **排序 + 双指针** - 处理多数之和问题的经典模式
4. **原地操作** - 空间复杂度 O(1) 的要求
5. **去重技巧** - 跳过重复元素的处理

**关键技巧：**
- 两数之和用哈希表
- 多数之和用排序+双指针
- 数组原地操作用双指针
- 去重要先排序再跳过重复

我已经为您完整地整理了这5道经典算法题的题目描述和详细解答！每道题都包含了：

## 📋 **内容结构**

### 🎯 **每道题包含：**
1. **完整题目描述** - 清晰的问题陈述
2. **具体示例** - 输入输出实例
3. **多种解法** - 从暴力到优化的不同思路
4. **代码实现** - 完整的JavaScript代码
5. **复杂度分析** - 时间和空间复杂度
6. **解法对比** - 不同方法的优缺点

## 🔍 **题目概览**

### **1. 两数之和 (Two Sum)**
- **暴力解法**: O(n²) 时间，O(1) 空间
- **哈希表优化**: O(n) 时间，O(n) 空间 ⭐

### **2. 三数之和 (3Sum)**
- **排序 + 双指针**: O(n²) 时间，O(1) 空间
- **关键技巧**: 跳过重复元素，剪枝优化

### **3. 四数之和 (4Sum)**
- **双重循环 + 双指针**: O(n³) 时间，O(1) 空间
- **优化点**: 多层剪枝，避免无效计算

### **4. 删除排序数组中的重复项**
- **快慢双指针**: O(n) 时间，O(1) 空间
- **原地操作**: 不使用额外空间

### **5. 移除元素**
- **快慢指针**: 保持顺序，O(n) 时间
- **左右指针**: 可能乱序，但效率更高 ⭐

## 🎨 **核心技巧总结**

### **双指针模式**
- **快慢指针**: 用于数组原地操作
- **左右指针**: 用于有序数组查找
- **滑动窗口**: 用于子数组问题

### **哈希表优化**
- **空间换时间**: 降低时间复杂度
- **查找优化**: O(1) 时间查找

### **排序预处理**
- **去重基础**: 先排序再跳过重复
- **双指针前提**: 有序数组的双指针操作

### **剪枝优化**
- **提前终止**: 避免无效计算
- **边界检查**: 减少不必要的循环

这些题目是面试中的**高频考点**，掌握了这些基础操作和核心技巧，就能举一反三解决更复杂的算法问题！每种解法都有详细的注释和思路说明，方便理解和记忆。🚀