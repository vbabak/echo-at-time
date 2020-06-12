'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');
const config = require("./config/config");
const env = process.env.NODE_ENV || 'production';
const dbconfig = require("./config/database")[env];
const RedisClient = require("./libs/redis-client");
const MessageConsumer = require("./services/message-consumer");

const app = new Koa();
app.use(bodyParser());
const router = new Router();

app.context.config = config;
app.context.dbconfig = dbconfig;

// errors handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { success: false, error: err.name, error_message: err.message };
    ctx.app.emit('error', err, ctx); // emit error to the stdout
  }
});

// compression
app.use(compress({
  filter: function(content_type) {
    return /text|json|xml/i.test(content_type)
  },
  threshold: 1024,
  flush: require('zlib').Z_SYNC_FLUSH
}));

app.context.dbredis = new RedisClient(dbconfig);

// routes setup
require("./routes")(router);
app.use(router.routes())
app.use(router.allowedMethods());

app.context.msg_consumer = new MessageConsumer(app.context.dbredis);

module.exports = app;
