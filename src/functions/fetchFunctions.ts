import fetch from 'node-fetch';

import type { UserAuth } from '../typings/authTypes';
import type { Teacher, Hour, TimeTable } from '../typings/timeTableTypes';
import type { MarkEntry } from '../typings/markTypes';
import type { Absence } from '../typings/absenceTypes';

export const getTeachers = async (endpoint: UserAuth['apiEndpoint'], token: string): Promise<Teacher[]> => {
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

export const getMarkEntries = async (endpoint: UserAuth['apiEndpoint'], token: string): Promise<MarkEntry[]> => {
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

export const getSubjectMarks = async (endpoint: UserAuth['apiEndpoint'], token: string, subject: string): Promise<{
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

export const getTimeTable = async (endpoint: UserAuth['apiEndpoint'], token: string, options: string[]): Promise<TimeTable | null> => {
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

export const getHours = async (endpoint: UserAuth['apiEndpoint'], token: string): Promise<Hour[]> => {
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

export const getAbsence = async (endpoint: UserAuth['apiEndpoint'], token: string): Promise<Absence['AbsencesPerSubject']> => {
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
