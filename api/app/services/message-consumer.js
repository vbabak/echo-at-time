"use strict";

const EchoMessageStorage = require('../helpers/storage/echo-message-storage');
const moment = require("moment");

class MessageConsumer {
  constructor(redisClient) {
    this.storage = new EchoMessageStorage(redisClient);
    this.timer = null;
    this.max_delay = 1000; // msec
  }

  async restart() {
    if (this.timer) {
      clearTimeout(this.timer);
    };
    let time_val = await this.storage.getClosestTime();
    if (!time_val) {
      this.next(this.max_delay);
    } else {
      let next_date = new Date(time_val);
      let now = Date.now();
      let sleep = next_date.getTime() - now;
      if (sleep <= 0) {
        await this.consume(time_val);
      } else {
        if (sleep > this.max_delay) sleep = this.max_delay;
        this.next(sleep);
      }
    }
  }

  next(delay) {
    this.timer = setTimeout(() => {
      this.restart().then().catch(console.error);
    }, delay);
  }

  async consume(time_val) {
    let dt = moment(new Date(time_val)).format("YYYY-MM-DD HH:mm:ss");
    console.log(`Consuming time (scheduled): ${dt}`);
    let msgs = await this.storage.fetchWaitingList();
    console.log("Found " + msgs.length + " messages");
    for (let msg of msgs) {
      await this.process(msg);
    }
    this.next(0);
  }

  async process(msg) {
    console.log(msg);
  }
}

module.exports = MessageConsumer;
