'use strict'; 'use strong';

// System Modules
import repl from            'repl';
import $LogProvider from    'angie-log';

const p = process;

export default function shell() {
    p.stdin.setEncoding('utf8');
    repl.start({
        prompt: $LogProvider.shell(),
        input: p.stdin,
        output: p.stdout
    });
}
