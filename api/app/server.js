'use strict'

const app = require('./app');
const port = 4000;
app.listen(port);
app.context.msg_consumer.restart().then().catch(console.error);
console.log(`serving on port ${port}`);