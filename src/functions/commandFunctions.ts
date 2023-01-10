import { shell } from '..';
import {
  deleteLoginInfo,
} from './dataFunctions';
import {
  getTeachers,
  getMarkEntries,
  getSubjectMarks,
  getTimeTable,
  getHours,
  getAbsence,
} from './fetchFunctions';
import { drawTimeTable } from './formattingFunctions';

import { UserAuth } from '../typings/authTypes';
import type { Teacher } from '../typings/timeTableTypes';
import type { MarkEntry } from '../typings/markTypes';

export const handleCommand = async (endpoint: UserAuth['apiEndpoint'], command: { command: string[]; options: string[] }, token: string) => {
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
        markData?.subjectName && !command.options.includes('m') && console.log(`${markData.subjectName}\n`);
        const longestMarkLength = markData?.marks?.length ? markData.marks.reduce((previous, current) => (previous.MarkText.length > current.MarkText.length) ? previous : current).MarkText.length : 0;
        markData && markData.marks && markData.marks.forEach(mark => {
          console.log(`${mark.MarkText.padEnd(longestMarkLength, ' ')} (Váha: ${mark.Weight}) ${mark.Caption}`);
        });
        markData?.average && !command.options.includes('m') && console.log(`\nPrůměr: ${markData.average.replace(',', '.')}`);
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
      hours.forEach(hour => console.log(`${hour.Id - hours[0].Id}.: ${hour.BeginTime}-${hour.EndTime}`));
      break;

    case 'absence':
      const absence = await getAbsence(endpoint, token);
      const longestSubjectName = absence.reduce((previous, current) => (previous.SubjectName.length > previous.SubjectName.length) ? previous : current).SubjectName.length;

      if (!command.options.includes('m')) {
        console.log('\x1b[32mOmluvená\x1b[0m');
        console.log('Celková');
        console.log('\x1b[36mNezapočtená\x1b[0m');
        console.log('\x1b[31mPozdní příchod\x1b[0');
        console.log('\x1b[33mBrzký odchod\x1b[0m\n');
      }
      
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
