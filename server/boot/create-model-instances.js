module.exports = function(app) {
  var User = app.models.User;




  // creating user with empty password : 2.8.0 user created , 2.9.0 application crash due to uncaught exception
  User.create({username: 'John', email: 'john@doe.com', password: ''}, function (err, user) {
    if (err) return console.log('%j', err);
    console.log(user);
  });



  //now override validatePassword to check on minimum length

   User.validatePassword = function(plain) {
   if (typeof plain === 'string' && plain && plain.length > 4) {
   return true;
   }

   var err =  new Error('Invalid password: ' + plain);
   err.statusCode = 422;
   throw err;
   };

  // creating user with too short password : 2.8.0 user created , 2.9.0 application crash due to uncaught exception

  User.create({username: 'Jane', email: 'jane@doe.com', password:'1234'},function(err,user){
    if(err) return console.log('%j',err);
    console.log(user);
  });

  // update 02-09-2015 : above errors are now returned in cb with loopback@2.21.0 and   loopback-datasource-juggler@2.39.0
  // see commit  :https://github.com/strongloop/loopback-datasource-juggler/commit/21c0067462f48210f156bb043cb4076e979ff94d
  // "Report deferred exceptions via callback"
  // but wrapping error in autoupdate function will crash server

  var dataSource = app.datasources.db;
  dataSource.autoupdate(null,function() {

    User.create({username: 'John', email: 'john@doe.com', password: ''}, function (err, user) {
      if (err) return console.log('%j', err);
      console.log(user);
    });
  });

  // when calling user.create remotely exception will be caught in try catch surrounding call
  // RemoteObjects.prototype.execHooks => function execStack

 User.test = function(cb){
   User.create({username: 'John', email: 'john@doe.com', password:''},function(err,user){
     if(err)return cb(new Error("error returned in cb :" + err));
     cb(user);
   });
 }

  User.remoteMethod('test', {
    accepts: [
    ],
    returns: {arg: 'result', type: 'object'},
    http: {verb: 'post'}
  });
}
