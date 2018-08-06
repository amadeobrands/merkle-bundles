const assert = require('assert');
const fs = require('fs');

const readText = (f) => fs.readFileSync(__dirname + f, 'utf-8')
let example1 = readText('/example1.js')
let example2 = readText('/example2.js')

const merkle = require('../merkle');


describe('loads src into a tree', () => {
    let ast1 = merkle.parse(example1);
    let ast2 = merkle.parse(example2);
})