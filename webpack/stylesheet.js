import fs from 'fs';
import less from 'less';
import LessPluginAutoPrefix from 'less-plugin-autoprefix';
import LessPluginCleanCSS from 'less-plugin-clean-css';
import { argv } from 'yargs';
import { STYLESHEET } from './constants';

function compile(file, callback) {
    fs.readFile(file, {encoding: 'utf8'}, function(err, data) {
        if(err) throw err;

        // consider https://github.com/bassjobsen/less-plugin-css-flip
        var autoprefixPlugin = new LessPluginAutoPrefix();
        var cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});
        var lessOptions = {
            sourceMap: { sourceMapFileInline: true },
            plugins: [ autoprefixPlugin, cleanCSSPlugin ]
        }

        less.render(data.toString(), lessOptions).then(function(output){

            var clean = output.css;
            var wrapper = "const css=`" + clean + "`; export default css;";

            fs.writeFile(file + ".js", wrapper, { encoding: 'utf8' }, callback);
        });

    });
}

if(argv.build){
    compile(STYLESHEET, () => { console.log("CSS compiled..."); } );
}
export default compile;
