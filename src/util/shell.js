'use strict'; 'use strong';

// System Modules
import repl from            'repl';
import $LogProvider from    'angie-log';

const p = process;

function shell() {
    app.$$load().then(function() {
        p.stdin.setEncoding('utf8');
        repl.start({
            prompt: $LogProvider.$shell(),
            input: p.stdin,
            output: p.stdout
        });
    });
}

export default shell;
