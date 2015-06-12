'use strict'; 'use strong';

import $log from './$LogProvider';

const repl =        require('repl');

const p = process;

export default function shell() {
    p.stdin.setEncoding('utf8');
    repl.start({
        prompt: $log.shell(),
        input: p.stdin,
        output: p.stdout
    });
}
