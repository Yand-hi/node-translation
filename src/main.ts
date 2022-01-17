import * as https from 'https';
import * as queryString from 'querystring';
import md5 = require('md5');
import {appId, appSecret} from './private';

export const translate = (word) => {
  console.log(word);
  console.log(md5('123'));

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
      const object = JSON.parse(string);
      console.log(object);
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
};
