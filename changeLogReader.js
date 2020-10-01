const {request} = require('gaxios');
const axios = require("axios");
const crypto = require('crypto');
const fs = require('fs');

let log = 'version 6\n';

const accountId = 'a6c18cda-43ec-4fc7-ae0e-451054650a7d';
const appId = 'UDS';
const systemid = `${appId}.changeLogReader`

const baseUrl = "https://cp4s77.ite1.isc.ibmcloudsecurity.com/api/entitlements/v1.0";
const changeLogUrl = `${baseUrl}/changelog/${appId}`;
const authUrl = `${baseUrl}/authToken`;
const exchangeUrl = `${authUrl}/exchangeAuthToken`;

const CHANGELOG_USER = '1709193822fc5d1283a5c4ba2c53e142';
const CHANGELOG_PASSWORD = '0cb9805384244fbd92ab78419229fbc2';
const APIKEY = 'MTcwOTE5MzgyMmZjNWQxMjgzYTVjNGJhMmM1M2UxNDI6MGNiOTgwNTM4NDI0NGZiZDkyYWI3ODQxOTIyOWZiYzI=';

async function genJWT() {
  log += 'dirname: ' + __dirname + '\n';
  const myPrivateKey = fs.readFileSync(__dirname + `/etc/id_rsa`).toString();
  const sig = crypto.sign("SHA256", Buffer.from(appId), myPrivateKey);
  log += 'sig: ' + sig.toString("base64") + '\n';
  const applicationToken = `${Buffer.from(appId).toString("base64")}.${sig.toString("base64")}`;

  const requestConfig = {
    headers: {
        "authorization": applicationToken
    }
  }

  let body = {
    systemIdName: systemid,
    storedMessage: {
        something: "value"
    },
    onBehalfOf: accountId
  };
  log += 'body: ' + body.toString("base64") + '\n';

  let res = await axios.post(authUrl, body, requestConfig);
  log += 'Gen token:\n';
  log += JSON.stringify(res.status, null, 2) + '\n';
  log += JSON.stringify(res.data, null, 2) + '\n';
  const token = res.data.token;

  body = { token }
  res = await axios.post(exchangeUrl, body, requestConfig);
  log += 'Gen JWT:\n';
  log += JSON.stringify(res.status, null, 2) + '\n';
  log += JSON.stringify(res.data, null, 2) + '\n';
  return res.data.jwt;
}

async function readChangeLog() {
  try {
    const url = `${changeLogUrl}/changes`;
    log += 'url: ' + url + '\n';

    const jwt = await genJWT();
    const auth = 'Bearer ' + jwt
    // const auth = 'Basic ' + APIKEY
    log += 'auth: ' + auth + '\n';

    const requestConfig = {
      headers: {
          "authorization": auth
      }
    }

    const res = await axios.get(url, requestConfig);

    log += 'Access changeLog:\n';
    log += JSON.stringify(res.status, null, 2) + '\n';
    log += JSON.stringify(res.data, null, 2) + '\n';
    } catch (error) {
    console.error(error);
    log += error.message;
  }
return log;
}

module.exports = readChangeLog;
