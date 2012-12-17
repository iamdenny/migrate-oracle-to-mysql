/**
 * Module dependencies.
 */
var Oracle = require('oracle'),
	Mysql = require('mysql');

/**
 * Export the constructor.
 * @ignore
 */
exports = module.exports = Migrator;

/**
 * Migrator class.
 * @name Migrator
 * @constructor
 */
function Migrator () {
	this.init.apply(this, arguments);
};

Migrator.prototype = {
	_htOracle : {
		sHostname : 'localhost',
		sUser : '',
		sPassword : '',
		nPort : 1521,
		sDatabase : ''
	},
	_htMysql : {
		sHostname : 'localhost',
		sUser : '',
		sPassword : '',
		nPort : 3306,
		sDatabase : '',
		bDebug : true
	},
	_oOracle : null,
	_oMysql : null,
	
	init : function(htOracle, htMysql){
		this._htOracle = htOracle || this._htOracle;
		this._htMysql = htMysql || this._htMysql;

		this._connectToOracle();
		this._connectToMysql();
	},
	_connectToOracle : function(){
		var self = this;
		Oracle.connect({ 
		    "hostname": this._htOracle.sHostname, 
		    "user": this._htOracle.sUser, 
		    "password": vhtOracle.sPassword,
		    "port" : this._htOracle.nPort,
		    "database" : this._htOracle.sDatabase
		  }, function(err, connection) {
				if(err){
					new Error(err)
			  	}else{
			  		self._oOracle = connection;
			  	}
		});
	},
	_connectToMysql : function(){
		this._oMysqlClient = Mysql.createConnection({
			host : this._htMysql.sHostname,
			port : this._htMysql.nPort,
			database : this._htMysql.sDatabase,
			user : this._htMysql.sUser,
			password : this._htMysql.sPassword,
			debug : this._htMysql.bDebug
		});		
	}
};	