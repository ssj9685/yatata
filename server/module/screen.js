const fs = require('fs');
let initData;
fs.readFile('../log','utf-8',(err,data)=>{
    if(err)throw err;
    process.stdout.write(data);
    initData = data;
})
fs.watch("../log", (event, filename) => {
    if(event === "change"){
        fs.readFile('../log','utf-8',(err,data)=>{
            if(err)throw err;
            const replaced = data.replace(initData,"");
            if(replaced !== ""){
                process.stdout.write(replaced);
            }
            initData = data;
        })
    }
});