/**
 * @module cookie.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/29/2015
 */

// System Modules
import cookie from      'cookie';
import $Injector from   'angie-injector';

// TODO lookup getters and setters on classes
class $$CookieFactory {
    constructor() {
        this.$$cookies = {};
    }
    get (key) {
        const $request = $Injector.get('$request');

        if (
            !Object.keys(this.$$cookies).length &&
            $request.headers &&
            $request.headers.hasOwnProperty('cookie')
        ) {
            this.$$cookies = cookie.parse($request.headers.cookie);
        }

        if (this.$$cookies.hasOwnProperty(key)) {
            return this.$$cookies[ key ];
        }
    }
    set (key, value, expiry = +new Date()) {
        let cookieStr = '';

        this.$$cookies[ key ] =
            `${value};expires=${new Date(expiry).toUTCString()}`;

        for (let key in this.$$cookies) {
            cookieStr += `${key}=${this.$$cookies[ key ]},`;
        }

        // TODO two options here...we can store the cookie values in an object
        // and set the hash equal to that object...or we can just manipulate the
        // value on the fly...let's manupulate the value on the fly

        // Cannot really use getters and setters here
        $Injector.get('$response').setHeader('Set-Cookie', cookieStr);
        return true;
    }
}

// TODO set the $request and $response cookies

const $Cookie = new $$CookieFactory();
export default $Cookie;