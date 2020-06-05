"use strict";

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
    await this.redisClient.cmd("zadd", [this.zset, "NX", time, time]);
    let list_key = this.getListKey(time);
    await this.redisClient.cmd("rpush", [list_key, message]);
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
        await this.redisClient.cmd("zrem", [this.zset, time]);
        await this.redisClient.cmd("del", [list]);
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
      let rem_idx = null;
      try {
        rem_idx = await this.redisClient.cmd("zrem", [this.zset, time]);
      } catch (e) {
        rem_idx = false;
      }
      if (!Number.isInteger(rem_idx) || rem_idx === 0) {
        console.log("Item was't found, skipping");
        return messages;
      }
      let list = this.getListKey(time);
      try {
        messages = await this.redisClient.cmd("lrange", [list, 0, -1]);
        await this.redisClient.cmd("del", [list]);
      } catch (e) {
        messages = [];
      }
    }
    return messages;
  }
}

module.exports = EchoMessageStorage;
