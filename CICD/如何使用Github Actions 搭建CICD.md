# 如何使用GitHub Actions搭建CI/CD

## GitHub Actions基础概念

### 核心组件
```yaml
GitHub Actions架构:
  Workflow: 工作流程（一个完整的CI/CD流程）
  Job: 作业（工作流程中的一个任务组）
  Step: 步骤（作业中的单个操作）
  Action: 动作（可重用的代码单元）
  Runner: 运行器（执行工作流程的服务器）
```

### 基本语法结构
```yaml
# .github/workflows/example.yml
name: 工作流程名称
on: 触发条件
jobs:
  job_id:
    runs-on: 运行环境
    steps:
      - name: 步骤名称
        uses: 使用的Action
        with: 参数配置
      - name: 另一个步骤
        run: 执行的命令
```

## 第一步：创建基础CI工作流

### 简单的Node.js CI配置
```yaml
# .github/workflows/ci.yml
name: Continuous Integration

# 触发条件
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

# 作业定义
jobs:
  test:
    # 运行环境
    runs-on: ubuntu-latest
    
    # Node.js版本策略
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    # 检出代码
    - name: 检出代码
      uses: actions/checkout@v4
      
    # 设置Node.js环境
    - name: 设置Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    # 安装依赖
    - name: 安装依赖
      run: npm ci
      
    # 代码检查
    - name: 运行ESLint
      run: npm run lint
      
    # 运行测试
    - name: 运行测试
      run: npm run test
      
    # 生成覆盖率报告
    - name: 生成测试覆盖率
      run: npm run test:coverage
      
    # 上传覆盖率到Codecov
    - name: 上传覆盖率报告
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

### 添加构建步骤
```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 运行测试
      run: npm test
      
    - name: 构建项目
      run: npm run build
      
    # 上传构建产物
    - name: 上传构建产物
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/
        retention-days: 30
        
    # 构建Docker镜像
    - name: 构建Docker镜像
      run: |
        docker build -t my-app:${{ github.sha }} .
        docker tag my-app:${{ github.sha }} my-app:latest
```

## 第二步：配置持续部署

### 基础部署配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_run:
    workflows: ["Build and Test"]
    types:
      - completed

jobs:
  deploy:
    runs-on: ubuntu-latest
    # 只有在CI成功后才执行部署
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 构建项目
      run: npm run build
      
    # 部署到服务器
    - name: 部署到生产服务器
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        port: ${{ secrets.PRODUCTION_PORT }}
        script: |
          cd /var/www/my-app
          git pull origin main
          npm install --production
          npm run build
          pm2 restart my-app
          pm2 save
```

### 多环境部署
```yaml
# .github/workflows/deploy-environments.yml
name: Deploy to Environments

on:
  push:
    branches: [ main, develop, staging ]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 部署到Staging
      uses: ./.github/actions/deploy
      with:
        environment: staging
        host: ${{ secrets.STAGING_HOST }}
        user: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    # 手动审批
    - name: 等待部署审批
      uses: trstringer/manual-approval@v1
      with:
        secret: ${{ secrets.GITHUB_TOKEN }}
        approvers: admin,team-lead
        minimum-approvals: 1
        issue-title: "生产环境部署审批"
        
    - name: 部署到Production
      uses: ./.github/actions/deploy
      with:
        environment: production
        host: ${{ secrets.PRODUCTION_HOST }}
        user: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
```

## 第三步：Docker集成

### Docker构建和推送
```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [ main, develop ]
    tags: [ 'v*' ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    # 设置Docker Buildx
    - name: 设置Docker Buildx
      uses: docker/setup-buildx-action@v3
      
    # 登录到Container Registry
    - name: 登录到Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
        
    # 提取元数据
    - name: 提取元数据
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          
    # 构建和推送Docker镜像
    - name: 构建并推送Docker镜像
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

### 多阶段Dockerfile优化
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# 创建用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制文件
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

## 第四步：高级配置

### 自定义Action
```yaml
# .github/actions/deploy/action.yml
name: 'Deploy Application'
description: '部署应用到指定环境'
inputs:
  environment:
    description: '部署环境'
    required: true
  host:
    description: '服务器地址'
    required: true
  user:
    description: '用户名'
    required: true
  key:
    description: 'SSH私钥'
    required: true

runs:
  using: 'composite'
  steps:
    - name: 部署应用
      shell: bash
      run: |
        echo "部署到 ${{ inputs.environment }} 环境"
        
    - name: SSH部署
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ inputs.host }}
        username: ${{ inputs.user }}
        key: ${{ inputs.key }}
        script: |
          cd /var/www/app
          git pull origin main
          npm install --production
          npm run build
          pm2 restart app
          echo "部署完成"
```

### 条件执行和矩阵策略
```yaml
# .github/workflows/advanced.yml
name: Advanced CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # 代码质量检查
  quality:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 代码质量检查
      run: |
        npm run lint
        npm run format:check
        npm audit --audit-level moderate
        
  # 多环境测试
  test:
    runs-on: ${{ matrix.os }}
    needs: quality
    
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
        include:
          - os: ubuntu-latest
            node-version: 18
            coverage: true
        exclude:
          - os: windows-latest
            node-version: 16
            
    steps:
    - uses: actions/checkout@v4
    
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        
    - name: 运行测试
      run: npm test
      
    - name: 上传覆盖率
      if: matrix.coverage
      uses: codecov/codecov-action@v3
      
  # 安全扫描
  security:
    runs-on: ubuntu-latest
    needs: quality
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 安全扫描
      uses: github/super-linter@v4
      env:
        DEFAULT_BRANCH: main
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        
  # 性能测试
  performance:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 性能测试
      run: |
        npm run test:performance
        npm run lighthouse
        
  # 部署
  deploy:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 部署到生产环境
      run: echo "部署到生产环境"
```

## 第五步：Secrets和环境管理

### Secrets配置
```yaml
# GitHub仓库设置 -> Secrets and variables -> Actions

# 必需的Secrets:
PRODUCTION_HOST: 生产服务器地址
PRODUCTION_USER: 服务器用户名
PRODUCTION_SSH_KEY: SSH私钥
DATABASE_URL: 数据库连接字符串
API_KEY: 第三方API密钥
SLACK_WEBHOOK: Slack通知Webhook
```

### 环境变量管理
```yaml
# .github/workflows/env-management.yml
name: Environment Management

on:
  push:
    branches: [ main, develop ]

env:
  NODE_ENV: production
  APP_NAME: my-application

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    # 环境配置
    environment:
      name: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
      url: ${{ steps.deploy.outputs.url }}
      
    env:
      API_URL: ${{ github.ref == 'refs/heads/main' && 'https://api.prod.com' || 'https://api.staging.com' }}
      
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置环境变量
      run: |
        echo "DEPLOY_ENV=${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}" >> $GITHUB_ENV
        echo "BUILD_NUMBER=${{ github.run_number }}" >> $GITHUB_ENV
        
    - name: 显示环境信息
      run: |
        echo "部署环境: $DEPLOY_ENV"
        echo "构建号: $BUILD_NUMBER"
        echo "API地址: $API_URL"
```

## 第六步：通知和报告

### Slack通知集成
```yaml
# .github/workflows/notifications.yml
name: CI/CD with Notifications

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 构建应用
      run: npm run build
      
    # 成功通知
    - name: 发送成功通知
      if: success()
      uses: 8398a7/action-slack@v3
      with:
        status: success
        channel: '#deployments'
        text: '✅ 部署成功!'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        
    # 失败通知  
    - name: 发送失败通知
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        channel: '#deployments'
        text: '❌ 部署失败!'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 自定义通知
```yaml
# 自定义通知步骤
- name: 发送部署通知
  if: always()
  run: |
    STATUS="${{ job.status }}"
    if [ "$STATUS" = "success" ]; then
      EMOJI="✅"
      COLOR="good"
    else
      EMOJI="❌"
      COLOR="danger"
    fi
    
    curl -X POST -H 'Content-type: application/json' \
      --data "{
        \"channel\": \"#deployments\",
        \"username\": \"GitHub Actions\",
        \"attachments\": [{
          \"color\": \"$COLOR\",
          \"fields\": [{
            \"title\": \"仓库\",
            \"value\": \"${{ github.repository }}\",
            \"short\": true
          }, {
            \"title\": \"分支\",
            \"value\": \"${{ github.ref_name }}\",
            \"short\": true
          }, {
            \"title\": \"状态\",
            \"value\": \"$EMOJI $STATUS\",
            \"short\": true
          }, {
            \"title\": \"提交\",
            \"value\": \"${{ github.sha }}\",
            \"short\": true
          }]
        }]
      }" \
      ${{ secrets.SLACK_WEBHOOK }}
```

## 第七步：实际项目示例

### React项目CI/CD
```yaml
# .github/workflows/react-app.yml
name: React App CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'

jobs:
  # 测试和构建
  test-and-build:
    runs-on: ubuntu-latest
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 运行测试
      run: |
        npm run test:coverage
        npm run test:accessibility
        
    - name: 构建应用
      run: npm run build
      env:
        CI: false
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
        
    - name: 上传构建产物
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: build/
        
    # 上传到GitHub Pages
    - name: 部署到GitHub Pages
      if: github.ref == 'refs/heads/main'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
        
  # E2E测试
  e2e-test:
    runs-on: ubuntu-latest
    needs: test-and-build
    if: github.event_name == 'pull_request'
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 下载构建产物
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: build/
        
    - name: 运行E2E测试
      uses: cypress-io/github-action@v6
      with:
        start: npm run serve
        wait-on: 'http://localhost:3000'
        browser: chrome
        
    - name: 上传Cypress截图
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: cypress-screenshots
        path: cypress/screenshots/
```

### Node.js API项目
```yaml
# .github/workflows/nodejs-api.yml
name: Node.js API CI/CD

on:
  push:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 运行数据库迁移
      run: npm run migrate
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        
    - name: 运行测试
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
        
  deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 部署到Heroku
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "my-nodejs-api"
        heroku_email: "your-email@example.com"
```

## 最佳实践

### 1. **工作流程优化**
```yaml
# 缓存优化
- name: 缓存Node.js模块
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# 并行执行
jobs:
  test:
    strategy:
      matrix:
        test-type: [unit, integration, e2e]
    steps:
      - name: 运行 ${{ matrix.test-type }} 测试
        run: npm run test:${{ matrix.test-type }}
```

### 2. **安全实践**
```yaml
# 最小权限原则
permissions:
  contents: read
  packages: write
  
# 安全扫描
- name: 安全扫描
  uses: github/super-linter@v4
  env:
    DEFAULT_BRANCH: main
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    VALIDATE_JAVASCRIPT_ES: true
    VALIDATE_DOCKERFILE_HADOLINT: true
```

### 3. **错误处理**
```yaml
# 重试机制
- name: 运行测试（带重试）
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: npm test

# 条件执行
- name: 部署到生产环境
  if: github.ref == 'refs/heads/main' && success()
  run: npm run deploy:production
```

### 4. **监控和调试**
```yaml
# 输出调试信息
- name: 调试信息
  run: |
    echo "当前分支: ${{ github.ref }}"
    echo "提交SHA: ${{ github.sha }}"
    echo "运行ID: ${{ github.run_id }}"
    echo "Actor: ${{ github.actor }}"
    
# 保存日志
- name: 上传日志
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: logs
    path: logs/
```

## 常见问题和解决方案

### 1. **构建失败**
```yaml
# 问题诊断
- name: 诊断构建问题
  if: failure()
  run: |
    echo "Node版本: $(node --version)"
    echo "NPM版本: $(npm --version)"
    echo "当前目录: $(pwd)"
    echo "文件列表: $(ls -la)"
    npm config list
```

### 2. **部署失败**
```yaml
# 回滚机制
- name: 健康检查
  id: health-check
  run: |
    sleep 30
    curl -f http://your-app.com/health || exit 1
    
- name: 回滚部署
  if: failure() && steps.health-check.outcome == 'failure'
  run: |
    echo "健康检查失败，开始回滚"
    # 回滚命令
```

### 3. **性能优化**
```yaml
# 构建缓存
- name: 缓存Docker层
  uses: actions/cache@v3
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-
```

## 总结

### GitHub Actions的优势
1. **原生集成** - 与GitHub完美集成
2. **简单易用** - YAML配置，学习成本低
3. **丰富生态** - 大量现成的Actions可用
4. **免费额度** - 公开仓库免费，私有仓库有免费额度

### 成功要素
- **渐进式实施** - 从简单开始，逐步完善
- **模块化设计** - 使用可重用的Actions
- **安全第一** - 妥善管理Secrets和权限
- **监控反馈** - 建立完善的通知和监控机制

**GitHub Actions让CI/CD变得简单而强大，是现代软件开发的理想选择！** 🚀 