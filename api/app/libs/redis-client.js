'use strict';

const redis = require("redis");
const { promisify } = require("util");

class RedisClient {
  constructor(dbconfig) {
    let db = dbconfig.redis.database;
    let host = dbconfig.redis.host;
    let port = dbconfig.redis.port;
    let password = dbconfig.redis.pwd;
    this.client = redis.createClient({ port, host, db, password });
    this.client.on("error", console.error);
  }

  async getClient() {
    return this.client;
  }

  async quit() {
    let res = await new Promise((resolve, reject) => {
      this.client.quit((err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
    return res;
  }

  async cmd(cmd, args) {
    let cmd_async = promisify(this.client[cmd]).bind(this.client);
    let res = await cmd_async(args);
    return res;
  }
}

module.exports = RedisClient;
