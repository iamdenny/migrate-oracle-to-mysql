/**
 * Migrate Oracle to Mysql
 * @class Migrator
 * @version 0.1.2
 * @since Dec 20, 2012
 * @author Denny Lim<hello@iamdenny.com, iamdenny@nhn.com>
 * @license MIT License
 * @copyright 2013 NHN Corp.
 */
 
/**
 * Module dependencies.
 */
var Oracle = require('oracle'),
	Mysql = require('mysql'),
	EventEmitter = require("events").EventEmitter;

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
	/**
	 * event.EventEmitter 상속
	 * @ignore
	 */
	__proto__ : EventEmitter.prototype,	

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

	_bIsOracleConnected : false,
	_bIsMysqlConnected : false,

	_nMigrationCount : 0,
	_nMigrationDoneCount : 0,
	_htMigrationResult : {},

	_oIconv : null,

	init : function(htOracle, htMysql){
		this._htOracle = htOracle || this._htOracle;
		this._htMysql = htMysql || this._htMysql;

		this._connectToOracle();
		this._connectToMysql();
	},
	_connectToOracle : function(){
		var self = this;
		this._bIsOracleConnected = false;
		Oracle.connect({ 
		    "hostname": this._htOracle.sHostname, 
		    "user": this._htOracle.sUser, 
		    "password": this._htOracle.sPassword,
		    "port" : this._htOracle.nPort,
		    "database" : this._htOracle.sDatabase
		  }, function(err, connection) {
				if(err){
					throw new Error(err);
					self._bIsOracleConnected = false;
			  	}else{
			  		self._oOracle = connection;
			  		console.log('connected in _connectToOracle, Migrator.js');
			  		self._bIsOracleConnected = true;
			  		self._checkConnection();
			  	}
		});
	},
	_connectToMysql : function(){
		var self = this;

		this._oMysql = Mysql.createConnection({
			host : this._htMysql.sHostname,
			port : this._htMysql.nPort,
			database : this._htMysql.sDatabase,
			user : this._htMysql.sUser,
			password : this._htMysql.sPassword,
			debug : this._htMysql.bDebug
		});		

		this._oMysql.connect(gDomain.bind(function(oErr) {
            //callback(oErr, oMysqlClient);
            console.log('connected in _connectToMysql, Migrator.js');
            self._bIsMysqlConnected = true;
            self._checkConnection();
        }));

        this._oMysql.on('close', gDomain.bind(function(oErr){
        	console.error('close event in _connectToMysql, Migrator.js');
        	//oMysqlClient.end();
        	self._bIsMysqlConnected = false;
        	self._oMysql.end();
        	self._connectToMysql();
        }));

        this._oMysql.on('error', gDomain.bind(function(oErr){
        	console.error('error event in _connectToMysql, Migrator.js');
        	self.emit('error', err);
        	self._bIsMysqlConnected = false;
        	self._oMysql.end();
        	self._connectToMysql();
        }));
	},

	_checkConnection : function(){
		if(this._bIsOracleConnected && this._bIsMysqlConnected){
			this.emit('connected');
		}
	},

	migrateByQuery : function(sQuery, sToTablename, bTruncate, fCb){
		var self = this;

		if(this._bIsOracleConnected === false || this._bIsMysqlConnected === false){
			if(err){
				throw new Error('connection falsed');
				return;
			}
			return;
		}

		console.log('Migrate `%s` is just started\n', sQuery);

		this._nMigrationCount += 1;

		this._oOracle.execute(sQuery, [], function(err, aResult){
			if(err){
				throw new Error(err);
				return;
			}

			if(bTruncate){
				self._truncateOnMysql(sToTablename, function(){
					self._insertDataIntoMysql(sQuery, sToTablename, aResult, fCb);	
				});
			}else{
				self._insertDataIntoMysql(sQuery, sToTablename, aResult, fCb);
			}			
		});
	},

	_truncateOnMysql : function(sToTablename, fCb){
		this._oMysql.query('TRUNCATE ' + sToTablename, [], function(err, result){
			if(err){
				throw new Error(err);
				return;
			}
			fCb();
		});
	},

	_insertDataIntoMysql : function(sQuery, sToTablename, aData, fCb){
		var self = this,
			nSuccessCount = 0,
			nFailureCount = 0;

		for(var i=0, nLen=aData.length; i<nLen; i++){
			this._oMysql.query('INSERT INTO ' + sToTablename + ' SET ?', aData[i], function(err, aInnerResult){
				if(err){
					throw new Error(err);
					nFailureCount += 1;					
				}else{
					nSuccessCount += 1;
				}

				if((nSuccessCount+nFailureCount) === nLen){
					fCb(self._htMigrationResult[sQuery] = {
						nSuccessCount : nSuccessCount,
						nFailureCount : nFailureCount
					});
					self._nMigrationDoneCount += 1;
					if(self._nMigrationCount === self._nMigrationDoneCount){
						self.emit('done', self._htMigrationResult);
					}
				}
			});
		}
	}
};	
