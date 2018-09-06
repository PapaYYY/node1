// A "closer to real-life" app example
// using 3rd party middleware modules
// P.S. MWs calls be refactored in many files

// long stack trace (+clarify from co) if needed

const pathToRegexp = require('path-to-regexp');

if (process.env.TRACE) {
  require('./libs/trace');
}

const Koa = require('koa');
const app = new Koa();

const config = require('config');

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => require('./handlers/' + handler).init(app));

// can be split into files too
const Router = require('koa-router');
const router = new Router();

router.get('/views', async function(ctx, next) {
  let count = ctx.session.count || 0;
  ctx.session.count = ++count;

  ctx.body = ctx.render('./templates/index.pug', {
    user: 'John',
    count
  });
});


// параметр ctx.params
// см. различные варианты https://github.com/pillarjs/path-to-regexp
//   - по умолчанию 1 элемент пути, можно много *
//   - по умолчанию обязателен, можно нет ?
//   - уточнение формы параметра через regexp'ы
router.get('/user/:user/hello',
  async (ctx, next) => {
    if (ctx.params.user === 'admin') {
      await next();
      return;
    }

    ctx.throw(403);
  },
  async function(ctx) {
    ctx.body = "Hello, " + ctx.params.user;
  }
);

router.get('/', async function(ctx) {
  //ctx.redirect('/views');
  //ctx.redirect('/static.js');
  console.log('balalal');
    ctx.res.setHeader('Content-Type', 'text/html; charset=utf-8');
    sendFile("public/index.html", ctx.res);
  ctx.body = '1';
});

const clients = [];
//'/subscribe?r=:id'
router.get('/subscribe', async(ctx, next)=>{
  console.log('/subscribe');
  //ctx.body=ctx.params.id;
    clients.push(ctx.res);
    console.log(clients.length);
    ctx.body = 10000;
});

router.post('/publish', async(ctx, next)=>{
    console.log('/publish');
    ctx.body = ctx.req;
});

function sendFile(fileName, res) {
    const fileStream = fs.createReadStream(fileName);
    fileStream
        .on('error', function () {
            res.statusCode = 500;
            res.end("Server error");
        })
        .pipe(res)
        .on('close', function () {
            fileStream.destroy();
        });
}

app.use(router.routes());

app.listen(config.get('port'));
