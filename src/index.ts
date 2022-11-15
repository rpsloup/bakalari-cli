import { Shell } from './shell';
import {
  loadLoginInfo,
  saveLoginInfo,
} from './functions/dataFunctions';
import {
  getUserAuth,
  getAccessToken,
} from './functions/authFunctions';
import { handleCommand } from './functions/commandFunctions';

export const WORK_DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá'];
export const HOSTNAME = 'bakalari';

export const shell = new Shell();
shell.setInputPrompt('> ');
shell.setHostName(HOSTNAME);

const logWelcomeMessage = (): void => {
  console.log('Bakaláři CLI\n');
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
