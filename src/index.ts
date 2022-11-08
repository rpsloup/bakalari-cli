import fetch from 'node-fetch';
import promptSync from 'prompt-sync';

const prompt = promptSync();

const bakalariUrl: string = 'https://sbakalari.gasos-ro.cz';
const inputPrompt = '> ';
const commandPrompt = '$ ';

type UserAuth = {
  userName: string;
  userPassword: string;
};

type Teacher = {
  Id: string;
  Abbrev: string;
  Name: string;
};

const logWelcomeMessage = (): void => {
  console.log('Bakaláři CLI\n');
}

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

const getCommand = (userName: string): string[] => {
  let command = prompt(`[${userName}@bakalari]${commandPrompt}`);
  if (!command) return [];
  return command.toLowerCase().split(' ');
}

const handleCommand = async (command: string[], token: string) => {
  if (command.length === 0) return;

  switch (command[0]) {
    case 'teachers':
      const teachers: Teacher[] = await getTeacherList(token);
      teachers.forEach(teacher => console.log(`${teacher.Abbrev} - ${teacher.Name}`));
      break;

    default:
      break;
  }
}

(async () => {
  logWelcomeMessage();
  const userAuth: UserAuth = await getUserAuth();
  const accessToken: string = await getAccessToken(userAuth);

  if (!accessToken) {
    console.log('\nLogin failed.');
    return;
  }
  console.log('\nSuccessfully logged in.\n');

  let appRunning: boolean = true;
  while (appRunning) {
    const commandResult = getCommand(userAuth.userName);
    if (commandResult.length > 0 && commandResult[0] === 'exit') return;
    await handleCommand(commandResult, accessToken);
  }
})();
