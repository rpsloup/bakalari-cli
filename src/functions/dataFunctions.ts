import * as fs from 'fs';
import CryptoJS, { AES } from 'crypto-js';

import type { UserAuth } from '../typings/authTypes'

const DATA_FOLDER = 'data';
const aesKey = '770A8A65DA156D24EE2A093277530142';

const createDataFolder = () => {
  if (!fs.existsSync(DATA_FOLDER)){
    fs.mkdirSync(DATA_FOLDER);
  }
}

export const loadLoginInfo = (): UserAuth | null => {
  if (!fs.existsSync(`${DATA_FOLDER}/auth.json`)) return null;
  const rawLoginData = fs.readFileSync(`${DATA_FOLDER}/auth.json`);
  const loginData = JSON.parse(rawLoginData.toString());
  return {
    ...loginData,
    userPassword: loginData.userPassword.length !== 0 ? AES.decrypt(loginData.userPassword, aesKey).toString(CryptoJS.enc.Utf8) : loginData.userPassword,
  };
}

export const saveLoginInfo = (loginInfo: UserAuth) => {
  createDataFolder();
  fs.writeFileSync(`${DATA_FOLDER}/auth.json`, `${JSON.stringify({
    ...loginInfo,
    userPassword: loginInfo.userPassword.length !== 0 ? AES.encrypt(loginInfo.userPassword, aesKey).toString() : loginInfo.userPassword,
  }, null, 2)}\n`);
}

export const deleteLoginInfo = () => {
  if (!fs.existsSync(`${DATA_FOLDER}/auth.json`)) return;
  fs.rmSync(`${DATA_FOLDER}/auth.json`);
  console.log('Successfully deleted your cached authentication data.');
}
