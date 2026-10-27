import {appBadge} from './app-badge';
import {artifactGroup} from './artifact-group';
import {buttonSwap} from './button-swap';
import {card} from './card';
import {commandPalette} from './command-palette';
import {connector} from './connector';
import {debug} from './debug';
import {dialog} from './dialog';
import {editor} from './editor';
import {extension} from './extension';
import {listActions} from './list-actions';
import {notification} from './notification';
import {picker} from './picker';
import {policy} from './policy';
import {queuedMessage} from './queued-message';
import {remote} from './remote';
import {remoteEnvironments} from './remote-environments';
import {sessionsFind} from './sessions-find';
import {sessionsOrganize} from './sessions-organize';
import {sessionsRename} from './sessions-rename';
import {setting} from './setting';
import {signIn} from './sign-in';
import {slashMenu} from './slash-menu';
import {systemNotification} from './system-notification';
import {toolApproval} from './tool-approval';
import type {SceneMake} from './types';
import {update} from './update';
import {web} from './web';
import {windows} from './windows';

/** The scene library by name (an episode's visual: {kind: 'scene', name, params}); library.json describes each. */
export const SCENES: Record<string, SceneMake> = {
  'button-swap': buttonSwap,
  'app-badge': appBadge,
  'list-actions': listActions,
  picker,
  'queued-message': queuedMessage,
  'sessions-find': sessionsFind,
  'slash-menu': slashMenu,
  dialog,
  setting,
  'command-palette': commandPalette,
  notification,
  editor,
  card,
  policy,
  windows,
  web,
  'system-notification': systemNotification,
  'sign-in': signIn,
  extension,
  remote,
  'tool-approval': toolApproval,
  debug,
  update,
  'sessions-organize': sessionsOrganize,
  'sessions-rename': sessionsRename,
  'remote-environments': remoteEnvironments,
  connector,
  'artifact-group': artifactGroup,
};
