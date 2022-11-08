import * as fs from 'fs';

import type { UserAuth } from './typings/authTypes'

const DATA_FOLDER = 'data';

const createDataFolder = () => {
  if (!fs.existsSync(DATA_FOLDER)){
    fs.mkdirSync(DATA_FOLDER);
  }
}

export const loadLoginInfo = (): Omit<UserAuth, 'userPassword'> | null => {
  if (!fs.existsSync(`${DATA_FOLDER}/auth.json`)) return null;
  const rawLoginData = fs.readFileSync(`${DATA_FOLDER}/auth.json`);
  const loginData = JSON.parse(rawLoginData.toString());
  return loginData;
}

export const saveLoginInfo = (loginInfo: Omit<UserAuth, 'userPassword'>) => {
  createDataFolder();
  fs.writeFileSync(`${DATA_FOLDER}/auth.json`, `${JSON.stringify(loginInfo, null, 2)}\n`);
}

export const deleteLoginInfo = () => {
  if (!fs.existsSync(`${DATA_FOLDER}/auth.json`)) return;
  fs.rmSync(`${DATA_FOLDER}/auth.json`);
  console.log('Successfully deleted your cached authentication data.');
}
