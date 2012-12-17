# Migrate-Oracle-To-Mysql

Mirate oracle to mysql.

## How to Install

 * Install [Instant Client Package - Basic Lite](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html)
 * Install [Instant Client Package - SDK](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html)
 * Finally install using Node Package Manager (npm):

NPM
```bash
npm install migrate-oracle-to-mysql
```

ENV
```bash
export OCI_INCLUDE_DIR=/opt/instantclient/sdk/include
export OCI_LIB_DIR=/opt/instantclient
export LD_LIBRARY_PATH=/opt/instantclient
export NLS_LANG=American_America.AL32UTF8
```

GIT
```bash
git clone https://github.com/iamdenny/migrate-oracle-to-mysql.git
```

## How to use

```js
var Mom = require('migrate-oracle-to-mysql');
var oMom = new Mom({
    sHostname : '127.0.0.1',
    sUser : 'username',
    sPassword : 'password',
    nPort : 1527,
    sDatabase : 'database or sid'
}, {
    sHostname : '127.0.0.1',
    sUser : 'username',
    sPassword : 'password',
    nPort : 3306,
    sDatabase : 'database',
    bDebug : false
});

oMom.on('connected', function(){
	// first arg : oracle query
	// second arg : mysql table name
	// third arg : truncate(delete data from mysql table)
	// forth arg : callback
    oMom.migrateByQuery("SELECT username, nickname FROM user",
      'user', true, function(htResult){
          console.log('First migration is done', htResult);
      });

    oMom.migrateByQuery("SELECT group_id, group_name FROM group",
      'group', true, function(htResult){
          console.log('Second migration is done', htResult);
      });
    
    oMom.migrateByQuery("SELECT article_idx, title FROM article",
      'article', true, function(htResult){
          console.log('Thrid migration is done', htResult);
      });      
}).on('done', function(htResult){
    console.log('All done', htResult);
    process.exit(0);
});
```