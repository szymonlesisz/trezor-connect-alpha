import fs from 'fs';
import less from 'less';
import LessPluginAutoPrefix from 'less-plugin-autoprefix';
import LessPluginCleanCSS from 'less-plugin-clean-css';
import { argv } from 'yargs';
import { STYLE_SRC, INLINE_STYLESHEET } from './constants';

// Complies the inline modal stylesheet
// (needs to be compiled to JS, so the user doesn't have to add CSS; and we need the style in the page itself, to force user to click)
function compile(file, callback) {
    fs.readFile(file, {encoding: 'utf8'}, function (err, data) {
        if (err) throw err;

        // consider https://github.com/bassjobsen/less-plugin-css-flip
        const autoprefixPlugin = new LessPluginAutoPrefix();
        const cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});
        const lessOptions = {
            sourceMap: { sourceMapFileInline: true },
            plugins: [ autoprefixPlugin, cleanCSSPlugin ],
        };

        less.render(data.toString(), lessOptions).then(function (output) {
            const clean = output.css;
            const wrapper = 'const css=`' + clean + '`; export default css;';
            fs.writeFile(INLINE_STYLESHEET + 'inline-styles.js', wrapper, { encoding: 'utf8' }, callback);
        });
    });
}

if (argv.build) {
    // TODO
    compile(STYLE_SRC, () => { console.log('CSS compiled...'); });
}
export default compile;
