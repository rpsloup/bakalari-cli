export type Teacher = {
  Id: string;
  Abbrev: string;
  Name: string;
};

export type Hour = {
  Id: number;
  BeginTime: string;
  EndTime: string;
};

export type TimeTable = {
  Days: {
    Atoms: {
      HourId: number;
      SubjectId: number;
      Change: {
        ChangeType: string;
        TypeAbbrev?: string;
      } | null;
    }[];
    DayOfWeek: number;
    Date: string;
    DayType: string;
  }[];
  Subjects: {
    Id: number;
    Abbrev: string;
    Name: string;
  }[];
  Teachers: Teacher[];
  Hours: Hour[];
};
