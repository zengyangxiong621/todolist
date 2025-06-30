# 什么是 CICD

## 定义

**CI/CD** 是 **持续集成（Continuous Integration）** 和 **持续部署/持续交付（Continuous Deployment/Continuous Delivery）** 的缩写，是现代软件开发中的核心实践。

## 核心概念

### CI - 持续集成（Continuous Integration）

**持续集成**是指开发团队频繁地将代码集成到主分支的实践。

```yaml
# CI的核心要素
持续集成:
  触发条件: 代码提交到版本控制系统
  自动化流程:
    - 代码检出
    - 构建项目 
    - 运行测试
    - 代码质量检查
    - 生成构建产物
  目标: 尽早发现集成问题
```

#### CI的典型流程
```javascript
// 开发者工作流程
const CIProcess = {
    开发者提交代码: "git push origin feature-branch",
    
    触发CI流程: {
        步骤1: "检出最新代码",
        步骤2: "安装依赖 (npm install)",
        步骤3: "代码检查 (ESLint, Prettier)", 
        步骤4: "运行单元测试 (Jest)",
        步骤5: "运行集成测试",
        步骤6: "构建项目 (webpack build)",
        步骤7: "生成测试报告"
    },
    
    结果反馈: "成功/失败通知给开发者"
};
```

### CD - 持续部署/持续交付

#### 持续交付（Continuous Delivery）
**持续交付**确保代码始终处于可部署状态，但部署到生产环境需要手动批准。

#### 持续部署（Continuous Deployment）  
**持续部署**在持续交付的基础上，自动将通过测试的代码部署到生产环境。

```yaml
# CD的区别
持续交付:
  特点: 自动化到预生产环境
  部署生产: 需要手动批准
  适用场景: 需要人工验证的关键系统

持续部署:
  特点: 完全自动化
  部署生产: 自动执行
  适用场景: 测试覆盖率高、风险可控的系统
```

## CICD完整流程

### 典型的CICD管道
```mermaid
graph LR
    A[代码提交] --> B[持续集成]
    B --> C[构建成功]
    C --> D[自动测试]
    D --> E[测试通过]
    E --> F[部署到测试环境]
    F --> G[集成测试]
    G --> H[部署到预生产]
    H --> I[用户验收测试]
    I --> J[部署到生产环境]
```

### 详细流程配置示例

#### GitHub Actions 配置
```yaml
# .github/workflows/cicd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # CI 阶段
  continuous-integration:
    runs-on: ubuntu-latest
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v3
      
    - name: 设置 Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 代码检查
      run: |
        npm run lint
        npm run format:check
        
    - name: 运行测试
      run: |
        npm run test:unit
        npm run test:integration
        
    - name: 构建项目
      run: npm run build
      
    - name: 上传构建产物
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/

  # CD 阶段
  continuous-delivery:
    needs: continuous-integration
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: 下载构建产物
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
        
    - name: 部署到测试环境
      run: |
        echo "部署到测试环境"
        # 实际部署命令
        
    - name: 运行端到端测试
      run: npm run test:e2e
      
    - name: 部署到生产环境
      if: success()
      run: |
        echo "部署到生产环境"
        # 生产环境部署命令
```

#### Jenkins Pipeline 示例
```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        DOCKER_IMAGE = 'myapp'
    }
    
    stages {
        stage('检出代码') {
            steps {
                checkout scm
            }
        }
        
        stage('安装依赖') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('代码质量检查') {
            parallel {
                stage('Lint检查') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('格式检查') {
                    steps {
                        sh 'npm run format:check'
                    }
                }
                stage('安全检查') {
                    steps {
                        sh 'npm audit'
                    }
                }
            }
        }
        
        stage('测试') {
            parallel {
                stage('单元测试') {
                    steps {
                        sh 'npm run test:unit'
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'test-results.xml'
                        }
                    }
                }
                stage('集成测试') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
            }
        }
        
        stage('构建') {
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }
        
        stage('Docker构建') {
            steps {
                script {
                    def image = docker.build("${DOCKER_IMAGE}:${BUILD_NUMBER}")
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('部署到测试环境') {
            steps {
                sh '''
                    kubectl set image deployment/myapp-test myapp=${DOCKER_IMAGE}:${BUILD_NUMBER} --namespace=test
                    kubectl rollout status deployment/myapp-test --namespace=test
                '''
            }
        }
        
        stage('端到端测试') {
            steps {
                sh 'npm run test:e2e'
            }
        }
        
        stage('部署到生产环境') {
            when {
                branch 'main'
            }
            steps {
                script {
                    input message: '是否部署到生产环境?', ok: '部署'
                }
                sh '''
                    kubectl set image deployment/myapp-prod myapp=${DOCKER_IMAGE}:${BUILD_NUMBER} --namespace=prod
                    kubectl rollout status deployment/myapp-prod --namespace=prod
                '''
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            mail to: 'team@company.com',
                 subject: "部署成功: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                 body: "构建和部署成功完成"
        }
        failure {
            mail to: 'team@company.com',
                 subject: "部署失败: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                 body: "构建或部署失败，请检查日志"
        }
    }
}
```

## 常用CICD工具

### 1. **云原生CI/CD平台**
```yaml
GitHub Actions:
  优势: 与GitHub深度集成、易于使用
  适用: 开源项目、小到中型团队
  
GitLab CI/CD:
  优势: 完整的DevOps平台
  适用: 企业级应用、私有化部署
  
Azure DevOps:
  优势: 微软生态集成
  适用: .NET项目、企业环境

AWS CodePipeline:
  优势: AWS生态集成
  适用: AWS云环境
```

### 2. **传统CI/CD工具**
```yaml
Jenkins:
  优势: 高度可定制、插件丰富
  适用: 复杂企业环境
  
CircleCI:
  优势: 配置简单、速度快
  适用: 现代Web应用
  
Travis CI:
  优势: 开源友好
  适用: 开源项目
```

### 3. **容器化CI/CD**
```yaml
Docker:
  作用: 构建一致的运行环境
  配置: Dockerfile

Kubernetes:
  作用: 容器编排和部署
  配置: YAML manifests

Helm:
  作用: Kubernetes应用包管理
  配置: Charts
```

## 实际项目配置示例

### Node.js项目的完整CICD
```json
// package.json
{
  "scripts": {
    "lint": "eslint src/ --ext .js,.ts",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "test:unit": "jest --coverage",
    "test:integration": "jest --config jest.integration.js",
    "test:e2e": "cypress run",
    "build": "webpack --mode production",
    "start:dev": "webpack serve --mode development",
    "start:prod": "node dist/server.js"
  }
}
```

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY dist/ ./dist/

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

```yaml
# docker-compose.yml (本地开发)
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      - redis
      
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    
volumes:
  postgres_data:
```

### React项目的CICD配置
```yaml
# .github/workflows/react-cicd.yml
name: React App CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: 设置Node.js
      uses: actions/setup-node@v3
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
      
    - name: 上传覆盖率报告
      uses: codecov/codecov-action@v3
      
    - name: 部署到GitHub Pages
      if: github.ref == 'refs/heads/main'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## CICD最佳实践

### 1. **代码质量保证**
```yaml
代码质量检查:
  - ESLint/TSLint: 代码规范检查
  - Prettier: 代码格式化
  - SonarQube: 代码质量分析
  - Snyk: 安全漏洞检查
  
测试策略:
  - 单元测试: 覆盖率 > 80%
  - 集成测试: 关键业务流程
  - 端到端测试: 用户关键路径
  - 性能测试: 响应时间和负载
```

### 2. **分支策略**
```yaml
Git Flow:
  main: 生产环境分支
  develop: 开发分支
  feature/*: 功能分支
  release/*: 发布分支
  hotfix/*: 热修复分支

部署策略:
  feature分支: 部署到开发环境
  develop分支: 部署到测试环境
  release分支: 部署到预生产环境
  main分支: 部署到生产环境
```

### 3. **环境管理**
```yaml
环境配置:
  开发环境 (DEV):
    - 最新功能
    - 快速反馈
    - 可能不稳定
    
  测试环境 (TEST):
    - 功能测试
    - 集成测试
    - 性能测试
    
  预生产环境 (STAGING):
    - 生产数据副本
    - 最终验证
    - 用户验收测试
    
  生产环境 (PROD):
    - 实际用户
    - 高可用性
    - 监控告警
```

### 4. **安全实践**
```yaml
安全检查:
  依赖检查: npm audit, yarn audit
  密钥管理: 使用secrets管理敏感信息
  镜像扫描: Docker镜像安全扫描
  HTTPS: 强制使用HTTPS
  
访问控制:
  - 最小权限原则
  - 双因子认证
  - 审计日志
  - 定期密钥轮换
```

## 监控和指标

### CICD指标监控
```javascript
// CICD关键指标
const CICDMetrics = {
    构建指标: {
        构建成功率: "成功构建 / 总构建次数",
        构建时间: "从触发到完成的时间",
        构建频率: "每天的构建次数"
    },
    
    部署指标: {
        部署成功率: "成功部署 / 总部署次数", 
        部署频率: "每天的部署次数",
        前置时间: "从代码提交到生产部署的时间"
    },
    
    质量指标: {
        测试覆盖率: "测试覆盖的代码比例",
        缺陷逃逸率: "生产环境发现的缺陷比例",
        故障恢复时间: "从故障发现到修复的时间"
    }
};
```

### 监控工具集成
```yaml
# 监控配置示例
监控工具:
  Prometheus: 指标收集
  Grafana: 可视化仪表板
  ELK Stack: 日志分析
  Jaeger: 分布式追踪
  New Relic: 应用性能监控
```

## 故障处理和回滚

### 自动回滚策略
```yaml
# Kubernetes 回滚配置
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

```bash
# 手动回滚命令
kubectl rollout undo deployment/myapp
kubectl rollout status deployment/myapp
```

## 总结

### CICD的核心价值
1. **提高开发效率**：自动化减少手动操作
2. **降低风险**：早期发现问题，减少生产故障
3. **加快交付速度**：频繁、可靠的发布
4. **提升代码质量**：强制代码检查和测试

### CICD成功要素
- **团队文化**：拥抱自动化和持续改进
- **工具选择**：适合团队和项目的工具链
- **流程优化**：不断优化和改进流程
- **监控反馈**：及时发现和解决问题

**CICD不仅仅是工具和流程，更是一种软件开发文化和理念，帮助团队更快、更可靠地交付高质量的软件！**