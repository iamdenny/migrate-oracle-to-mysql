var Migrator = require('./lib/Migrator');

exports = module.exports = function(htOracle, htMySql){
	return new Migrator(htOracle, htMySql);
};