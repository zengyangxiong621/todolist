// 以搜索引擎的爬虫算法来爬取一个网站

const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const robotsParser = require('robots-parser');
const { PriorityQueue } = require('@datastructures-js/priority-queue');
const BloomFilter = require('bloom-filters').BloomFilter;
const fs = require('fs');
const path = require('path');

class WebCrawler {
  constructor(options = {}) {
    // 初始化配置
    this.options = {
      startUrls: [],                // 起始URL数组
      maxDepth: 3,                  // 最大爬取深度
      maxPages: 1000,               // 最大爬取页面数
      concurrency: 5,               // 并发请求数
      delay: 1000,                  // 请求间隔(毫秒)
      respectRobotsTxt: true,       // 是否遵循robots.txt
      userAgent: 'MyCustomBot/1.0', // 用户代理
      outputDir: './crawled_data',  // 输出目录
      ...options
    };

    // 初始化数据结构
    this.urlQueue = new PriorityQueue((a, b) => a.priority - b.priority); // 优先队列
    this.visited = new BloomFilter(10000, 5);                          // 布隆过滤器记录已访问URL
    this.robotsTxtCache = new Map();                                      // 缓存robots.txt
    this.crawledPages = 0;                                                // 已爬取页面计数
    this.activeCrawlers = 0;                                              // 活动爬虫数
    this.domainAccessTimes = new Map();                                   // 记录域名最后访问时间

    // 创建输出目录
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }
  }

  // 初始化爬虫
  initialize() {
    // 将起始URL添加到队列
    this.options.startUrls.forEach(startUrl => {
      this.addUrlToQueue(startUrl, 0, 1); // 深度0，优先级1(最高)
    });
  }

  // 添加URL到队列
  addUrlToQueue(urlString, depth, priority) {
    try {
      const normalizedUrl = this.normalizeUrl(urlString);
      
      // 如果URL已访问或深度超过限制，则跳过
      if (this.visited.has(normalizedUrl) || depth > this.options.maxDepth) {
        return;
      }
      
      // 将URL标记为已访问
      this.visited.add(normalizedUrl);
      
      // 添加到优先队列
      this.urlQueue.enqueue({
        url: normalizedUrl,
        depth,
        priority
      });
      
      console.log(`添加URL到队列: ${normalizedUrl} (深度: ${depth}, 优先级: ${priority})`);
    } catch (error) {
      console.error(`添加URL到队列时出错: ${urlString}`, error.message);
    }
  }

  // 规范化URL
  normalizeUrl(urlString) {
    try {
      const parsedUrl = new URL(urlString);
      
      // 移除URL中的片段
      parsedUrl.hash = '';
      
      // 移除某些参数(如会话ID、跟踪参数等)
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'PHPSESSID'];
      const params = new URLSearchParams(parsedUrl.search);
      
      paramsToRemove.forEach(param => {
        params.delete(param);
      });
      
      parsedUrl.search = params.toString();
      
      return parsedUrl.toString();
    } catch (error) {
      console.error(`规范化URL时出错: ${urlString}`, error.message);
      return urlString;
    }
  }

  // 检查是否允许爬取URL
  async isAllowedByRobotsTxt(urlString) {
    if (!this.options.respectRobotsTxt) {
      return true;
    }
    
    try {
      const parsedUrl = new URL(urlString);
      const hostname = parsedUrl.hostname;
      const robotsTxtUrl = `${parsedUrl.protocol}//${hostname}/robots.txt`;
      
      // 检查缓存
      if (!this.robotsTxtCache.has(hostname)) {
        try {
          // 获取robots.txt
          const response = await axios.get(robotsTxtUrl, {
            headers: { 'User-Agent': this.options.userAgent }
          });
          
          // 解析robots.txt
          const robotsTxt = robotsParser(robotsTxtUrl, response.data);
          this.robotsTxtCache.set(hostname, robotsTxt);
          
          console.log(`获取并解析robots.txt: ${robotsTxtUrl}`);
        } catch (error) {
          // 如果无法获取robots.txt，假设允许爬取
          console.warn(`无法获取robots.txt: ${robotsTxtUrl}`, error.message);
          this.robotsTxtCache.set(hostname, null);
        }
      }
      
      const robotsTxt = this.robotsTxtCache.get(hostname);
      
      // 如果没有robots.txt或解析失败，默认允许爬取
      if (!robotsTxt) {
        return true;
      }
      
      // 检查是否允许爬取
      const isAllowed = robotsTxt.isAllowed(urlString, this.options.userAgent);
      
      // 获取爬取延迟
      const crawlDelay = robotsTxt.getCrawlDelay(this.options.userAgent);
      if (crawlDelay) {
        // 更新爬取延迟(取较大值)
        this.options.delay = Math.max(this.options.delay, crawlDelay * 1000);
      }
      
      return isAllowed;
    } catch (error) {
      console.error(`检查robots.txt时出错: ${urlString}`, error.message);
      return true; // 出错时默认允许爬取
    }
  }

  // 获取页面内容
  async fetchPage(urlString) {
    try {
      // 解析URL获取域名
      const parsedUrl = new URL(urlString);
      const domain = parsedUrl.hostname;
      
      // 检查域名访问频率
      if (this.domainAccessTimes.has(domain)) {
        const lastAccessTime = this.domainAccessTimes.get(domain);
        const currentTime = Date.now();
        const timeSinceLastAccess = currentTime - lastAccessTime;
        
        // 如果距离上次访问时间小于延迟时间，则等待
        if (timeSinceLastAccess < this.options.delay) {
          const waitTime = this.options.delay - timeSinceLastAccess;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      // 更新域名最后访问时间
      this.domainAccessTimes.set(domain, Date.now());
      
      // 发送HTTP请求
      const response = await axios.get(urlString, {
        headers: {
          'User-Agent': this.options.userAgent,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        },
        timeout: 10000, // 10秒超时
        maxRedirects: 5
      });
      
      return {
        url: urlString,
        status: response.status,
        headers: response.headers,
        content: response.data
      };
    } catch (error) {
      console.error(`获取页面内容时出错: ${urlString}`, error.message);
      return null;
    }
  }

  // 解析页面内容，提取链接
  parsePage(page) {
    if (!page || !page.content) {
      return { links: [] };
    }
    
    try {
      const $ = cheerio.load(page.content);
      const baseUrl = page.url;
      const links = [];
      
      // 提取所有链接
      $('a').each((i, element) => {
        const href = $(element).attr('href');
        if (!href) return;
        
        try {
          // 将相对URL转换为绝对URL
          const absoluteUrl = url.resolve(baseUrl, href);
          
          // 只处理HTTP和HTTPS链接
          if (absoluteUrl.startsWith('http://') || absoluteUrl.startsWith('https://')) {
            // 检查是否有nofollow属性
            const rel = $(element).attr('rel');
            const hasNofollow = rel && rel.includes('nofollow');
            
            // 获取锚文本
            const anchorText = $(element).text().trim();
            
            links.push({
              url: absoluteUrl,
              anchorText,
              nofollow: hasNofollow
            });
          }
        } catch (error) {
          console.error(`解析链接时出错: ${href}`, error.message);
        }
      });
      
      // 提取页面标题和描述
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || '';
      
      // 提取页面内容文本
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
      
      return {
        title,
        description,
        bodyText: bodyText.substring(0, 1000), // 只保存前1000个字符
        links
      };
    } catch (error) {
      console.error(`解析页面时出错: ${page.url}`, error.message);
      return { links: [] };
    }
  }

  // 保存页面数据
  savePage(url, pageData) {
    try {
      // 创建文件名
      const urlObj = new URL(url);
      const filename = path.join(
        this.options.outputDir,
        `${urlObj.hostname}_${urlObj.pathname.replace(/\//g, '_').replace(/^_/, '')}.json`
      );
      
      // 保存数据
      fs.writeFileSync(
        filename,
        JSON.stringify({
          url,
          crawlTime: new Date().toISOString(),
          ...pageData
        }, null, 2)
      );
      
      console.log(`保存页面数据: ${url} -> ${filename}`);
    } catch (error) {
      console.error(`保存页面数据时出错: ${url}`, error.message);
    }
  }

  // 处理单个URL
  async processUrl(urlObj) {
    const { url: urlString, depth } = urlObj;
    
    // 检查是否允许爬取
    const isAllowed = await this.isAllowedByRobotsTxt(urlString);
    if (!isAllowed) {
      console.log(`robots.txt不允许爬取: ${urlString}`);
      return;
    }
    
    // 获取页面内容
    const page = await this.fetchPage(urlString);
    if (!page) {
      return;
    }
    
    // 解析页面
    const pageData = this.parsePage(page);
    
    // 保存页面数据
    this.savePage(urlString, pageData);
    
    // 增加已爬取页面计数
    this.crawledPages++;
    
    // 如果未达到最大深度，将提取的链接添加到队列
    if (depth < this.options.maxDepth) {
      pageData.links.forEach(link => {
        // 计算链接优先级(可以根据需要调整优先级计算逻辑)
        let priority = depth + 1;
        
        // 如果有nofollow属性，降低优先级
        if (link.nofollow) {
          priority += 2;
        }
        
        // 添加到队列
        this.addUrlToQueue(link.url, depth + 1, priority);
      });
    }
  }

  // 启动爬虫
  async start() {
    console.log('爬虫启动...');
    this.initialize();
    
    // 主循环
    while (!this.urlQueue.isEmpty() && this.crawledPages < this.options.maxPages) {
      // 控制并发数
      while (this.activeCrawlers < this.options.concurrency && !this.urlQueue.isEmpty() && this.crawledPages < this.options.maxPages) {
        const urlObj = this.urlQueue.dequeue();
        this.activeCrawlers++;
        
        // 异步处理URL
        this.processUrl(urlObj).finally(() => {
          this.activeCrawlers--;
        });
        
        // 短暂延迟，避免同时发起大量请求
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 等待一段时间再检查
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 等待所有活动爬虫完成
    while (this.activeCrawlers > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`爬虫完成，共爬取 ${this.crawledPages} 个页面`);
  }
}

// 使用示例
async function main() {
  const crawler = new WebCrawler({
    startUrls: ['https://www.vitaminworld.com/'],
    maxDepth: 2,
    maxPages: 100,
    concurrency: 3,
    delay: 2000,
    respectRobotsTxt: true,
    outputDir: './crawled_data'
  });
  
  await crawler.start();
}

// 运行爬虫
main().catch(error => {
  console.error('爬虫运行出错:', error);
});