const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('WE IN HERE');
  req.session = Object.create(null);
  let sessionId = req.cookies.shortlyid;
  if (!sessionId) {
    models.Sessions.create()
      .then((sessionHash) => {
        let id = sessionHash.insertId;
        models.Sessions.get({ id })
          .then((data) => {
            req.session.hash = data.hash;
            res.cookies = Object.create(null);
            res.cookies.shortlyid = { value: data.hash };
            return next();
          });
      })
      .catch((err)=>{
        console.log(err);
      });
  } else {
    req.session.hash = sessionId;
    models.Sessions.get({ hash: sessionId })
      .then((data) => {
        if (!data) {
          delete req.session;
          delete req.cookies.shortlyid;
          return module.exports.createSession(req, res, next);
        } else if (!data.userId) {
          return next();
        }
        let userId = data.userId;
        let username = data.user.username;
        req.session.user = { username: username };
        req.session.userId = userId;
        next();
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// module.exports.verifySession = (req, res, next) => {
//   if (!req.session.user) {
//     res.render('login');
//   }
// };