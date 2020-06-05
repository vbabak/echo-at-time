'use strict';

const request = require('supertest');
const app = require('../app');
const errorMessages = require('../config/error-messages');
const randomString = require("../helpers/random-string");

beforeAll(async (done) => {
  done();
});

afterAll(async (done) => {
  await app.context.dbredis.quit();
  done();
});

describe('Message scheduler', () => {
  test('Return 201 after created', async () => {
    let randon_msg = await randomString(5);
    let data = { message: `Message ${randon_msg}`, time: Date.now() };

    const response = await request(app.callback())
      .post('/echoAtTime')
      .send(data);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test('Save multiple massages for the same processing time', async () => {
    let randon_msg = await randomString(5);
    let data = { message: `Message ${randon_msg}`, time: Date.now() };

    const response1 = await request(app.callback())
      .post('/echoAtTime')
      .send(data);
    randon_msg = await randomString(5);
    data.message = `Message ${randon_msg}`;
    const response2 = await request(app.callback())
      .post('/echoAtTime')
      .send(data);

    expect(response2.statusCode).toBe(201);
    expect(response2.body.success).toBe(true);
  });

  test('Required payload data is missed', async () => {
    let data = { message: "" };

    const response = await request(app.callback())
      .post('/echoAtTime')
      .send(data);

    expect(response.statusCode).toBe(400);
    expect(response.body.error_message).toBe(errorMessages.PAYLOAD_PARAMETER_MISSING("time"));
  });

  test('"time" is not in miliseconds', async () => {
    let data = { message: new Date(), time: "987654" };

    const response = await request(app.callback())
      .post('/echoAtTime')
      .send(data);

    // expect(response.statusCode).toBe(400);
    console.log(response.body)
    expect(response.body.error_message).toBe(errorMessages.TIME_NOT_MICROSEC);
  });

});
