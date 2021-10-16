const parseCookies = (req, res, next) => {
  req.cookies = Object.create(null);

  if (!req.headers.cookie) {
    return next();
  }

  let parse = req.headers.cookie;
  parse = parse.split(';').join().split(', ');

  parse.forEach((item) => {
    item = item.split('=');
    req.cookies[item[0]] = item[1];
  });

  next();
};

module.exports = parseCookies;