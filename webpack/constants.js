import path from 'path';

export const ABSOLUTE_BASE = path.normalize(path.join(__dirname, '..'));
export const LIB_NAME = 'TrezorConnect';
export const NODE_MODULES = path.join(ABSOLUTE_BASE, 'node_modules/');

export const CONNECT_SRC = path.join(ABSOLUTE_BASE, 'src/');

export const CONNECT_JS_SRC = path.join(ABSOLUTE_BASE, 'src/js/');
export const CONNECT_HTML_SRC = path.join(ABSOLUTE_BASE, 'src/html/');
export const CONNECT_STYLE_SRC = path.join(ABSOLUTE_BASE, 'src/styles/');
export const CONNECT_INLINE_STYLESHEET = path.join(ABSOLUTE_BASE, 'src/js/iframe/');
export const CONNECT_DIST = path.join(ABSOLUTE_BASE, 'dist/connect/');

export const EXPLORER_STYLE_SRC = path.join(ABSOLUTE_BASE, 'src/explorer/styles/');
export const EXPLORER_JS_SRC = path.join(ABSOLUTE_BASE, 'src/explorer/js/');
export const EXPLORER_HTML_SRC = path.join(ABSOLUTE_BASE, 'src/explorer/html/');
export const EXPLORER_DIST = path.join(ABSOLUTE_BASE, 'dist/explorer/');

export const CONNECT_PORT = 8081;
export const EXPLORER_PORT = 8080;
