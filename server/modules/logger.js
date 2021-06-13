const fs = require('fs');
module.exports = function log(msg){
	fs.appendFile("./server/server.log", `\n[${(new Date()).toISOString()}]${msg}`, err=>{
		if(err)throw err;
	})
}