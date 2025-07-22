import { Context, h, HTTP, Schema, Service } from 'koishi'
import type Vits from '@initencounter/vits'
// 如果您的Koishi版本支持，可以取消下面这行的注释来获得更好的类型提示
// import type { } from '@koishijs/plugin-proxy-agent'

class Main extends Service implements Vits {
  static inject = {
    required: ['http']
  }
  private http?: HTTP

  constructor(ctx: Context, public config: Main.Config) {
    super(ctx, 'vits', true)
    // 代理逻辑保持不变，这是正确的
    if (config.proxy_agent) {
      this.http = ctx.http.extend({ proxyAgent: config.proxy_agent } as any)
    }

    for (const x of config.command) {
      ctx.command(`${x.name} <content:text>`, x.description)
        .action(async (_, content) => {
          if (!content) return '内容未输入。'
          // 这个检测逻辑很好，可以防止用户发送带标签的恶意内容
          if (/<.*\/>/gm.test(content)) return '输入的内容不是纯文本。'
          // [修改] 在调用generate时，传入config中设定的模型名称
          return await generate(this.http ?? ctx.http, content, x, config.api_key, config.model)
        })
    }
  }

  async say(options: Vits.Result): Promise<h> {
    const { vits_service_speaker, api_key, model } = this.config
    // [修改] 在调用generate时，传入config中设定的模型名称
    return await generate(this.http ?? this.ctx.http, options.input, { reference_id: vits_service_speaker }, api_key, model)
  }
}

interface BaseParams {
  reference_id: string
}

// [修改] 函数签名增加了 modelName 参数
async function generate(http: HTTP, input: string, x: BaseParams, key: string, modelName: string): Promise<h> {
  // [修改] 请求体 (body) 中增加了 normalize: false
  const params = {
    text: input,
    format: 'wav',
    reference_id: x.reference_id,
    normalize: false // 这是我们发现的必须参数
  }

  try {
    // [修改] http.post 的请求配置中，加入了包含 model 的请求头
    const res = await http.post<ArrayBuffer>('https://api.fish.audio/v1/tts', params, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'model': modelName // 这是您发现的最关键的参数！
      }
    })
    return h.audio(res, 'audio/wav')
  } catch (err) {
    if (http.isError(err) && err.response?.data?.message) {
      throw new Error(err.response.data.message)
    }
    throw err
  }
}

namespace Main {
  export interface Config {
    api_key: string
    model: string // [新增] 用于选择模型的配置项
    command: {
      name: string
      description: string
      reference_id: string
    }[]
    vits_service_speaker: string
    proxy_agent?: string
  }

  export const Config: Schema<Config> = Schema.object({
    api_key: Schema.string().description('Fish Audio [API 令牌密钥](https://fish.audio/zh-CN/go-api/)').required(),
    // [新增] 在配置界面增加模型选择的输入框
    model: Schema.string().description('要使用的TTS模型名称，例如 `s1` 或 `speech-1.6`。请确保您填写的模型支持高级控制标签。').default('s1'),
    command: Schema.array(
      Schema.object({
        name: Schema.string().description('指令名').required(),
        description: Schema.string().description('指令的描述').default(''),
        reference_id: Schema.string().description('Fish Audio 参考标识，即具体的声音ID。').required()
      })
    ).description('指令列表').default([{
      name: 'say',
      description: '语音生成（流萤）',
      reference_id: 'bcbb6d60721c44a489bc33dd59ce7cfc'
    }]),
    vits_service_speaker: Schema.string().description('用于 VITS 服务的 Fish Audio 参考标识').default('bcbb6d60721c44a489bc33dd59ce7cfc'),
    proxy_agent: Schema.string().role('link').description('用于获取语音的SOCKS5代理地址，例如：`socks5://127.0.0.1:10808`')
  })
}

export default Main