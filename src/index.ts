import fetch from 'node-fetch';

import { Shell } from './shell';
import {
  loadLoginInfo,
  saveLoginInfo,
  deleteLoginInfo,
} from './data';

import type { UserAuth } from './typings/authTypes';
import type { Teacher, Hour, TimeTable } from './typings/timeTableTypes';
import type { MarkEntry } from './typings/markTypes';

const WORK_DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá'];

export const shell = new Shell();
shell.setInputPrompt('> ');

const logWelcomeMessage = (): void => {
  console.log('Bakaláři CLI\n');
}

const getUserAuth = async (loadedAuth: Omit<UserAuth, 'userPassword'> | null): Promise<UserAuth> => {
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
  let userPassword = shell.getInput();

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

const drawTimeTable = (timeTable: TimeTable, options: { minimal: boolean, smallSpacing: boolean }) => {
  const longestWorkDayName = WORK_DAYS.reduce((previous, current) => (previous.length > current.length) ? previous : current).length;
  const longestSubjectName = timeTable.Subjects.reduce((previous, current) => (previous.Abbrev.length > current.Abbrev.length) ? previous : current).Abbrev.length;
  const cellSpacing = options.smallSpacing ? 1 : 2;

  if (!options.minimal) {
    let hourRow: string = ' '.repeat(longestWorkDayName + cellSpacing);
    timeTable.Hours.forEach(hour => hourRow += String(hour.Id - 2).padEnd(longestSubjectName + cellSpacing, ' '));
    console.log(hourRow);
  }

  timeTable.Days.forEach(day => {
    let row: string = options.minimal ? '' : WORK_DAYS[day.DayOfWeek - 1].padEnd(longestWorkDayName + cellSpacing, ' ');
    for (let i = 2; i < timeTable.Hours.length + 1; i++) {
      const hour = day.Atoms.find(atom => atom.HourId === i);
      if (!hour) {
        row += ' '.repeat(longestSubjectName + cellSpacing);
        continue;
      }
      
      if (!hour.Change) {
        row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestSubjectName + cellSpacing, ' ');
      } else {
        switch (hour.Change.ChangeType) {
          case 'Canceled':
            row += 'ODP'.padEnd(longestSubjectName + cellSpacing, ' ');
            break;

          case 'Substitution':
            row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestSubjectName + cellSpacing, ' ');
            break;
            
          default:
            row += ' '.repeat(longestSubjectName + cellSpacing);
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

const handleCommand = async (endpoint: UserAuth['apiEndpoint'], command: { command: string[]; options: string[] }, token: string) => {
  if (command.command.length === 0) return;

  switch (command.command[0]) {
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
      drawTimeTable(timeTable, {
        minimal: command.options.includes('m'),
        smallSpacing: command.options.includes('s'),
      });
      break;

    case 'hours':
      const hours = await getHours(endpoint, token);
      hours.forEach(hour => console.log(`${hour.Id}.: ${hour.BeginTime}-${hour.EndTime}`));
      break;

    case 'rmcache':
      deleteLoginInfo();
      break;

    default:
      console.log(`Unknown command: ${command.command[0]}`);
      break;
  }
}

(async () => {
  logWelcomeMessage();

  const loadedAuth = loadLoginInfo();
  const userAuth = await getUserAuth(loadedAuth);
  const accessToken: string = await getAccessToken(userAuth);

  if (!accessToken) {
    console.log('\nLogin failed.');
    return;
  }
  console.log('\nSuccessfully logged in.\n');
  saveLoginInfo({
    apiEndpoint: userAuth.apiEndpoint,
    userName: userAuth.userName,
  });

  shell.setUserName(userAuth.userName);
  shell.setCommandPrompt('$ ');

  let appRunning: boolean = true;
  while (appRunning) {
    const commandResult = shell.getCommand();
    if (commandResult.command.length > 0 && commandResult.command[0] === 'exit') return;
    await handleCommand(userAuth.apiEndpoint, commandResult, accessToken);
  }
})();
