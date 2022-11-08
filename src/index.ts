import fetch from 'node-fetch';
import promptSync from 'prompt-sync';

const prompt = promptSync();

const bakalariUrl: string = 'https://sbakalari.gasos-ro.cz';
const inputPrompt = '> ';

type UserAuth = {
  userName: string;
  userPassword: string;
};

type Teacher = {
  Id: string;
  Abbrev: string;
  Name: string;
};

const getUserAuth = async (): Promise<UserAuth> => {
  console.log('Enter your username');
  let userName = prompt(inputPrompt);
  console.log('Enter your password');
  let userPassword = prompt(inputPrompt);

  return {
    userName: userName ?? '',
    userPassword: userPassword ?? '',
  };
}

const getAccessToken = async (auth: UserAuth): Promise<string> => {
  const res = await fetch(`${bakalariUrl}/api/login`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=password&username=${auth.userName}&password=${auth.userPassword}&client_id=ANDR`,
  });
  const data = await res.json();
  return data?.access_token ?? '';
}

const getTeacherList = async (token: string): Promise<Teacher[]> => {
  const res = await fetch(`${bakalariUrl}/api/3/timetable/actual`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data?.Teachers ?? [];
}

(async () => {
  const userAuth: UserAuth = await getUserAuth();
  const accessToken: string = await getAccessToken(userAuth);
  const teachers = await getTeacherList(accessToken);
  teachers.forEach(teacher => console.log(`${teacher.Abbrev} - ${teacher.Name}`));
})();
