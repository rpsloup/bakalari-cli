import { WORK_DAYS } from '..';

import type { TimeTable } from '../typings/timeTableTypes';

export const drawTimeTable = (timeTable: TimeTable, options: { minimal: boolean, smallSpacing: boolean }) => {
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
            if (!hour.Change?.TypeAbbrev) {
              row += 'ODP'.padEnd(longestSubjectName + cellSpacing, ' ');
              break;
            }
            row += hour.Change.TypeAbbrev.padEnd(longestSubjectName + cellSpacing, ' ');
            break;

          case 'Substitution':
            row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestSubjectName + cellSpacing, ' ');
            break;

          case 'Added':
            row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestSubjectName + cellSpacing, ' ');
            break;
            
          case 'RoomChanged':
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
