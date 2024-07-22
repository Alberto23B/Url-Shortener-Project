require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const dns = require("dns")
const app = express();

mongoose.connect(
  "mongodb+srv://Alberto_Bio:Mmmeriva.23@cluster0.6oeifpn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true },
);

const urlShortenerSchema = new mongoose.Schema({
  originalUrl : String,
  shortUrl : Number
})

let UrlShortener = mongoose.model("urlShortener", urlShortenerSchema);

let count;

const getCount = async () => {
  try {
    count = UrlShortener.countDocuments();
    return count
  } catch (err) {
    console.error(err);
    return null;
  }
}

const urlEnrty = async (url) => {
  await getCount();
  count++;
  const document = new UrlShortener({
    originalUrl: url,
    shortUrl: count
  });
  try {
    const result = await document.save();
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Basic Configuration
const port = process.env.PORT || 5500;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post("/api/shorturl", function (req, res) {
  const origUrl = req.body.url
  const url = origUrl.replace(/https:\/\//g,'');
  dns.lookup(url, async function (err, data) {
    if (err) {
      console.log(err);
      res.json({ error : 'invalid url' })
      return
    } else {
      const exists = await UrlShortener.findOne({ originalUrl: origUrl});
      console.log(exists);
      if (exists) {
        res.json({ originalUrl: origUrl, shortUrl: exists.shortUrl })
      } else {
        urlEnrty(origUrl);
        const newUrlEntry = await UrlShortener.findOne({ originalUrl: origUrl});
        console.log(newUrlEntry);
        res.json({ originalUrl: origUrl, shortUrl: newUrlEntry.shortUrl });
      } 
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
