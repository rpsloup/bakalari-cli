import { shell } from '..';

import type { UserAuth } from '../typings/authTypes';

export const getUserAuth = async (loadedAuth: Omit<UserAuth, 'userPassword'> | null): Promise<UserAuth> => {
  if (loadedAuth) {
    console.log('Successfully loaded authentication info from the cache.');
    console.log('You can delete your cache by using the rmcache command.\n');
    console.log('Enter your password');
    let userPassword = shell.getPassword();

    return {
      ...loadedAuth,
      userPassword: userPassword ?? '',
    }
  }

  console.log('Enter the Bakaláři URL');
  let apiEndpoint = shell.getInput();
  console.log('Enter your username');
  let userName = shell.getInput();
  console.log('Enter your password');
  let userPassword = shell.getPassword();

  return {
    apiEndpoint: apiEndpoint ?? '',
    userName: userName ?? '',
    userPassword: userPassword ?? '',
  };
}

export const getAccessToken = async (auth: UserAuth): Promise<string> => {
  const res = await fetch(`${auth.apiEndpoint}/api/login`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=password&username=${auth.userName}&password=${auth.userPassword}&client_id=ANDR`,
  });
  const data = await res.json();
  return data?.access_token ?? '';
}
