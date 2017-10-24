import fs from 'fs';
import less from 'less';
import LessPluginAutoPrefix from 'less-plugin-autoprefix';
import LessPluginCleanCSS from 'less-plugin-clean-css';
import { argv } from 'yargs';
import { STYLE_SRC, INLINE_STYLESHEET } from './constants';

function compile(file, callback) {
    fs.readFile(file, {encoding: 'utf8'}, function(err, data) {
        if(err) throw err;

        // consider https://github.com/bassjobsen/less-plugin-css-flip
        const autoprefixPlugin: LessPluginAutoPrefix = new LessPluginAutoPrefix();
        const cleanCSSPlugin: LessPluginCleanCSS = new LessPluginCleanCSS({advanced: true});
        const lessOptions: Object = {
            sourceMap: { sourceMapFileInline: true },
            plugins: [ autoprefixPlugin, cleanCSSPlugin ]
        }

        less.render(data.toString(), lessOptions).then(function(output){
            var clean = output.css;
            var wrapper = "const css=`" + clean + "`; export default css;";
            //fs.writeFile(file + ".js", wrapper, { encoding: 'utf8' }, callback);
            fs.writeFile(INLINE_STYLESHEET + "inline-styles.js", wrapper, { encoding: 'utf8' }, callback);
        });

    });
}

if(argv.build){
    // TODO
    compile(STYLE_SRC, () => { console.log("CSS compiled..."); } );
}
export default compile;
