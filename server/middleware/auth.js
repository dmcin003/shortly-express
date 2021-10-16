const colors = require('colors');
const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('this is our Cookies from shortly id: ', req.cookies);
  // create session property that is an object on req with hash property
  req.session = Object.create(null);
  // if no cookies exist then
  let sessionId = req.cookies.shortlyid;
  if (!sessionId) {
    // assign session object a property called hash
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

