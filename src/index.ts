import fetch from 'node-fetch';
import promptSync from 'prompt-sync';

const prompt = promptSync();

const bakalariUrl: string = 'https://sbakalari.gasos-ro.cz';
const inputPrompt = '> ';
const commandPrompt = '$ ';

class Shell {
  commandPrompt: string;

  constructor(commandPrompt: string) {
    this.commandPrompt = commandPrompt;
  }

  getCommand = (userName: string): string[] => {
    let command = prompt(`[\x1b[36m${userName}\x1b[0m@\x1b[32mbakalari\x1b[0m]${this.commandPrompt}`);
    if (!command) return [];
    return command.toLowerCase().split(' ');
  }
}
export const shell = new Shell(commandPrompt);

type UserAuth = {
  userName: string;
  userPassword: string;
};

type Teacher = {
  Id: string;
  Abbrev: string;
  Name: string;
};

type MarkEntry = {
  Marks: any[];
  Subject: {
    Abbrev: string;
  };
  AverageText: string;
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

const getTeachers = async (token: string): Promise<Teacher[]> => {
  const res = await fetch(`${bakalariUrl}/api/3/timetable/actual`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  });
  const teacherData = await res.json();
  return teacherData?.Teachers ?? [];
}

const getMarkEntries = async (token: string): Promise<MarkEntry[]> => {
  const res = await fetch(`${bakalariUrl}/api/3/marks`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  });
  const markData = await res.json();
  return markData?.Subjects ?? [];
}

const handleCommand = async (command: string[], token: string) => {
  if (command.length === 0) return;

  switch (command[0]) {
    case 'teachers':
      const teachers: Teacher[] = await getTeachers(token);
      teachers.forEach(teacher => console.log(`${teacher.Abbrev} - ${teacher.Name}`));
      break;

    case 'marks':
      const markEntries: MarkEntry[] = await getMarkEntries(token);
      markEntries.forEach(markEntry => console.log(`${markEntry.Subject.Abbrev} - ${markEntry.AverageText}`));
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
    const commandResult = shell.getCommand(userAuth.userName);
    if (commandResult.length > 0 && commandResult[0] === 'exit') return;
    await handleCommand(commandResult, accessToken);
  }
})();
