# 双指针技术

## 6. 合并两个有序数组 (Merge Sorted Array)

### 题目描述
给你两个按 **非递减顺序** 排列的整数数组 `nums1` 和 `nums2`，另有两个整数 `m` 和 `n` ，分别表示 `nums1` 和 `nums2` 中的元素数目。

请你 **合并** `nums2` 到 `nums1` 中，使合并后的数组同样按 **非递减顺序** 排列。

**注意：** 最终，合并后数组不应由函数返回，而是存储在数组 `nums1` 中。为了应对这种情况，`nums1` 的初始长度为 `m + n`，其中前 `m` 个元素表示应合并的元素，后 `n` 个元素为 `0` ，应忽略。`nums2` 的长度为 `n` 。

**示例 1：**
```
输入：nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
输出：[1,2,2,3,5,6]
解释：需要合并 [1,2,3] 和 [2,5,6] 。
合并结果是 [1,2,2,3,5,6] ，其中斜体加粗的元素来自 nums1 。
```

**示例 2：**
```
输入：nums1 = [1], m = 1, nums2 = [], n = 0
输出：[1]
解释：需要合并 [1] 和 [] 。
合并结果是 [1] 。
```

### 解法一：从前往后合并（需要额外空间）
```javascript
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function(nums1, m, nums2, n) {
    // 创建 nums1 的副本
    const nums1Copy = nums1.slice(0, m);
    
    let p1 = 0; // nums1Copy 的指针
    let p2 = 0; // nums2 的指针
    let p = 0;  // nums1 的指针
    
    // 比较并合并
    while (p1 < m && p2 < n) {
        if (nums1Copy[p1] <= nums2[p2]) {
            nums1[p] = nums1Copy[p1];
            p1++;
        } else {
            nums1[p] = nums2[p2];
            p2++;
        }
        p++;
    }
    
    // 处理剩余元素
    while (p1 < m) {
        nums1[p] = nums1Copy[p1];
        p1++;
        p++;
    }
    
    while (p2 < n) {
        nums1[p] = nums2[p2];
        p2++;
        p++;
    }
};
```

**时间复杂度：** O(m + n)  
**空间复杂度：** O(m)

### 解法二：从后往前合并（推荐）
```javascript
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function(nums1, m, nums2, n) {
    let p1 = m - 1; // nums1 有效元素的最后一个位置
    let p2 = n - 1; // nums2 的最后一个位置
    let p = m + n - 1; // nums1 的最后一个位置
    
    // 从后往前比较并填充
    while (p1 >= 0 && p2 >= 0) {
        if (nums1[p1] > nums2[p2]) {
            nums1[p] = nums1[p1];
            p1--;
        } else {
            nums1[p] = nums2[p2];
            p2--;
        }
        p--;
    }
    
    // 如果 nums2 还有剩余元素，复制到 nums1
    while (p2 >= 0) {
        nums1[p] = nums2[p2];
        p2--;
        p--;
    }
    
    // 如果 nums1 还有剩余元素，它们已经在正确位置了
};
```

**时间复杂度：** O(m + n)  
**空间复杂度：** O(1)

---

## 7. 反转字符串 (Reverse String)

### 题目描述
编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 `s` 的形式给出。

不要给另外的数组分配额外的空间，你必须**原地**修改输入数组、使用 O(1) 的额外空间解决这一问题。

**示例 1：**
```
输入：s = ["h","e","l","l","o"]
输出：["o","l","l","e","h"]
```

**示例 2：**
```
输入：s = ["H","a","n","n","a","h"]
输出：["h","a","n","n","a","H"]
```

### 解法：双指针
```javascript
/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // 交换字符
        [s[left], s[right]] = [s[right], s[left]];
        
        // 移动指针
        left++;
        right--;
    }
};

// 或者使用传统交换方式
var reverseStringTraditional = function(s) {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // 传统三步交换
        let temp = s[left];
        s[left] = s[right];
        s[right] = temp;
        
        left++;
        right--;
    }
};
```

**时间复杂度：** O(n)  
**空间复杂度：** O(1)

### 解法思路
1. 使用两个指针，一个指向字符串开头，一个指向结尾
2. 交换两个指针指向的字符
3. 向中间移动指针，直到相遇

---

## 8. 验证回文串 (Valid Palindrome)

### 题目描述
如果在将所有大写字符转换为小写字符、并移除所有非字母数字字符之后，短语正着读和反着读都一样。则可以认为该短语是一个 **回文串** 。

字母和数字都属于字母数字字符。

给你一个字符串 `s`，如果它是 **回文串** ，返回 `true` ；否则，返回 `false` 。

**示例 1：**
```
输入: s = "A man, a plan, a canal: Panama"
输出：true
解释："amanaplanacanalpanama" 是回文串。
```

**示例 2：**
```
输入：s = "race a car"
输出：false
解释："raceacar" 不是回文串。
```

### 解法一：预处理 + 双指针
```javascript
/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function(s) {
    // 预处理：转小写，只保留字母数字
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let left = 0;
    let right = cleaned.length - 1;
    
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
};
```

**时间复杂度：** O(n)  
**空间复杂度：** O(n) - 创建了新字符串

### 解法二：原地双指针（推荐）
```javascript
/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function(s) {
    // 判断字符是否为字母数字
    const isAlphaNumeric = (char) => {
        return /[a-zA-Z0-9]/.test(char);
    };
    
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // 跳过非字母数字字符
        while (left < right && !isAlphaNumeric(s[left])) {
            left++;
        }
        while (left < right && !isAlphaNumeric(s[right])) {
            right--;
        }
        
        // 比较字符（转为小写）
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
};
```

**时间复杂度：** O(n)  
**空间复杂度：** O(1)

---

## 9. 最长回文子串 (Longest Palindromic Substring)

### 题目描述
给你一个字符串 `s`，找到 `s` 中最长的回文子串。

**示例 1：**
```
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案。
```

**示例 2：**
```
输入：s = "cbbd"
输出："bb"
```

### 解法一：中心扩展法（推荐）
```javascript
/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function(s) {
    if (!s || s.length < 2) return s;
    
    let start = 0;
    let maxLen = 1;
    
    // 从中心向两边扩展
    const expandAroundCenter = (left, right) => {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            const currentLen = right - left + 1;
            if (currentLen > maxLen) {
                start = left;
                maxLen = currentLen;
            }
            left--;
            right++;
        }
    };
    
    for (let i = 0; i < s.length; i++) {
        // 奇数长度回文：以 i 为中心
        expandAroundCenter(i, i);
        
        // 偶数长度回文：以 i 和 i+1 为中心
        expandAroundCenter(i, i + 1);
    }
    
    return s.substring(start, start + maxLen);
};
```

**时间复杂度：** O(n²)  
**空间复杂度：** O(1)

### 解法二：动态规划
```javascript
/**
 * @param {string} s
 * @return {string}
 */
var longestPalindromDP = function(s) {
    const n = s.length;
    if (n < 2) return s;
    
    // dp[i][j] 表示 s[i...j] 是否为回文
    const dp = Array(n).fill().map(() => Array(n).fill(false));
    
    let start = 0;
    let maxLen = 1;
    
    // 单个字符都是回文
    for (let i = 0; i < n; i++) {
        dp[i][i] = true;
    }
    
    // 检查长度为 2 的子串
    for (let i = 0; i < n - 1; i++) {
        if (s[i] === s[i + 1]) {
            dp[i][i + 1] = true;
            start = i;
            maxLen = 2;
        }
    }
    
    // 检查长度大于 2 的子串
    for (let len = 3; len <= n; len++) {
        for (let i = 0; i <= n - len; i++) {
            const j = i + len - 1;
            
            if (s[i] === s[j] && dp[i + 1][j - 1]) {
                dp[i][j] = true;
                start = i;
                maxLen = len;
            }
        }
    }
    
    return s.substring(start, start + maxLen);
};
```

**时间复杂度：** O(n²)  
**空间复杂度：** O(n²)

### 解法三：Manacher算法（最优）
```javascript
/**
 * Manacher算法 - 线性时间复杂度
 * @param {string} s
 * @return {string}
 */
var longestPalindromeManacher = function(s) {
    if (!s) return "";
    
    // 预处理：在每个字符间插入 #
    let processed = "#";
    for (let char of s) {
        processed += char + "#";
    }
    
    const n = processed.length;
    const radius = new Array(n).fill(0); // 回文半径数组
    let center = 0; // 当前回文的中心
    let right = 0;  // 当前回文的右边界
    
    let maxLen = 0;
    let centerIndex = 0;
    
    for (let i = 0; i < n; i++) {
        // 利用回文的对称性
        if (i < right) {
            radius[i] = Math.min(right - i, radius[2 * center - i]);
        }
        
        // 尝试扩展
        try {
            while (i + radius[i] + 1 < n && 
                   i - radius[i] - 1 >= 0 && 
                   processed[i + radius[i] + 1] === processed[i - radius[i] - 1]) {
                radius[i]++;
            }
        } catch (e) {
            // 边界处理
        }
        
        // 更新中心和右边界
        if (i + radius[i] > right) {
            center = i;
            right = i + radius[i];
        }
        
        // 更新最长回文
        if (radius[i] > maxLen) {
            maxLen = radius[i];
            centerIndex = i;
        }
    }
    
    // 还原到原字符串的位置
    const start = (centerIndex - maxLen) / 2;
    return s.substring(start, start + maxLen);
};
```

**时间复杂度：** O(n)  
**空间复杂度：** O(n)

---

## 10. 盛最多水的容器 (Container With Most Water)

### 题目描述
给定一个长度为 `n` 的整数数组 `height` 。有 `n` 条垂线，第 `i` 条线的两个端点是 `(i, 0)` 和 `(i, height[i])` 。

找出其中的两条线，使得它们与 `x` 轴共同构成的容器可以容纳最多的水。

返回容器可以储存的最大水量。

**说明：** 你不能倾斜容器。

**示例 1：**
```
输入：height = [1,8,6,2,5,4,8,3,7]
输出：49 
解释：图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49。
```

**示例 2：**
```
输入：height = [1,1]
输出：1
```

### 解法一：暴力解法
```javascript
/**
 * @param {number[]} height
 * @return {number}
 */
var maxAreaBruteForce = function(height) {
    let maxArea = 0;
    
    for (let i = 0; i < height.length; i++) {
        for (let j = i + 1; j < height.length; j++) {
            const width = j - i;
            const minHeight = Math.min(height[i], height[j]);
            const area = width * minHeight;
            maxArea = Math.max(maxArea, area);
        }
    }
    
    return maxArea;
};
```

**时间复杂度：** O(n²)  
**空间复杂度：** O(1)

### 解法二：双指针（推荐）
```javascript
/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    let left = 0;
    let right = height.length - 1;
    let maxArea = 0;
    
    while (left < right) {
        // 计算当前面积
        const width = right - left;
        const minHeight = Math.min(height[left], height[right]);
        const area = width * minHeight;
        
        maxArea = Math.max(maxArea, area);
        
        // 移动较矮的指针
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxArea;
};
```

**时间复杂度：** O(n)  
**空间复杂度：** O(1)

### 算法思路详解
1. **为什么移动较矮的指针？**
   - 容器的水量由较矮的板决定
   - 移动较高的板不会增加水量（宽度减少，高度不变或减少）
   - 移动较矮的板有可能遇到更高的板，增加水量

2. **双指针收缩过程：**
```
初始: left=0, right=8
height = [1,8,6,2,5,4,8,3,7]
          ↑               ↑
        left            right

面积 = (8-0) * min(1,7) = 8 * 1 = 8
height[left] < height[right]，移动 left

第二步: left=1, right=8
height = [1,8,6,2,5,4,8,3,7]
            ↑             ↑
          left          right

面积 = (8-1) * min(8,7) = 7 * 7 = 49
height[left] > height[right]，移动 right

...继续直到 left >= right
```

## 💡 **双指针技术总结**

### **双指针的常见模式**

1. **对撞指针** - 从两端向中间移动
   - 反转字符串、验证回文、盛水容器

2. **快慢指针** - 一个快一个慢
   - 删除重复元素、移除元素

3. **滑动窗口** - 维护一个窗口
   - 最长子串、子数组问题

4. **归并指针** - 合并两个有序序列
   - 合并有序数组、归并排序

### **关键技巧**

- **移动策略** - 根据条件决定移动哪个指针
- **边界处理** - 注意指针越界和相遇条件
- **优化剪枝** - 提前终止不必要的计算
- **空间优化** - 原地操作，避免额外空间

### **适用场景**

- ✅ **有序数组** - 双指针效果最佳
- ✅ **对称结构** - 回文、反转等问题
- ✅ **区间问题** - 需要考虑两个边界
- ✅ **优化搜索** - 减少搜索空间

双指针技术是算法面试的**高频考点**，掌握这些经典题目和解题模式，能够举一反三解决更多相关问题！🚀 