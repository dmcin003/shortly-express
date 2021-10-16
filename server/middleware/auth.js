const colors = require('colors');
const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
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
    res.cookies = Object.create(null);
    res.cookies.shortlyid = { value: sessionId };
    return next();
    // models.Sessions.get({ 'hash': sessionId })
    //   .then((query) => {
    //     console.log('hash from query', query.hash);
    //     req.session.hash = query.hash;
    //     next();
    //   });

    // look up sessions in db and see if  already exist with current cookie
    // models.Sessions.get(req.session.hash)
    //   .then((data)=>{
    //     console.log('Sessions DATA:', data);
    //   });
    //
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

