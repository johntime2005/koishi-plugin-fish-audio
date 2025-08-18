# koishi-plugin-fish-audio-tts

[![npm](https://img.shields.io/npm/v/koishi-plugin-fish-audio-tts?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-fish-audio-tts)

通过 Fish Audio API 进行文本转语音，支持 Koishi VITS 服务接口。

## 功能特性

- 🎵 支持 Fish Audio 的高质量 TTS 服务
- 🔧 完全兼容 Koishi VITS 服务接口
- 🌐 支持代理连接
- ⚙️ 灵活的配置选项
- 📝 支持多种模型选择

## 安装

```bash
npm install koishi-plugin-fish-audio-tts
```

## 配置

在 Koishi 控制台中配置以下参数：

- `api_key`: Fish Audio API 密钥（必填）
- `model`: 使用的 TTS 模型名称，如 `s1` 或 `speech-1.6`（默认：s1）
- `command`: 自定义指令列表
- `vits_service_speaker`: VITS 服务的默认说话人 ID
- `proxy_agent`: SOCKS5 代理地址（可选）

## 使用方法

### 基础用法

```javascript
// 使用默认指令
/say 你好，这是一个测试消息
```

### 作为 VITS 服务

插件实现了 VITS 服务接口，可以被其他插件调用：

```javascript
// 在其他插件中使用
const result = await ctx.vits.say({
  input: "你好，世界！",
  // 其他选项...
});
```

## API 密钥获取

1. 访问 [Fish Audio](https://fish.audio/zh-CN/go-api/)
2. 注册并获取 API 密钥
3. 在插件配置中填入密钥

## 许可证

MIT License

## 更新日志

### 1.0.0

- 初始版本发布
- 支持 Fish Audio TTS API
- 实现 VITS 服务接口
- 支持代理连接
