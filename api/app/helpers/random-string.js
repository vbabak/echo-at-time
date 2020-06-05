'use strict';

const crypto = require('crypto');

async function randomString(bytes) {
  let str = await new Promise((resolve, reject) => {
    crypto.randomBytes(bytes, (err, buf) => {
      if (err) reject(err);
      else resolve(buf.toString('hex'));
    });
  });
  return str;
}

module.exports = randomString;
