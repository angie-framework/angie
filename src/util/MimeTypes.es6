'use strict';


// TODO parse out extension and serve a default type
const STYLE_MIME_TYPE = 'text/css',
      JS_MIME_TYPE = 'application/javascript',
      __mimetypes__ = {
          css: STYLE_MIME_TYPE,
          js: JS_MIME_TYPE
      };

export default __mimetypes__;
