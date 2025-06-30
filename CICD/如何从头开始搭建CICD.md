# 如何从头开始搭建CICD

## 前期规划和准备

### 1. **需求分析**
```yaml
项目评估:
  项目类型: Web应用/移动应用/API服务
  技术栈: Node.js/Python/Java/.NET等
  团队规模: 小团队(2-5人)/中型团队(5-20人)/大型团队(20+人)
  发布频率: 每日/每周/每月
  
环境需求:
  开发环境: 本地开发环境
  测试环境: 自动化测试环境
  预生产环境: 生产环境镜像
  生产环境: 实际用户环境
```

### 2. **技术选型**
```yaml
版本控制: 
  推荐: Git (GitHub/GitLab/Bitbucket)
  分支策略: Git Flow/GitHub Flow

CI/CD工具选择:
  云服务: GitHub Actions/GitLab CI/Azure DevOps
  自建服务: Jenkins/TeamCity/Bamboo
  
容器化:
  推荐: Docker + Kubernetes
  简化方案: Docker + Docker Compose
  
监控告警:
  推荐: Prometheus + Grafana
  简化方案: 基础日志监控
```

### 3. **基础设施准备**
```yaml
服务器资源:
  CI/CD服务器: 4核8GB内存起步
  测试环境服务器: 根据应用需求
  生产环境服务器: 高可用配置
  
网络配置:
  内网互通: CI/CD服务器到目标环境
  外网访问: Webhook接收、镜像拉取
  安全设置: 防火墙、VPN、SSL证书
```

## 第一步：搭建版本控制系统

### Git仓库初始化
```bash
# 创建项目仓库
git init my-project
cd my-project

# 设置基本配置
git config user.name "Your Name"
git config user.email "your.email@company.com"

# 创建基础目录结构
mkdir -p {src,tests,docs,scripts,config}
touch README.md .gitignore

# 初始提交
git add .
git commit -m "Initial commit: project structure"

# 连接远程仓库
git remote add origin https://github.com/username/my-project.git
git push -u origin main
```

### 分支策略设置
```bash
# 创建开发分支
git checkout -b develop
git push -u origin develop

# 设置分支保护规则（在GitHub/GitLab界面设置）
# - main分支需要PR审核
# - develop分支需要通过CI检查
# - 禁止直接推送到main分支
```

## 第二步：选择并搭建CI/CD工具

### 方案一：使用GitHub Actions（推荐新手）

#### 创建基础工作流
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 运行测试
      run: npm test
      
    - name: 代码覆盖率
      run: npm run test:coverage
      
    - name: 上传覆盖率报告
      uses: codecov/codecov-action@v3
```

#### 添加部署工作流
```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: test
    
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
      
    - name: 部署到服务器
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.PRIVATE_KEY }}
        script: |
          cd /var/www/my-project
          git pull origin main
          npm install --production
          npm run build
          pm2 restart my-project
```

### 方案二：自建Jenkins

#### Jenkins安装和配置
```bash
# 在Ubuntu上安装Jenkins
sudo apt update
sudo apt install openjdk-11-jdk

# 添加Jenkins仓库
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'

# 安装Jenkins
sudo apt update
sudo apt install jenkins

# 启动Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 获取初始密码
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### Jenkins基础配置
```groovy
// Jenkinsfile - 声明式流水线
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        APP_NAME = 'my-project'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    node --version
                    npm --version
                    npm ci
                '''
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Security Audit') {
                    steps {
                        sh 'npm audit --audit-level moderate'
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh '''
                    echo "Deploying to staging environment"
                    # 实际部署命令
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    input message: 'Deploy to production?', ok: 'Deploy'
                }
                sh '''
                    echo "Deploying to production environment"
                    # 实际部署命令
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
                 subject: "Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                 body: "Build completed successfully"
        }
        failure {
            mail to: 'team@company.com',
                 subject: "Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                 body: "Build failed. Please check the console output."
        }
    }
}
```

## 第三步：容器化应用

### Docker配置
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# 复制依赖和应用文件
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

# 构建应用
RUN npm run build

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
      - redis
    networks:
      - app-network
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Kubernetes部署配置
```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-project
  labels:
    app: my-project
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-project
  template:
    metadata:
      labels:
        app: my-project
    spec:
      containers:
      - name: my-project
        image: my-project:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: my-project-service
spec:
  selector:
    app: my-project
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 第四步：环境管理和部署脚本

### 环境配置管理
```bash
# scripts/deploy.sh
#!/bin/bash

set -e

ENVIRONMENT=$1
BRANCH=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$BRANCH" ]; then
    echo "Usage: $0 <environment> <branch>"
    echo "Example: $0 staging develop"
    exit 1
fi

echo "Deploying $BRANCH to $ENVIRONMENT environment..."

case $ENVIRONMENT in
    "staging")
        SERVER="staging.mycompany.com"
        PORT="22"
        USER="deploy"
        APP_DIR="/var/www/staging"
        ;;
    "production")
        SERVER="production.mycompany.com"
        PORT="22"
        USER="deploy"
        APP_DIR="/var/www/production"
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# 部署函数
deploy() {
    echo "Connecting to $SERVER..."
    ssh -p $PORT $USER@$SERVER << EOF
        set -e
        cd $APP_DIR
        
        # 备份当前版本
        cp -r current backup-\$(date +%Y%m%d-%H%M%S) || true
        
        # 拉取最新代码
        git fetch --all
        git checkout $BRANCH
        git pull origin $BRANCH
        
        # 安装依赖
        npm ci --production
        
        # 构建应用
        npm run build
        
        # 重启应用
        pm2 restart ecosystem.config.js --env $ENVIRONMENT
        
        # 健康检查
        sleep 10
        curl -f http://localhost:3000/health || {
            echo "Health check failed, rolling back..."
            cp -r backup-* current
            pm2 restart ecosystem.config.js --env $ENVIRONMENT
            exit 1
        }
        
        echo "Deployment successful!"
EOF
}

# 执行部署
deploy

# 发送通知
curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"✅ Successfully deployed $BRANCH to $ENVIRONMENT\"}" \
    $SLACK_WEBHOOK_URL
```

### PM2配置文件
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-project',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3000,
      DATABASE_URL: process.env.STAGING_DATABASE_URL
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: process.env.PRODUCTION_DATABASE_URL
    }
  }]
};
```

## 第五步：监控和日志

### 基础监控配置
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus_data:
  grafana_data:
```

### 日志配置
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.8.0
    volumes:
      - ./monitoring/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    command: filebeat -e -strict.perms=false

volumes:
  elasticsearch_data:
```

## 第六步：安全配置

### 密钥管理
```bash
# 使用Docker Secrets（Docker Swarm）
echo "mypassword" | docker secret create db_password -

# 使用Kubernetes Secrets
kubectl create secret generic app-secrets \
  --from-literal=database-url="postgresql://user:pass@host:5432/db" \
  --from-literal=api-key="your-api-key"

# 使用环境变量文件（开发环境）
# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
API_KEY=your-api-key
```

### 网络安全
```yaml
# docker-compose.security.yml
version: '3.8'

services:
  app:
    image: my-project:latest
    networks:
      - frontend
      - backend
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  db:
    image: postgres:15-alpine
    networks:
      - backend  # 只能被backend网络访问
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    networks:
      - frontend
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # 内部网络，无法访问外网

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## 第七步：完整示例项目

### 项目结构
```
my-project/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   └── rollback.sh
├── config/
│   ├── database.js
│   └── redis.js
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
├── k8s/
│   ├── deployment.yml
│   ├── service.yml
│   └── ingress.yml
├── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
├── package.json
└── README.md
```

### package.json脚本配置
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.js",
    "build": "babel src -d dist",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "lint": "eslint src/ --ext .js,.ts",
    "lint:fix": "eslint src/ --ext .js,.ts --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "docker:build": "docker build -t my-project .",
    "docker:run": "docker run -p 3000:3000 my-project",
    "deploy:staging": "./scripts/deploy.sh staging develop",
    "deploy:production": "./scripts/deploy.sh production main"
  }
}
```

## 最佳实践和注意事项

### 1. **渐进式实施**
```yaml
第一阶段: 基础CI
  - 自动化测试
  - 代码质量检查
  - 基础构建
  
第二阶段: 完整CI/CD
  - 自动化部署
  - 环境管理
  - 回滚机制
  
第三阶段: 高级特性
  - 蓝绿部署
  - 金丝雀发布
  - 监控告警
```

### 2. **常见问题和解决方案**

#### 构建失败问题
```bash
# 检查日志
jenkins-cli console <job-name> <build-number>

# 常见问题
1. 依赖安装失败 → 检查网络和包管理器缓存
2. 测试超时 → 增加超时时间或优化测试
3. 权限问题 → 检查文件权限和用户配置
```

#### 部署失败问题
```bash
# 检查部署状态
kubectl get pods -l app=my-project
kubectl describe pod <pod-name>

# 常见问题
1. 镜像拉取失败 → 检查镜像仓库权限
2. 健康检查失败 → 检查应用启动时间和端口
3. 资源不足 → 调整资源限制或扩容
```

### 3. **性能优化**
```yaml
构建优化:
  - 使用构建缓存
  - 并行执行任务
  - 优化Docker镜像层
  
部署优化:
  - 滚动更新
  - 资源预留
  - 健康检查优化
  
监控优化:
  - 关键指标监控
  - 告警规则设置
  - 日志聚合
```

## 总结

### 搭建CICD的关键步骤
1. **规划设计** - 明确需求和技术选型
2. **基础搭建** - 版本控制和CI/CD工具
3. **流水线配置** - 自动化构建、测试、部署
4. **环境管理** - 多环境配置和部署策略
5. **监控告警** - 系统监控和日志管理
6. **安全配置** - 密钥管理和网络安全
7. **持续优化** - 性能优化和流程改进

### 成功要素
- **从简单开始**：先实现基础功能，再逐步完善
- **自动化一切**：减少人工操作，提高可靠性
- **监控和反馈**：及时发现问题，快速响应
- **团队协作**：建立规范，培训团队成员

**搭建CICD是一个持续迭代的过程，关键是要开始行动，在实践中不断完善！** 