import path from 'path';

export const ABSOLUTE_BASE = path.normalize(path.join(__dirname, '..'));

const constants = Object.freeze({
  ABSOLUTE_BASE,
  DIST: path.join(ABSOLUTE_BASE, 'dist/'),
  SRC: path.join(ABSOLUTE_BASE, 'src/'),
  ELECTRON_SRC: path.join(ABSOLUTE_BASE, 'examples/electron/'),
  PORT: 8081,
  DEV_INDEX_BROWSER: path.join(ABSOLUTE_BASE, 'examples/browser.html'),
  DEV_INDEX_REACT: path.join(ABSOLUTE_BASE, 'examples/react.html'),
  DEV_INDEX_ELECTRON: path.join(ABSOLUTE_BASE, 'examples/electron/index.html'),
});

export const LIB_NAME = 'TrezorConnect';
export const DIST = constants.DIST;
export const SRC = constants.SRC;
export const ELECTRON_SRC = constants.ELECTRON_SRC;
export const PORT = constants.PORT;
export const DEV_INDEX_BROWSER = constants.DEV_INDEX_BROWSER;
export const DEV_INDEX_REACT = constants.DEV_INDEX_REACT;
export const DEV_INDEX_ELECTRON = constants.DEV_INDEX_ELECTRON;


export default constants;
