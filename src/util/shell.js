'use strict'; 'use strong';

// System Modules
import repl from 'repl';

// Angie Modules
import $log from './$LogProvider';

const p = process;

export default function shell() {
    p.stdin.setEncoding('utf8');
    repl.start({
        prompt: $log.shell(),
        input: p.stdin,
        output: p.stdout
    });
}
