const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const exhbs = require('express-handlebars');
const dbo = require('./db');

const { ObjectId } = require('mongodb');// Corrected variable name

app.use(bodyParser.urlencoded({ extended: true }));

app.engine('hbs', exhbs.engine({ layoutsDir: 'views/', defaultLayout: "main", extname: "hbs" }));
app.set('view engine', 'hbs');
app.set('views', 'views');

app.get('/', async (req, res) => {
    let database = await dbo.getDatabase();
    const collection = database.collection('books');
    const cursor = collection.find({});
    let books = await cursor.toArray();
    let message = '';
    let edit_id = req.query.edit_id;
    let edit_book = null;

    if (edit_id) {
        edit_book = await collection.findOne({ _id: new ObjectId(edit_id) });
    }
    if (req.query.delete_id) {
        await collection.deleteOne({_id:new ObjectId(req.query.delete_id)})
        return res.redirect('/?status=3');
    }
    switch(req.query.status){
        case '1':
             message='inserted successfully';
        case '2':
             message = 'Updated Succesfully!';
             break;
    
        default:
            break;
    }
    
    res.render('main',{message,books,edit_book,edit_id});
})


app.post('/book_store',async (req,res)=>{
    let database=await dbo.getDatabase();
    let collection=database.collection('books');
    let book={title:req.body.title,author:req.body.author}
    await collection.insertOne(book);
    return res.redirect('/?status=1')
})


app.post('/update_book/:edit_id',async (req,res)=>{
    let database=await dbo.getDatabase();
    let collection=database.collection('books');
    let book={title:req.body.title,author:req.body.author}
    let edit_id=req.params.edit_id;
    await collection.updateOne({_id:new ObjectId(edit_id)},{$set:book});
    return res.redirect('/?status=2')
})
app.listen(8000,()=>console.log('listening in 8000 port'))