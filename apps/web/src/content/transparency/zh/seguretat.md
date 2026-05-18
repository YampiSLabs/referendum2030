---
title: "安全架构"
description: "保护数字资产并在无识别签名的情况下提供基于哈希加密的匿名保障。"
order: 2
---
本平台安全背后的工程技术利用了：

- **哈希锁定令牌 (Hash-Locked Tokens)：** 选举令牌不包含任何个人信息。它们是唯一生成的随机字符串，在使用时会以不可逆的 SHA-256 格式进行记录。
- **HTTPS 加密通道：** Astro 前端与 PythonAnywhere 上的 Django 后端之间的所有请求均强制进行 TLS 1.3 加密，以防被拦截。
- **抗 DDoS 攻击弹性：** API 采用了速率限制（Rate Limiting）策略，以防资源耗尽和恶意刷票。
