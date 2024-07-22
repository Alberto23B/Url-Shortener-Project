require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const { URL } = require("url");
const dns = require("dns");
const app = express();

mongoose.connect(
  "mongodb+srv://Alberto_Bio:Mmmeriva.23@cluster0.6oeifpn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true },
);

const urlShortenerSchema = new mongoose.Schema({
  original_url : String,
  short_url : Number
})

let UrlShortener = mongoose.model("urlShortener", urlShortenerSchema);

const getCount = async () => {
  try {
    const count = await UrlShortener.countDocuments();
    return count
  } catch (err) {
    console.error(err);
    return null;
  }
}

const urlEnrty = async (url) => {
  let count = await getCount() + 1;
  const document = new UrlShortener({
    original_url: url,
    short_url: count
  });
  try {
    const result = await document.save();
    count++;
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
  try {
    const parsedUrl = new URL(origUrl);
    const hostname = parsedUrl.hostname;
    dns.lookup(hostname, async function (err, data) {
      if (err) {
        console.log(err);
        res.json({ error : 'invalid url' })
        return
      } else {
        const exists = await UrlShortener.findOne({ original_url: origUrl});
        console.log(exists);
        if (exists) {
          res.json({ original_url: origUrl, short_url: exists.short_url })
        } else {
          await urlEnrty(origUrl);
          const newUrlEntry = await UrlShortener.findOne({ original_url: origUrl});
          console.log(newUrlEntry);
          res.json({ original_url: origUrl, short_url: newUrlEntry.short_url });
        } 
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ error: 'invalid url' });
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
