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

type TimeTable = {
  Days: {
    Atoms: {
      HourId: number;
      SubjectId: number;
      Change: {
        ChangeType: string;
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
  Hours: {
    Id: number;
    BeginTime: string;
    EndTime: string;
  }[];
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

const getTimeTable = async (token: string): Promise<TimeTable | null> => {
  const res = await fetch(`${bakalariUrl}/api/3/timetable/actual`, {
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
  timeTable.Days.forEach(day => {
    let row = ''
    day.Atoms.forEach(atom => {
      if (!atom.Change) {
        row += timeTable?.Subjects?.find(subject => subject.Id === atom.SubjectId)?.Abbrev + ' ';
      } else {
        switch (atom.Change.ChangeType) {
          case 'Canceled':
            row += 'ODP ';
            break;
        }
      }
    });
    console.log(row);
  });
  timeTable.Hours.forEach(hour => console.log(`${hour.Id} ${hour.BeginTime} ${hour.EndTime}`))
  console.log(timeTable.Days[1].Atoms);
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

    case 'timetable':
      const timeTable = await getTimeTable(token);
      if (!timeTable) return;
      drawTimeTable(timeTable);
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
