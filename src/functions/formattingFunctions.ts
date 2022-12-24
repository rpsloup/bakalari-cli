import { WORK_DAYS } from '..';

import type { TimeTable } from '../typings/timeTableTypes';

export const drawTimeTable = (timeTable: TimeTable, options: { minimal: boolean, smallSpacing: boolean }) => {
  const longestWorkDayName = WORK_DAYS.reduce((previous, current) => (previous.length > current.length) ? previous : current).length;
  const longestSubjectName = timeTable.Subjects?.length > 0 ? timeTable.Subjects.reduce((previous, current) => (previous.Abbrev.length > current.Abbrev.length) ? previous : current).Abbrev.length : 0;
  let longestChangeName = 0;
  let longestCellLength = 0;
  const cellSpacing = options.smallSpacing ? 1 : 2;
  
  timeTable.Days.forEach(day => {
    longestChangeName = day.Atoms?.length > 0 ? (day.Atoms.reduce((previous, current) => ((previous.Change?.TypeAbbrev?.length ?? 0) > (current.Change?.TypeAbbrev?.length ?? 0)) ? previous : current).Change?.TypeAbbrev?.length ?? 0) : 0;
    longestCellLength = longestSubjectName > longestChangeName ? longestSubjectName : longestChangeName;
  });

  if (!options.minimal) {
    let hourRow: string = ' '.repeat(longestWorkDayName + cellSpacing);
    timeTable.Hours.forEach(hour => hourRow += String(hour.Id - 2).padEnd(longestCellLength + cellSpacing, ' '));
    console.log(hourRow);
  }

  timeTable.Days.forEach(day => {
    let row: string = options.minimal ? '' : WORK_DAYS[day.DayOfWeek - 1].padEnd(longestWorkDayName + cellSpacing, ' ');
    for (let i = 2; i < timeTable.Hours.length + 1; i++) {
      const hour = day.Atoms.find(atom => atom.HourId === i);

      if (!hour) {
        row += ' '.repeat(longestCellLength + cellSpacing);
        continue;
      }
      
      if (!hour.Change) {
        row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestCellLength + cellSpacing, ' ');
      } else {
        switch (hour.Change.ChangeType) {
          case 'Canceled':
            if (!hour.Change?.TypeAbbrev) {
              row += 'ODP'.padEnd(longestCellLength + cellSpacing, ' ');
              break;
            }
            row += hour.Change.TypeAbbrev.padEnd(longestCellLength + cellSpacing, ' ');
            break;

          case 'Substitution':
            row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestCellLength + cellSpacing, ' ');
            break;

          case 'Added':
            row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestCellLength + cellSpacing, ' ');
            break;
            
          case 'RoomChanged':
            row += timeTable?.Subjects?.find(subject => subject.Id === hour.SubjectId)?.Abbrev.padEnd(longestCellLength + cellSpacing, ' ');
            break;

          default:
            row += ' '.repeat(longestCellLength + cellSpacing);
        }
      }
    }
    console.log(row);
  });
}
