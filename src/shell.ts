import promptSync from 'prompt-sync';
import promptSyncHistory from 'prompt-sync-history';

const prompt = promptSync({
  history: promptSyncHistory(),
});

export class Shell {
  userName: string;
  inputPrompt: string;
  commandPrompt: string;
  hostName: string;

  constructor() {
    this.userName = 'username';
    this.inputPrompt = '> ';
    this.commandPrompt = '> ';
    this.hostName = 'hostname';
  }

  setUserName = (userName: string) => {
    this.userName = userName;
  }

  setInputPrompt = (prompt: string) => {
    this.inputPrompt = prompt;
  }

  setCommandPrompt = (prompt: string) => {
    this.commandPrompt = prompt;
  }

  setHostName = (hostName: string) => {
    this.hostName = hostName;
  }
  
  getInput = (): string => {
    const input = prompt(this.inputPrompt);
    return input;
  }

  getPassword = (): string => {
    const password = prompt(this.inputPrompt, {
      echo: '*',
    });
    return password;
  }

  getCommand = (): {
    command: string[];
    options: string[];
  } => {
    let options: string[] = [];
    let command = prompt(`[\x1b[36m${this.userName}\x1b[0m@\x1b[32m${this.hostName}\x1b[0m]${this.commandPrompt}`);
    let splitCommand: string[] = command ? command.toLowerCase().split(' ') : [];

    if (splitCommand) {
      for (const part of splitCommand) {
        if (!part.startsWith('-') || part.length === 1) continue;
        const optionStrings = part.slice(1).split('');
        optionStrings.forEach(option => {
          if (!options.includes(option)) options.push(option);
        });
      }
    }

    return {
      command: splitCommand.filter(element => !element.startsWith('-')),
      options,
    };
  }
}
