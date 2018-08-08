let code = require('raw-loader!../dist/bundle.js');
import { set } from './codecache';
import {
    CLIENT_GLOBAL_NAME
} from './vars';

set(CLIENT_GLOBAL_NAME, code);
import Cookie from 'js-cookie';
Cookie.set(PACKAGE_JSON.name, PACKAGE_JSON.version);

require('./bootstrap-slim');