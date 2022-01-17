import * as https from 'https';
import * as queryString from 'querystring';
import md5 = require('md5');
import {appId, appSecret} from './private';

export const translate = (word) => {
  console.log(word);

  const salt = Math.random();
  const sign = md5(appId + word + salt + appSecret);
  const query: string = queryString.stringify({
    q: word,
    from: 'en',
    to: 'zh',
    appid: appId,
    salt: salt,
    sign: sign
  });
  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    let chunks = [];
    response.on('data', (chunk) => {
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
      const result = object.trans_result[0].dst;
      console.log(result);
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
};
