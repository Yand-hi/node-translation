import * as https from 'https';
import * as queryString from 'querystring';
import md5 = require('md5');
import {appId, appSecret} from './private';

type ErrorMap = {
  [key: string]: string
}
const errorMap: ErrorMap = {
  52001: '请求超时，请重试',
  52002: '系统错误，请重试',
  52003: '未授权用户，请检查appid是否正确或者服务是否开通',
  54000: '必填参数为空，请检查是否少传参数',
  54001: '签名错误，请检查您的签名生成方法',
  54003: '访问频率受限，请降低您的调用频率，或进行身份认证后切换为高级版/尊享版',
  54004: '账户余额不足，请前往管理控制台为账户充值',
  54005: '长query请求频繁， 请降低长query的发送频率，3s后再试',
  58000: '客户端IP非法，检查个人资料里填写的IP地址是否正确，可前往开发者信息-基本信息修改',
  58001: '译文语言方向不支持，检查译文语言是否在语言列表里',
  58002: '服务当前已关闭，请前往管理控制台开启服务',
  90107: '认证未通过或未生效，请前往我的认证查看认证进度',
};
export const translate = (word: string) => {
  const salt = Math.random();
  const sign = md5(appId + word + salt + appSecret);
  let from, to;
  if (/[a-zA-Z]/.test(word[0])) {
    from = 'en';
    to = 'zh';
  } else {
    from = 'zh';
    to = 'en';
  }
  const query: string = queryString.stringify({
    q: word,
    appid: appId,
    from,
    to,
    salt,
    sign
  });
  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    let chunks: Buffer[] = [];
    response.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    response.on('end', () => {
      const string = Buffer.concat(chunks).toString();
      type BaiduResult = {
        error_code?: string;
        error_msg?: string;
        from: string;
        to: string;
        trans_result: {
          src: string;
          dst: string
        }[]
      }
      const object: BaiduResult = JSON.parse(string);
      if (object.error_code) {
        console.error(errorMap[object.error_code] || object.error_msg);
        process.exit(2);
      } else {
        object.trans_result.map(obj => {
          console.log(obj.dst);
        });
        process.exit(0);
      }
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
};
