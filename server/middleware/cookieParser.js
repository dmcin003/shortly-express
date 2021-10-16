var color = require('colors');

const parseCookies = (req, res, next) => {
  if (!req.headers.cookie) {
    return next();
  }

  req.cookies = Object.create(null);
  var parse = req.headers.cookie;
  parse = parse.split(';').join().split(', ');
  parse.forEach((item) => {
    item = item.split('=');
    req.cookies[item[0]] = item[1];
  });
  console.log('this is parse currently: ', parse);

  return next();
};

module.exports = parseCookies;