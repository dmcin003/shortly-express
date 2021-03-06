const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');
const parseCookies = require('./middleware/cookieParser');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(parseCookies);
app.use(Auth.createSession);




app.get('/',
  (req, res) => {
    res.render('');
  });

//requires a verification
app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/login', (req, res, next)=>{
  //
  let data = req.body;
  models.Users.getAll()
    .then((dbData)=>{
      var userHere = {
        present: false,
        index: null,
        userId: null
      };
      for (var i = 0; i < dbData.length; i++) {
        if (data.username === dbData[i].username) {
          userHere.present = true;
          userHere.index = i;
          userHere.userId = dbData[i].id;
        }
      }
      if (!userHere.present) {
        return res.redirect('/login');
      } else if (models.Users.compare(data.password, dbData[userHere.index].password, dbData[userHere.index].salt)) {
        // console.log(userHere.userId);

        // models.Sessions.update({ hash: req.session.hash }, { userId: userHere.userId })
        //   .then((data) => {
        //     console.log('update data', data);
        //   })
        //   .catch((err) => {
        //     console.log('update error', err);
        //   });

        // console.log(req.session);
        return res.redirect('/');
      } else {
        return res.redirect('/login');
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400);
    });
});

app.post('/signup', (req, res, next) => {
  let data = req.body;
  models.Users.get({username: data.username})
    .then((userInDB) =>{
      if (userInDB) {
        return res.redirect('/signup');
      } else {
        models.Users.create(data)
          .then((createResult) => {
            // res.cookie('COOKIE', 'Macadamia Nut Cookie vs Snickerdoodle, who wins? Everyone.');
            res.redirect('/');
          });
      }
    }).catch((err)=>{
      res.status(400);
    });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});
/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
