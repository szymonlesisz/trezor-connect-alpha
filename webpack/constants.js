import path from 'path';

export const ABSOLUTE_BASE = path.normalize(path.join(__dirname, '..'));
export const LIB_NAME = 'Trezor';
export const DIST = path.join(ABSOLUTE_BASE, 'dist/');
export const JS_SRC = path.join(ABSOLUTE_BASE, 'src/js/');
export const HTML_SRC = path.join(ABSOLUTE_BASE, 'src/html/');
export const CSS_SRC = path.join(ABSOLUTE_BASE, 'src/css/');
export const NODE_MODULES = path.join(ABSOLUTE_BASE, 'node_modules/');
export const PORT = 8081;
