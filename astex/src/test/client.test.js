import { dirname } from 'path';

const request = require('supertest');
const assert = require('assert');
const path = require('path');
const msgpack = require("msgpack-lite");
const fs = require('fs');
const arrayBufferToHex = require('array-buffer-to-hex')


import bootstrap from './client/bootstrap';


describe('handles from code cache', () => {
    bootstrap()
})
