import promptSync from 'prompt-sync';

const prompt = promptSync();

export class Shell {
  userName: string;
  inputPrompt: string;
  commandPrompt: string;

  constructor() {
    this.userName = 'username';
    this.inputPrompt = '> ';
    this.commandPrompt = '> ';
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

  getInput = (): string => {
    const input = prompt(this.inputPrompt);
    return input;
  }

  getCommand = (): {
    command: string[];
    options: string[];
  } => {
    let options: string[] = [];
    let command = prompt(`[\x1b[36m${this.userName}\x1b[0m@\x1b[32mbakalari\x1b[0m]${this.commandPrompt}`);
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
      command: splitCommand,
      options,
    };
  }
}
