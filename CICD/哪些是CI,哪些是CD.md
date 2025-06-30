很好的问题！让我为您详细解释 CI/CD 的概念，并分析我们项目中哪些是 CI，哪些是 CD：

## 🔍 CI/CD 概念解释

### CI (Continuous Integration - 持续集成)
- **目的**：自动化代码集成和测试
- **主要活动**：代码检出、依赖安装、构建、测试、代码质量检查

### CD (Continuous Deployment/Delivery - 持续部署/交付)
- **目的**：自动化应用部署到目标环境
- **主要活动**：打包、部署、环境配置、服务启动

## 📋 我们项目中的 CI/CD 分析

### 🔄 CI (持续集成) 部分

在 GitHub Actions 虚拟机上执行：

```yaml
# === CI 阶段 ===
steps:
# 1. 代码集成
- name: 检出代码
  uses: actions/checkout@v4

# 2. 环境准备
- name: 设置 Node.js 环境
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'

# 3. 依赖管理
- name: 安装项目依赖
  run: npm ci

# 4. 构建/编译
- name: 构建 VitePress 网站
  run: npm run docs:build
```

**CI 特征**：
- ✅ 代码集成验证
- ✅ 依赖安装和管理
- ✅ 项目构建
- ✅ 在标准化环境中执行
- ✅ 快速反馈构建状态

### 🚀 CD (持续部署) 部分

在目标服务器上执行：

```yaml
# === CD 阶段 ===
# 1. 文件传输
- name: 传输部署文件到服务器
  uses: appleboy/scp-action@v0.1.7

# 2. 服务器部署
- name: 在服务器上构建和部署
  script: |
    # 环境准备
    docker stop zyx-blog || true
    docker rm zyx-blog || true
    docker rmi zyx-blog:latest || true
    
    # 应用打包
    docker build -t zyx-blog:latest . --no-cache
    
    # 服务部署
    docker run -d \
      --name zyx-blog \
      --restart unless-stopped \
      -p 80:80 \
      zyx-blog:latest
    
    # 部署验证
    docker ps | grep zyx-blog
    curl -f http://localhost/health
```

**CD 特征**：
- ✅ 应用打包和容器化
- ✅ 服务器环境配置
- ✅ 服务启动和管理
- ✅ 健康检查和验证
- ✅ 生产环境部署

## 📊 详细分工表

| 阶段 | 位置 | 步骤 | 类型 | 作用 |
|------|------|------|------|------|
| **代码检出** | GitHub Actions | `checkout` | **CI** | 获取最新代码 |
| **环境设置** | GitHub Actions | `setup-node` | **CI** | 准备构建环境 |
| **依赖安装** | GitHub Actions | `npm ci` | **CI** | 安装项目依赖 |
| **项目构建** | GitHub Actions | `npm run docs:build` | **CI** | 编译源码 |
| **文件传输** | GitHub → 服务器 | `scp-action` | **CD** | 部署准备 |
| **环境清理** | 服务器 | `docker stop/rm` | **CD** | 部署前清理 |
| **镜像构建** | 服务器 | `docker build` | **CD** | 应用打包 |
| **服务部署** | 服务器 | `docker run` | **CD** | 启动服务 |
| **健康检查** | 服务器 | `curl health` | **CD** | 部署验证 |

## 🎯 为什么这样分工？

### CI 在 GitHub Actions 的优势：
- **标准化环境**：确保构建的一致性
- **资源丰富**：充足的 CPU 和内存
- **网络良好**：快速下载依赖
- **成本效益**：GitHub 提供免费的构建时间

### CD 在服务器的优势：
- **目标环境**：直接在生产环境部署
- **网络隔离**：避免网络传输大型镜像
- **资源控制**：使用自己的服务器资源
- **安全性**：敏感操作在自己的环境中

## 🔄 完整 CI/CD 流程图

```
代码推送 → CI (GitHub Actions) → CD (服务器)
    ↓           ↓                    ↓
  main分支    构建验证              生产部署
    ↓           ↓                    ↓
  触发器      静态检查              服务启动
              ↓                    ↓
            构建产物              健康检查
              ↓                    ↓
            传输文件              部署完成
```

## 💡 总结

- **CI (前4步)**：在 GitHub Actions 上进行代码集成、构建和验证
- **CD (后5步)**：在服务器上进行应用部署、配置和启动

这种混合模式结合了云端 CI 的便利性和本地 CD 的可控性，是一个很实用的部署策略！