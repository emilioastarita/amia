import db = require("./db");
import express = require('express');
import passport = require('passport');
import mysql = require('mysql');
import nconf = require('nconf');
var debug = require('debug')('amia');

interface Request extends express.Request {
  flash(name: string, value?: string): any;
  session : any;
}
interface Response extends express.Response {

}

function setFlashMessagesOnSave(req: Request, err: mysql.IError) {
  if (err) {
    req.flash('error', 'Fail');
  } else {
    req.flash('message', 'Ok');
  }
}

function secureRoute(req: Request, res: Response, next) {
  if (req.isAuthenticated())
    return next()
  req.logout();
  res.redirect('/login');
}

var node = {
  typeOptions: [
      {name: 'Persona/Organización', value: 'entity'},
      {name: 'Hecho', value: 'fact'},
  ],
  new(req: Request, res: Response) {
    res.render('node-new.jade', {typeOptions: node.typeOptions});
  },
  save(req: Request, res: Response) {
    db.saveNode(req.body, req.files.photo, () => {
      req.flash('message', 'Saved node');
      res.redirect('/admin');
    });
  },
  delete(req: Request, res: Response) {
    db.deleteNode(req.params.id, (err, result) => {
      setFlashMessagesOnSave(req, err);
      res.json({err: err});
    });
  },
  edit(req: Request, res: Response) {
    db.getNode(req.params.id, (err, n) => {
      res.render('node-edit.jade', { node: n, typeOptions: node.typeOptions });
    })
  }
};

var edge = {
  new(req: Request, res: Response) {
    db.getNodes((err, nodes) => {
      res.render('edge-new.jade', { nodes: nodes });
    });
  },
  save(req: Request, res: Response) {
    db.saveEdge(req.body, (err, result) => {
      setFlashMessagesOnSave(req, err);
      res.redirect('/admin');
    });
  },
  delete(req: Request, res: Response) {
    db.deleteEdge(req.params.id, (err, result) => {
      setFlashMessagesOnSave(req, err);
      res.json({err: err});
    });
  },
  edit(req: Request, res: Response) {
    db.getNodes((err, nodes) => {
      db.getEdge(req.params.id, (err, edge) => {
        res.render('edge-edit.jade', { nodes: nodes, edge: edge });
      });
    });
  }
};



export function loadRoutes(app: express.Express) {
  app.use((req: Request, res, next) => {
    res.locals.clientOptions = {
      'dir-uploads': nconf.get('dir-uploads'),
      'analytics': nconf.get('analytics'),
    };
    console.log('Res locals es: ', res.locals);
    res.locals.user = req.isAuthenticated() ? req.user : null;
    res.locals.flash_error = req.flash('error');
    res.locals.flash_message = req.flash('message');
    next();
  });

  app.get('/', (req: Request, res: Response) => {
    res.render('index.jade');
  });

  app.get('/admin', secureRoute, (req: Request, res: Response) => {
    db.getAllIndexed((err, result) => {
      res.render('admin.jade', { info: result });
    });
  });


  app.get('/node-new', secureRoute, node.new);
  app.post('/node-save', secureRoute, node.save);
  app.get('/node-edit/:id', secureRoute, node.edit);
  app.post('/node-delete/:id', secureRoute, node.delete);

  app.get('/edge-new', secureRoute, edge.new);
  app.post('/edge-save', secureRoute, edge.save);
  app.get('/edge-edit/:id', secureRoute, edge.edit);
  app.post('/edge-delete/:id', secureRoute, edge.delete);

  app.get('/json-data', (req: Request, res: Response) => {
    db.getAllIndexed((err, result) => {
      if (err) {
        return res.send('error');
      }
      res.json(result);
    });
  });
  app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/admin',
      failureRedirect: '/login',
      failureFlash: true,
      usernameField: 'email'
    })
    );
  app.get('/login', (req: Request, res: Response) => {
    res.render('login.jade');
  });

  app.get('/logout', function(req : Request, res : Response) {
    res.clearCookie('connect.sid');
    req.session.destroy(err => {
      req.session = null //
      console.log('Is authenticated???', err, req.isAuthenticated());
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });


};
