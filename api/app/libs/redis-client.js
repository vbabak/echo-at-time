'use strict';

const { v4: uuid4 } = require('uuid');
const redis = require("redis");
const { promisify } = require("util");
const sleep = require("../helpers/sleep");

class RedisClient {
  constructor(dbconfig) {
    let db = dbconfig.redis.database;
    let host = dbconfig.redis.host;
    let port = dbconfig.redis.port;
    let password = dbconfig.redis.pwd;
    this.client = redis.createClient({ port, host, db, password });
    this.client.on("error", console.error);
  }

  getClient() {
    return this.client;
  }

  getLockKey(key) {
    let k = "lock:" + key;
    return k;
  }

  async lockKey(key, timeout = 10, ttl = 7) {
    let id = uuid4();
    let lock_key = this.getLockKey(key);
    let end = timeout * 1000; // ms
    let ms_sleep = 50;
    let success = false;
    while (end >= 0) {
      end -= ms_sleep;
      success = await this.cmd("set", [lock_key, id, "NX", "EX", ttl]);
      if (success) break;
      await sleep(ms_sleep);
    }
    return success ? id : false;
  }

  async unlockKey(key, id) {
    let lock_key = this.getLockKey(key);
    await this.cmd("watch", lock_key);
    let process_id = await this.cmd("get", lock_key);
    if (process_id != id) {
      await this.cmd("unwatch");
      return false;
    }
    let multi = this.client.multi();
    multi.del(lock_key);
    let rows = await this.execMulti(multi);
    return rows ? rows.length > 0 : false;
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
    let res, cmd_async = promisify(this.client[cmd]).bind(this.client);
    if (args) res = await cmd_async(args)
    else res = await cmd_async()
    return res;
  }

  async execMulti(multi) {
    return new Promise((resolve, reject) => {
      multi.exec((err, replies) => {
        if (err) reject(err);
        else resolve(replies);
      });
    });
  }
}

module.exports = RedisClient;
