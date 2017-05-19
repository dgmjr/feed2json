// --------------------------------------------------------------------------------------------------------------------

// core
const http = require('http')

// npm
const express = require('express')
const request = require('request')
const validUrl = require('valid-url')
const FeedParser = require('feedparser')

// --------------------------------------------------------------------------------------------------------------------
// helpers

function sendError(res, status, err) {
  res.status(status).json({
    "err" : '' + err,
  })
}

// From : https://github.com/danmactough/node-feedparser/blob/master/examples/iconv.js
function getParams(str) {
  var params = str.split(';').reduce((params, param) => {
    var parts = param.split('=').map((part) => {
      return part.trim()
    })

    if ( parts.length === 2 ) {
      params[parts[0]] = parts[1]
    }

    return params
  }, {})

  return params
}

// --------------------------------------------------------------------------------------------------------------------
// application

var app = express()

app.get('/', (req, res) => {
  let queryUrl = req.query.url
  console.log('url=' + queryUrl)

  if ( !queryUrl ) {
    return sendError(res, 400, "provide a 'url' parameter in your query")
  }

  // check if this looks like a valid URL
  let url = validUrl.isWebUri(queryUrl)
  if ( !url ) {
    return sendError(res, 400, "invalid 'url' : " + queryUrl)
  }

  console.log('url=' + url)

  // create the feedparser ready for when we get the request back
  var feedparser = new FeedParser({
    normalize       : true,
    addmeta         : false,
    feedurl         : url,
    resume_saxerror : true,
  })

  // start the request
  const fetch = request(url, { timeout : 10000, pool : false })
  fetch.setHeader('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246')
  fetch.setHeader('accept', 'text/html,application/xhtml+xml')

  // check for request errors
  fetch.on('error', function (err) {
    return sendError(res, 500, "error when requesting the feed : " + err)
  })

  // Process the response when we get something back.
  fetch.on('response', function(feed) {
    if ( feed.statusCode != 200 ) {
      return this.emit('error', new Error('Bad status code'))
    }

    // See if this is a weird charset - perhaps ignore any we don't know!
    //
    // * https://github.com/danmactough/node-feedparser/blob/master/examples/iconv.js
    //
    var charset = getParams(feed.headers['content-type'] || '').charset
    console.log('charset=' + charset)
    // feed = maybeTranslate(feed, charset)

    // finally, pipe into the feedparser
    feed.pipe(feedparser)
  })

  // save some data
  let data = {}

  // now listen to events from the feedparser
  feedparser.on('error', function(err) {
    return sendError(res, 500, "error parsing feed : " + err)
  })

  feedparser.on('meta', function (meta) {
    console.log('===== %s =====', meta.title)
    data.title = meta.title
  })

  feedparser.on('readable', function() {
    var post
    while ( post = this.read() ) {
      console.log(JSON.stringify(post, ' ', 4))
    }
  })

  // and finish the request
  feedparser.on('end', function() {
    res.json(data)
  })
})

// --------------------------------------------------------------------------------------------------------------------
// server

const server = http.createServer(app)
server.listen(3000)

// --------------------------------------------------------------------------------------------------------------------
