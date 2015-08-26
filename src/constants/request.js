/**
 * @module request.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// Angie Modules
import app from                                 '../Angie';

app.constant('RESPONSE_HEADER_MESSAGES', {
    200: 'OK',
    404: 'File Not Found',
    500: 'Invalid Request'
}).constant(
    'PRAGMA_HEADER',
    'no-cache'
).constant(
    'NO_CACHE_HEADER',
    'private, no-cache, no-store, must-revalidate'
);