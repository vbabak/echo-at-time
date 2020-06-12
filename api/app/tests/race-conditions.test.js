'use strict';

const app = require('../app');
const errorMessages = require('../config/error-messages');
const randomString = require("../helpers/random-string");
const EchoMessageStorage = require('../helpers/storage/echo-message-storage');
const RedisClient = require("../libs/redis-client");
let redisClient = app.context.dbredis;
let msgStorage = new EchoMessageStorage(redisClient);

beforeAll(async (done) => {
  done();
});

afterAll(async (done) => {
  await app.context.dbredis.quit();
  done();
});

describe('Race conditions', () => {
  test('lock/unlock the key in race', async () => {
    let key = await randomString(5);
    let id_ok = await redisClient.lockKey(key);
    let id_fail = await redisClient.lockKey(key, 0);
    let not_unlocked = await redisClient.unlockKey(key, key);
    let unlocked = await redisClient.unlockKey(key, id_ok);

    expect(id_ok.length).toBeGreaterThan(2);
    expect(id_fail).toBe(false);
    expect(not_unlocked).toBe(false);
    expect(unlocked).toBe(true);
  });

  test('watch-multi-exec', async () => {
    let key = await randomString(5);
    await redisClient.cmd("set", [key, 1])
    await redisClient.cmd("watch", key);
    let newClient = new RedisClient(app.context.dbconfig);
    await newClient.cmd("set", [key, 0]);
    let multi = redisClient.getClient().multi();
    multi.del(key);
    let multi_rows = await redisClient.execMulti(multi);
    let del_cnt = await newClient.cmd("del", [key]);
    await newClient.quit();
    expect(multi_rows).toBe(null);
    expect(del_cnt).toBeGreaterThan(0);
  });

});