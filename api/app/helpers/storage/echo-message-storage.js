"use strict";

const sleep = require("../sleep");

class EchoMessageStorage {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.zset = "msg_time";
  }

  getListKey(id) {
    let list = "msg_list:" + id;
    return list;
  }

  async save(time, message) {
    let list_key = this.getListKey(time);
    let lock_id = await this.redisClient.lockKey(list_key);
    if (!lock_id) {
      return false;
    }
    await this.redisClient.cmd("zadd", [this.zset, "NX", time, time]);
    await this.redisClient.cmd("rpush", [list_key, message]);
    await this.redisClient.unlockKey(list_key, lock_id);
    return true;
  }

  async fetchRecentTime() {
    let time = await this.redisClient.cmd("zrange", [this.zset, 0, 0]);
    time = time.length ? time[0] : false;
    time = parseInt(time);
    return time;
  }

  async getClosestTime() {
    let time = await this.fetchRecentTime();
    if (!time) {
      return false;
    }
    let is_valid = await this.validateTime(time);
    if (!is_valid) {
      time = await this.getClosestTime();
    }
    return time;
  }

  async validateTime(time) {
    let d = new Date(time), res = true;
    if (d.toString() == "Invalid Date") {
      res = false;
      console.error(`"${time}" is invalid time, cleaning up ... `);
      let list = this.getListKey(time);
      try {
        let lock_id = await this.redisClient.lockKey(list);
        if (!lock_id) {
          return res;
        }
        await this.redisClient.cmd("zrem", [this.zset, time]);
        await this.redisClient.cmd("del", [list]);
        await this.redisClient.unlockKey(list, lock_id);
      } catch (e) {
        console.error(e);
      }
    }
    return res;
  }

  async fetchWaitingList() {
    let messages = [];
    let time = await this.fetchRecentTime()
    if (!time) {
      return messages;
    }
    let is_valid = await this.validateTime(time);
    if (!is_valid) {
      return messages;
    }
    if ((new Date(time)).getTime() - (new Date()).getTime() <= 0) {
      let list = this.getListKey(time);
      let lock_id = await this.redisClient.lockKey(list);
      let key_exists = await this.redisClient.cmd("exists", list);
      if (!lock_id || !key_exists) {
        return messages;
      }
      try {
        messages = await this.redisClient.cmd("lrange", [list, 0, -1]);
        await this.redisClient.cmd("del", [list]);
      } catch (e) {
        messages = [];
      }
      await this.redisClient.cmd("zrem", [this.zset, time]);
      await this.redisClient.unlockKey(list, lock_id);
    }
    return messages;
  }
}

module.exports = EchoMessageStorage;
