const express = require('express')
const path = require('path');
const { createHmac } = require('node:crypto');
const mongoose = require('mongoose');
const app = express()

const port = 3000
const secret = 'abcdefg';
const uri = 'mongodb+srv://paullouppe:SachaLouppe54@rustycluster.psg05iv.mongodb.net/?retryWrites=true&w=majority'

app.use(express.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');

connect();
const Schema = mongoose.Schema;
const UrlToUrl = mongoose.model('UrlToUrl', new Schema({ url: String, shortUrl: String }));


app.get('/', (req, res) => {
    res.render('index', { shortUrl : '' });
});


app.post('/', (req, res) => {
    let hash = createHmac('sha256', secret).update(req.body.url).digest('hex');

    add({url: req.body.url, shortUrl: hash.substring(0, 7)}).then((addedEntry) => {
        res.render('index', { shortUrl : 'http://localhost:3000/'+addedEntry.shortUrl});
    });
});


app.get('/:shortUrl', (req, res) => {
    //si c nul redirige vers homeepage avec erreur si besoin
    getLongUrl(req.params.shortUrl).then((longUrl) => {
        res.redirect(longUrl)
    });
});

app.listen(port, () => { console.log(`Listening on port ${port}`) });


async function add(data) {
    try {
        const foundData = await UrlToUrl.findOne({ url: data.url }).exec();
        if (foundData) {
          return foundData;
        } else {
          const newData = new UrlToUrl(data);
          const savedData = await newData.save();
          return savedData;
        }
      } catch (err) {
        console.error('Error:', err);
      }
}

async function getLongUrl(smallUrl) {
    const foundData = await UrlToUrl.findOne({ shortUrl: smallUrl }).exec();
    if(foundData)
        return foundData.url;
    else
        return '/';
}

async function connect (){
    try {
        await mongoose.connect(uri);
        console.log('Connected to mongodb');
    }catch(err) {
        console.error(err);
    };
}
