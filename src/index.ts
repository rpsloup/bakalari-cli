import fetch from 'node-fetch';

import { Shell } from './shell';
import {
  loadLoginInfo,
  saveLoginInfo,
  deleteLoginInfo,
} from './data';
import {
  getUserAuth,
  getAccessToken
} from './functions/authFunctions';

import type { UserAuth } from './typings/authTypes';
import type { Teacher, Hour, TimeTable } from './typings/timeTableTypes';
import type { MarkEntry } from './typings/markTypes';
import type { Absence } from './typings/absenceTypes';

const WORK_DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá'];
const HOSTNAME = 'bakalari';

export const shell = new Shell();
shell.setInputPrompt('> ');
shell.setHostName(HOSTNAME);

const logWelcomeMessage = (): void => {
  console.log('Bakaláři CLI\n');
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

const getSubjectMarks = async (endpoint: UserAuth['apiEndpoint'], token: string, subject: string): Promise<{
  subjectName: MarkEntry['Subject']['Name'];
  marks: MarkEntry['Marks'];
  average: MarkEntry['AverageText'];
}> => {
  const res = await fetch(`${endpoint}/api/3/marks`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  });
  const markData = await res.json();
  const subjectMarks = markData?.Subjects.find((markEntry: MarkEntry) => markEntry?.Subject?.Abbrev?.trim().toLowerCase() === subject);
  return {
    subjectName: subjectMarks?.Subject?.Name,
    marks: subjectMarks?.Marks ?? [],
    average: subjectMarks?.AverageText ?? '',
  };
}

const getTimeTable = async (endpoint: UserAuth['apiEndpoint'], token: string, options: string[]): Promise<TimeTable | null> => {
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekTimestamp = nextWeekDate.toISOString().split('T')[0];

  const endpointPath = options.includes('n') ? `api/3/timetable/actual?date=${nextWeekTimestamp}` : 'api/3/timetable/actual';
  const res = await fetch(`${endpoint}/${endpointPath}`, {
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

const getAbsence = async (endpoint: UserAuth['apiEndpoint'], token: string): Promise<Absence['AbsencesPerSubject']> => {
  const res = await fetch(`${endpoint}/api/3/absence/student`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  });
  const absenceData = await res.json();
  return absenceData?.AbsencesPerSubject ?? [];
}

const handleCommand = async (endpoint: UserAuth['apiEndpoint'], command: { command: string[]; options: string[] }, token: string) => {
  if (command.command.length === 0) return;

  switch (command.command[0]) {
    case 'teachers':
      const teachers: Teacher[] = await getTeachers(endpoint, token);
      teachers.forEach(teacher => console.log(`${teacher.Abbrev} - ${teacher.Name}`));
      break;

    case 'marks':
      if (command.command.length === 1) {
        const markEntries: MarkEntry[] = await getMarkEntries(endpoint, token);
        markEntries && markEntries.forEach(markEntry => console.log(`${markEntry.Subject.Abbrev} - ${markEntry.AverageText}`));
      } else {
        const markData = await getSubjectMarks(endpoint, token, command.command[1].toLowerCase());
        markData?.subjectName && console.log(`${markData.subjectName}\n`);
        const longestMarkLength = markData?.marks?.length ? markData.marks.reduce((previous, current) => (previous.MarkText.length > current.MarkText.length) ? previous : current).MarkText.length : 0;
        markData && markData.marks && markData.marks.forEach(mark => {
          console.log(`${mark.MarkText.padEnd(longestMarkLength, ' ')} (Váha: ${mark.Weight})`);
        });
        markData?.average && console.log(`\nPrůměr: ${markData.average.replace(',', '.')}`);
      }
      break;

    case 'timetable':
      const timeTable = await getTimeTable(endpoint, token, command.options);
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

    case 'absence':
      const absence = await getAbsence(endpoint, token);
      const longestSubjectName = absence.reduce((previous, current) => (previous.SubjectName.length > previous.SubjectName.length) ? previous : current).SubjectName.length;

      absence.forEach(absenceEntry => {
        const totalSubjectAbsence = absenceEntry.Base;
        const subjectAbsencePercentage = absenceEntry.LessonsCount > 0 ? (totalSubjectAbsence / absenceEntry.LessonsCount * 100).toFixed(2) : (0).toFixed(2);
        let finalOutput = `${command.options.includes('m') ? absenceEntry?.SubjectName : absenceEntry?.SubjectName?.padEnd(longestSubjectName, ' ')} - ${subjectAbsencePercentage}% (`;
        finalOutput += `${totalSubjectAbsence}; `;
        finalOutput += `\x1b[32m${absenceEntry.Base}\x1b[0m; `;
        finalOutput += `\x1b[36m${absenceEntry.School}\x1b[0m; `;
        finalOutput += `\x1b[31m${absenceEntry.Late}\x1b[0m; `;
        finalOutput += `\x1b[33m${absenceEntry.Soon}\x1b[0m)`;
        console.log(finalOutput);
      });
      break;

    case 'hostname':
      console.log(shell.hostName);
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
