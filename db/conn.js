const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const DB = "mongodb+srv://sanket:admin123@cluster0.iavuebx.mongodb.net/Rental?retryWrites=true&w=majority"

mongoose.connect(DB,{
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(()=> console.log("DataBase Connected")).catch((errr)=>{
    console.log(errr);
})