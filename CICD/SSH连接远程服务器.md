
我来详细说明如何配置 SSH 密钥认证和在 GitHub 中设置服务器信息。

## 🔐 第一步：生成 SSH 密钥对

在您的本地机器上生成 SSH 密钥：
```bash
ssh-keygen -t rsa -b 4096 -C "blog-deploy-key"
```
看起来您已经开始生成密钥了。让我为您提供完整的配置步骤：

## 🔑 SSH 密钥配置完整流程

### 1. 生成专用的部署密钥

建议为部署单独生成一个密钥：

```bash
# 生成密钥时，建议保存到特定文件
ssh-keygen -t rsa -b 4096 -C "blog-deploy-key" -f ~/.ssh/blog_deploy_key
```

### 2. 查看生成的密钥
```bash
echo "查看公钥内容（需要添加到服务器）："
```
```bash
ls -la ~/.ssh/
```
```bash
cat ~/.ssh/id_rsa.pub 2>/dev/null || echo "SSH 密钥不存在，需要先生成"
```
太好了！您已经有 SSH 密钥了。现在让我查看私钥内容：
```bash
echo "=== 公钥内容（添加到服务器） ==="
cat ~/.ssh/id_rsa.pub
echo ""
echo "=== 私钥内容（添加到 GitHub Secrets） ==="
cat ~/.ssh/id_rsa
```
完美！现在我来为您详细说明配置步骤：

## 🔧 完整配置步骤

### 第一步：配置服务器（添加公钥）

将以下**公钥内容**添加到您的服务器：

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDJYJcxPDFZ/ms6fPLCc1Vvu54al+GS0TmFm8I/QD0TImldQE10nTX7uaDBkgpsIQayrTgMtXTfTucowfRWfHTKxW9dw0DUmw1YbFbKcwgnH8mXPKRGkgohDI4GsZWjPXD8lqRuKtu5C1vBWQdAefJEBGE8am51TFuqns9A27cSyuG+iqYI/lK6PTZtcFtKODSZ5dI26CkfWTepySdzcG/6qq0TFrzM19zJmykU9ZXYCFhDcGYE3+86VhggRAVeM2gbvNdMRcnOSLWUU/XC5ywxQrTjk0+L4qkQm1JK4kTD/xHRZJtQ7mxopZ5r5sQQvIpy0Hwdqr7JqveemP/UommRFf63bTulfnFVLBBLTHrbCxgbwazF/th6S0MP9Og9hRXsJm0Z+vxs9MEVBvBXn71R9whdNBMEI22RyO7krBlExs2aBLNuqNTNeRicgMV5H4ZYPP+gb3GDtkm3KvB9HqiZKNIZjILtea3Kixf4qczecvJC0enuOVH5e6Md7M6ALW0Mv8P01QuloYH4BhIbSmwGxaN52LJzyIaU1etZBJ/3nqVyuKo/JWWTNnMUchwbvf7R5J9ymxzpshwlIWGdfYmStsV6KY83qS1atB9X5NlOD3quNbmCvB5GGG0ypaII7Q8oNi0UBAOJ5+llzqYEaJfsrJ6HPVOpQ1cd9l+sFSybZQ== blog-deploy-key
```

**在服务器上执行：**
```bash
# 登录到您的服务器
ssh your-username@your-server-ip

# 创建 .ssh 目录（如果不存在）
mkdir -p ~/.ssh

# 将公钥添加到 authorized_keys
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDJYJcxPDFZ/ms6fPLCc1Vvu54al+GS0TmFm8I/QD0TImldQE10nTX7uaDBkgpsIQayrTgMtXTfTucowfRWfHTKxW9dw0DUmw1YbFbKcwgnH8mXPKRGkgohDI4GsZWjPXD8lqRuKtu5C1vBWQdAefJEBGE8am51TFuqns9A27cSyuG+iqYI/lK6PTZtcFtKODSZ5dI26CkfWTepySdzcG/6qq0TFrzM19zJmykU9ZXYCFhDcGYE3+86VhggRAVeM2gbvNdMRcnOSLWUU/XC5ywxQrTjk0+L4qkQm1JK4kTD/xHRZJtQ7mxopZ5r5sQQvIpy0Hwdqr7JqveemP/UommRFf63bTulfnFVLBBLTHrbCxgbwazF/th6S0MP9Og9hRXsJm0Z+vxs9MEVBvBXn71R9whdNBMEI22RyO7krBlExs2aBLNuqNTNeRicgMV5H4ZYPP+gb3GDtkm3KvB9HqiZKNIZjILtea3Kixf4qczecvJC0enuOVH5e6Md7M6ALW0Mv8P01QuloYH4BhIbSmwGxaN52LJzyIaU1etZBJ/3nqVyuKo/JWWTNnMUchwbvf7R5J9ymxzpshwlIWGdfYmStsV6KY83qS1atB9X5NlOD3quNbmCvB5GGG0ypaII7Q8oNi0UBAOJ5+llzqYEaJfsrJ6HPVOpQ1cd9l+sFSybZQ== blog-deploy-key" >> ~/.ssh/authorized_keys

# 设置正确的权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 第二步：在 GitHub 配置 Secrets

1. **打开 GitHub 仓库**
2. **点击 Settings 选项卡**
3. **在左侧菜单找到 "Secrets and variables" → "Actions"**
4. **点击 "New repository secret" 添加以下配置：**

#### 必需的 Secrets：

**`HOST`**
- Name: `HOST`
- Value: `您的服务器IP地址或域名`
- 例如: `192.168.1.100` 或 `your-server.com`

**`USERNAME`**
- Name: `USERNAME` 
- Value: `您的服务器用户名`
- 例如: `root` 或 `ubuntu`

**`PRIVATE_KEY`**
- Name: `PRIVATE_KEY`
- Value: 完整的私钥内容（包括开头和结尾的标记）：
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAgEAyWCXMTwxWf5rOnzywnNVb7ueGpfhktE5hZvCP0A9EyJpXUBNdJ01
+7mgwZIKbCEGsq04DLV0307nKMH0Vnx0ysVvXcNA1JsNWGxWynMIJx/JlzykRpIKIQyOBr
GVoz1w/JakbirbuQtbwVkHQHnyRARhPGpudUxbqp7PQNu3EsrhvoqmCP5Suj02bXBbSjg0
meXSNugpH1k3qcknc3Bv+qqtExa8zNfcyZspFPWV2AhYQ3BmBN/vOlYYIEQFXjNoG7zXTE
XJzki1lFP1wucsMUK045NPi+KpEJtSSuJEw/8R0WSbUO5saKWea+bEELyKctB8Haq+yar3
npj/1KJpkRX+t207pX5xVSwQS0x62wsYG8Gsxf7YektDD/ToPYUV7CZtGfr8bPTBFQbwV5
+9UfcIXTQTBCNtkcju5KwZRMbNmgSzbqjUzXkYnIDFeR+GWDz/oG9xg7ZJtyrwfR6omSjS
GYyC7XmtyosX+KnM3nLyQtHp7jlR+XujHezOgC1tDL/D9NULpaGB+AYSG0psBsWjediyc8
iGlNXrWQSf956lcriqPyVlkzZzFHIcG73+0eSfcpsc6bIcJSFhnX2JkrbFeimPN6ktWrQf
V+TZTg96rjW5grweRhhtMqWiCO0PKDYtFAQDiefpZc6mBGiX7Kyehz1TqUNXHfZfrBUsm2
UAAAdIbmZ8jW5mfI0AAAAHc3NoLXJzYQAAAgEAyWCXMTwxWf5rOnzywnNVb7ueGpfhktE5
hZvCP0A9EyJpXUBNdJ01+7mgwZIKbCEGsq04DLV0307nKMH0Vnx0ysVvXcNA1JsNWGxWyn
MIJx/JlzykRpIKIQyOBrGVoz1w/JakbirbuQtbwVkHQHnyRARhPGpudUxbqp7PQNu3Esrh
voqmCP5Suj02bXBbSjg0meXSNugpH1k3qcknc3Bv+qqtExa8zNfcyZspFPWV2AhYQ3BmBN
/vOlYYIEQFXjNoG7zXTEXJzki1lFP1wucsMUK045NPi+KpEJtSSuJEw/8R0WSbUO5saKWe
a+bEELyKctB8Haq+yar3npj/1KJpkRX+t207pX5xVSwQS0x62wsYG8Gsxf7YektDD/ToPY
UV7CZtGfr8bPTBFQbwV5+9UfcIXTQTBCNtkcju5KwZRMbNmgSzbqjUzXkYnIDFeR+GWDz/
oG9xg7ZJtyrwfR6omSjSGYyC7XmtyosX+KnM3nLyQtHp7jlR+XujHezOgC1tDL/D9NULpa
GB+AYSG0psBsWjediyc8iGlNXrWQSf956lcriqPyVlkzZzFHIcG73+0eSfcpsc6bIcJSFh
nX2JkrbFeimPN6ktWrQfV+TZTg96rjW5grweRhhtMqWiCO0PKDYtFAQDiefpZc6mBGiX7K
yehz1TqUNXHfZfrBUsm2UAAAADAQABAAACAQCE9ondsGjFiv8x9x4y1gQrai3SUUZXsl3Q
oi93o+qvn6ECOVrrDIKAWuiR5uOK0aOihkzj10v7xhVLDAVQtYxH9mS5/BnqRxZgs+f6dE
mFy69HdHrjPboCaE++i7LJvd/EZ5LaSuIZJC7JUwc+w0X7Mwkg4wVb3bcIySL/KBORDPRQ
4ysN9R6aaaBuUil0r/fLRbuvFUtRr47ZREAQMMU/NUJhwD


我看到您已经登录到服务器了，但是直接输入公钥会报错。让我为您提供正确的添加公钥的命令：

## 🔧 在服务器上正确添加公钥

您现在已经在服务器上了，请按照以下步骤操作：

### 1. 创建 .ssh 目录并设置权限

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

### 2. 将公钥添加到 authorized_keys 文件

```bash
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDJYJcxPDFZ/ms6fPLCc1Vvu54al+GS0TmFm8I/QD0TImldQE10nTX7uaDBkgpsIQayrTgMtXTfTucowfRWfHTKxW9dw0DUmw1YbFbKcwgnH8mXPKRGkgohDI4GsZWjPXD8lqRuKtu5C1vBWQdAefJEBGE8am51TFuqns9A27cSyuG+iqYI/lK6PTZtcFtKODSZ5dI26CkfWTepySdzcG/6qq0TFrzM19zJmykU9ZXYCFhDcGYE3+86VhggRAVeM2gbvNdMRcnOSLWUU/XC5ywxQrTjk0+L4qkQm1JK4kTD/xHRZJtQ7mxopZ5r5sQQvIpy0Hwdqr7JqveemP/UommRFf63bTulfnFVLBBLTHrbCxgbwazF/th6S0MP9Og9hRXsJm0Z+vxs9MEVBvBXn71R9whdNBMEI22RyO7krBlExs2aBLNuqNTNeRicgMV5H4ZYPP+gb3GDtkm3KvB9HqiZKNIZjILtea3Kixf4qczecvJC0enuOVH5e6Md7M6ALW0Mv8P01QuloYH4BhIbSmwGxaN52LJzyIaU1etZBJ/3nqVyuKo/JWWTNnMUchwbvf7R5J9ymxzpshwlIWGdfYmStsV6KY83qS1atB9X5NlOD3quNbmCvB5GGG0ypaII7Q8oNi0UBAOJ5+llzqYEaJfsrJ6HPVOpQ1cd9l+sFSybZQ== blog-deploy-key" >> ~/.ssh/authorized_keys
```

### 3. 设置正确的文件权限

```bash
chmod 600 ~/.ssh/authorized_keys
```

### 4. 验证配置

```bash
# 查看 authorized_keys 文件内容
cat ~/.ssh/authorized_keys

# 检查权限
ls -la ~/.ssh/
```

## 📝 接下来需要配置的 GitHub Secrets

完成服务器配置后，您需要在 GitHub 仓库中添加以下 Secrets：

1. **进入您的 GitHub 仓库**
2. **点击 Settings → Secrets and variables → Actions**
3. **添加以下 Secrets：**

- **`HOST`**: `iZwz91elvu2rnvvqn8x6p4Z` (您的服务器主机名或IP)
- **`USERNAME`**: `root`
- **`PORT`**: `22`
- **`PRIVATE_KEY`**: 之前显示的完整私钥内容

## 🧪 测试 SSH 连接

在您的本地机器上测试连接：

```bash
ssh -i ~/.ssh/id_rsa root@您的服务器IP
```

如果能成功连接，说明密钥配置正确！

请先在服务器上执行上述命令，然后告诉我是否成功。