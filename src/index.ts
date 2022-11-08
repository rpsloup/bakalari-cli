import fetch from 'node-fetch';
import promptSync from 'prompt-sync';

import type { UserAuth } from './typings/authTypes';
import type { Teacher, Hour, TimeTable } from './typings/timeTableTypes';
import type { MarkEntry } from './typings/markTypes';

const prompt = promptSync();

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

const logWelcomeMessage = (): void => {
  console.log('Bakaláři CLI\n');
}

const getUserAuth = async (): Promise<UserAuth> => {
  console.log('Enter the Bakaláři URL');
  let apiEndpoint = prompt(inputPrompt);
  console.log('Enter your username');
  let userName = prompt(inputPrompt);
  console.log('Enter your password');
  let userPassword = prompt(inputPrompt);

  return {
    apiEndpoint: apiEndpoint ?? '',
    userName: userName ?? '',
    userPassword: userPassword ?? '',
  };
}

const getAccessToken = async (auth: UserAuth): Promise<string> => {
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

const getTeachers = async (endpoint: UserAuth['apiEndpoint'], token: string): Promise<Teacher[]> => {
  const res = await fetch(`${endpoint}/api/3/timetable/actual`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  });
  const teacherData = await res.json();
  return teacherData?.Teachers ?? [];
}

const getMarkEntries = async (endpoint: UserAuth['apiEndpoint'], token: string): Promise<MarkEntry[]> => {
  const res = await fetch(`${endpoint}/api/3/marks`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  });
  const markData = await res.json();
  return markData?.Subjects ?? [];
}

const getTimeTable = async (endpoint: UserAuth['apiEndpoint'], token: string): Promise<TimeTable | null> => {
  const res = await fetch(`${endpoint}/api/3/timetable/actual`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  });
  const timeTableData = await res.json();
  return timeTableData ?? null;
}

const drawTimeTable = (timeTable: TimeTable) => {
  const longestSubjectName = timeTable.Subjects.reduce((previous, current) => (previous > current) ? previous : current).Abbrev.length;
  let hourRow: string = '';
  timeTable.Hours.forEach(hour => hourRow += String(hour.Id - 2).padEnd(longestSubjectName + 2, ' '));
  console.log(hourRow);

  timeTable.Days.forEach(day => {
    let row: string = '';
    for (let i = 2; i < timeTable.Hours.length + 1; i++) {
      const hour = day.Atoms.find(atom => atom.HourId === i);
      if (!hour) {
        row += ' '.repeat(longestSubjectName + 2);
        continue;
      }
      
      if (!hour.Change) {
        row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestSubjectName + 2, ' ');
      } else {
        switch (hour.Change.ChangeType) {
          case 'Canceled':
            row += 'ODP'.padEnd(longestSubjectName + 2, ' ');
            break;

          case 'Substitution':
            row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestSubjectName + 2, ' ');
            break;
            
          default:
            row += ' '.repeat(longestSubjectName + 2);
        }
      }
    }
    console.log(row);
  });
}

const getHours = async (endpoint: UserAuth['apiEndpoint'], token: string): Promise<Hour[]> => {
  const res = await fetch(`${endpoint}/api/3/timetable/actual`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  });
  const hourData = await res.json();
  return hourData?.Hours ?? [];
}

const handleCommand = async (endpoint: UserAuth['apiEndpoint'], command: string[], token: string) => {
  if (command.length === 0) return;

  switch (command[0]) {
    case 'teachers':
      const teachers: Teacher[] = await getTeachers(endpoint, token);
      teachers.forEach(teacher => console.log(`${teacher.Abbrev} - ${teacher.Name}`));
      break;

    case 'marks':
      const markEntries: MarkEntry[] = await getMarkEntries(endpoint, token);
      markEntries.forEach(markEntry => console.log(`${markEntry.Subject.Abbrev} - ${markEntry.AverageText}`));
      break;

    case 'timetable':
      const timeTable = await getTimeTable(endpoint, token);
      if (!timeTable) return;
      drawTimeTable(timeTable);
      break;

    case 'hours':
      const hours = await getHours(endpoint, token);
      hours.forEach(hour => console.log(`${hour.Id}.: ${hour.BeginTime}-${hour.EndTime}`));
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
    await handleCommand(userAuth.apiEndpoint, commandResult, accessToken);
  }
})();
