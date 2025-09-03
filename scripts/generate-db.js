#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const gen = require('./db.js');

const data = typeof gen === 'function' ? gen() : gen;
const outPath = path.join(process.cwd(), 'db.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(`Wrote ${outPath}`);
