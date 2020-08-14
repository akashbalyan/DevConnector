const mongoose=require('mongoose');

//use this command to create db in mongoDb
//use my_db

//For connecting 'my_db' mongoDb database 
//mongoose.connect('mongodb://localhost/my_db');

const config=require('config');

const db=config.get('mongoURI');

const connectDB = async () =>{
    try{
        await mongoose.connect(db,
            { useUnifiedTopology: true,
               useNewUrlParser: true ,
               useCreateIndex:true,
               useFindAndModify:false
            }
               );
        console.log("MongoDB Connected...");
    }catch(err){
        console.log(err.message());
        process.exit(1);
    }
};

module.exports =connectDB;