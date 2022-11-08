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

  getCommand = (): string[] => {
    let command = prompt(`[\x1b[36m${this.userName}\x1b[0m@\x1b[32mbakalari\x1b[0m]${this.commandPrompt}`);
    if (!command) return [];
    return command.toLowerCase().split(' ');
  }
}
