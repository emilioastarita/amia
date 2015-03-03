import mysql = require('mysql');
import config = require('./config');
import async = require('async');
var gm = require('gm');
var debug = require('debug')('amia');
import auth = require('./auth');

var connection : mysql.IConnection = null;

interface Node {
  id?: number;
  name: number;
  type: string;
  description: string;
  photo?: string;
}

interface Edge {
  id?: number;
  node_from: number;
  node_to: number;
  type: string;
  name: string;
  date?: Date;
  description: string;
}

interface User {
  id?: number;
  email: string;
  password?: string;
  type: string;
}

export interface DbAmia {
  nodes: Node[];
  edges: Edge[];
}

interface FunDb<T> {
  (err: mysql.IError, rows: T[]): void;
}

interface FunDbOneResult<T> {
  (err: mysql.IError, rows: T): void;
}

interface FunDbSave {
  (err: mysql.IError,
   result : {
     insertedId? : number;
     affectedRows? : number;
     changedRows? : number;
  }): void;
}
interface FunDbConnect {
  (err: mysql.IError, result : any): void;
}

export function initDb(callback? : FunDbConnect) {
  var dbOptions = config.get('database');
  connection = mysql.createConnection(dbOptions);
  connection.connect(callback)
}
export function destroy() {
  connection.destroy();
}

function useOneResultFunc<T>(ready: FunDbOneResult<T>) {
  return (err, rows) => {
    if (err) return ready(err, null);
    ready(null, rows[0]);
  };
}

export function getAll(ready: Function): void {
  async.parallel([
    this.getNodes,
    this.getEdges,
  ],
    (err, results) => {
      if (err) {
        return ready(err, null);
      }
      ready(null, { nodes: results[0][0], edges: results[1][0] });
    }
    );
};

export function getAllIndexed(ready: FunDb<DbAmia>): void {
  var newResult: any = { nodes: {}, edges: {} };
  function makeIndexer(index): Function {
    return (e, i) => { newResult[index][e.id] = e; };
  }
  this.getAll((err, result) => {
    if (err) {
      return ready(err, null);
    }

    result.nodes.forEach(makeIndexer('nodes'));
    result.edges.forEach(makeIndexer('edges'));
    ready(err, newResult);
  });

}

export function getNodes(ready: FunDb<Node[]>): void {
  connection.query('select * from `node` order by name;', ready);
}

export function getEdges(ready: FunDb<Edge[]>): void {
  connection.query('select *, DATE_FORMAT(`date`,"%Y-%m-%d") as dateIso from `edge`;', ready);
}


export function getUserByEmail(mail: string, ready: FunDbOneResult<User>): void {
  connection.query('select * from `user` where `email` = ? ;', mail, useOneResultFunc(ready));
}

export function getNode(id: number, ready: FunDbOneResult<Node>): void {
  connection.query('select * from `node` where `id` = ? ;', id, useOneResultFunc(ready));
}

export function getEdge(id: number, ready: FunDbOneResult<Edge>): void {
  connection.query('select *, DATE_FORMAT(`date`,"%Y-%m-%d") as dateIso from `edge` where `id` = ? ;', id, useOneResultFunc(ready));
}

function compressAndResize(path: string) {
  var w = 100, h = 100;
  gm(path)
    .autoOrient()
    .resize(w, h, '^')
    .crop(w, h)
    .write(path, () => { });
}

export function saveEdge(formData, ready: FunDbSave): void {
  debug('saveEdge', formData);
  var edge: Edge = <Edge>{};
  edge.name = formData.name || '';
  edge.type = formData.type || '';
  edge.description = formData.description || '';
  if (formData.date !== '') {
    edge.date = formData.date;
  }

  edge.node_from = formData.node_from;
  edge.node_to = formData.node_to;
  delete edge.id;
  var q = '';
  if (formData.id === 'new') {
    q = 'insert into `edge` SET ? ';
    connection.query(q, edge, ready);
  } else {
    q = 'UPDATE `edge` SET ? WHERE id = ? limit 1';
    debug('UPDATE edge: ', edge);
    connection.query(q, [edge, formData.id], ready);
  }
}

export function deleteEdge(id : number, ready: FunDbSave): void {
  debug('deleteEdge', id);
  var q = 'delete from `edge` WHERE id = ? limit 1';
  connection.query(q, id, ready);
}
export function deleteNode(id : number, ready: FunDbSave): void {
  debug('deleteNode', id);
  var q = 'delete from `node` WHERE id = ? limit 1';
  connection.query(q, id, ready);
}

// utility functio to create a new user without registration.
export function createUserIfNotExists(email : string, password : string, userType : string, callback : FunDbSave) {
  getUserByEmail(email, function(err, user){
      if (err) {
        debug('Err creating user ' + email, err);
        return callback(err, null);
      }
      debug('Se encontró user', user);
      if (user) {
        return callback(null, null);
      }
      var q = 'insert into `user` SET ? ';
      var values =  {
        email: email ,
        password: auth.hashPassword(password),
        'type': userType
      };
      connection.query(q, values, callback);
  });
}

export function saveNode(formData, photo, ready: FunDbSave): void {
  debug('saveNode', formData);
  var node: Node = <Node>{};;
  node.name = formData.name || 'XXXX';
  node.type = formData.type || 'generico';
  node.description = formData.description || '';

  if (photo && photo.name) {
    compressAndResize(photo.path);
    node.photo = photo.name;
  }
  var q = '';
  if (formData.id === 'new') {
    q = 'insert into `node` SET ? ';
    connection.query(q, node, ready);
  } else {
    q = 'UPDATE `node` SET ? WHERE id = ? limit 1';
    debug('UPDATE node: ', node);
    connection.query(q, [node, formData.id], ready);
  }
}
