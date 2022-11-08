import fetch from 'node-fetch';

const bakalariUrl: string = '';
const userName: string = '';
const userPassword: string = '';

const getAccessToken = async (): Promise<string> => {
  const res = await fetch(`${bakalariUrl}/api/login`, {
    method: 'post',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
    body: `grant_type=password&username=${userName}&password=${userPassword}&client_id=ANDR`,
  });
  const data = await res.json();
  return data?.access_token ?? '';
}

getAccessToken().then(token => console.log(token));
