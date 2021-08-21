const fs = require('fs');
function log(msg){
	fs.appendFile("./servers/server.log", `\n[${(new Date()).toISOString()}]${msg}`, err=>{
		if(err)throw err;
	})
}

export default log;