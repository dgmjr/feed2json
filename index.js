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
  console.log('queryUrl=' + queryUrl)

  let responseSent = false

  if ( !queryUrl ) {
    responseSent = true
    return sendError(res, 400, "provide a 'url' parameter in your query")
  }

  // check if this looks like a valid URL
  let url = validUrl.isWebUri(queryUrl)
  if ( !url ) {
    responseSent = true
    return sendError(res, 400, "invalid 'url' : " + queryUrl)
  }

  console.log('validUrl=' + url)

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
    responseSent = true
    return sendError(res, 500, "error when requesting the feed : " + err)
  })

  // Process the response when we get something back.
  fetch.on('response', function(feed) {
    console.log('request.response')
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

  // save data as we stumble upon it
  let data = {}

  // now listen to events from the feedparser
  feedparser.on('error', function(err) {
    console.log('feedparser error :', err)
    responseSent = true
    return sendError(res, 500, "error parsing feed : " + err)
  })

  feedparser.on('meta', function (meta) {
    console.log('meta.link:', meta.link)
    // console.log(meta)

    // Going through fields in the same order as : https://jsonfeed.org/version/1

    // version (required, string)
    data.version = "https://jsonfeed.org/version/1"

    // title (required, string)
    data.title = meta.title

    // home_page_url (optional)
    if ( meta.link ) {
      data.home_page_url = meta.link
    }

    // feed_url (optional, string) - is self-referencing, but we don't have anything here to reference since we're generating from either
    // an RSS or Atom feed.

    // description (optional, string)
    if ( meta.description ) {
      data.description = meta.description
    }

    // user_comment (optional, string) - nothing in RSS or Atom can be used here

    // next_url (optional, string) - nothing in RSS or Atom can be used here

    // icon (optional, string) - nothing in RSS or Atom can be used here

    // favicon (optional, string) - Atom might have this
    if ( meta.favicon ) {
      data.favicon = meta.favicon
    }

    // author{name,url,avatar} (optional, must include one if exists)
    if ( meta.author ) {
      // even in Atom feeds with Author Name, Email and URI, feedparser only gives `meta.author`
      data.author = {
        name : meta.author,
      }
    }

    // expired (optional, boolean) - nothing in RSS or Atom can be used here

    // hubs (optional, array of objects) - ignoring for now

    // items (array, required) - add this now for appending to later
    data.items = []
  })

  feedparser.on('data', function (post) {
    // console.log('feedparser.data')
    console.log(' - post = ' + post.guid)

    let item = {}

    // Going through fields in the same order as : https://jsonfeed.org/version/1

    // id (required, string) - use `guid`
    if ( post.guid ) {
      item.guid = post.guid
    }
    else {
      // What should we do if there is no `guid` since `id` is required?
    }

    // url (optional, string) - the permalink if you like, may be the same as `id`
    if ( post.link ) {
      item.url = post.link
    }
    else {
      // What should we do if there is no `link` since we really should have a `url` here?
    }

    // external_url (optional, string) - ignore since we're adding a `url` anyway

    // title ...
    if ( post.title ) {
      item.title = post.title
    }

    // ToDo: ... !!!

    // finally, push this `item` onto `data.items`
    data.items.push(item)
  })

  // and finish the request
  feedparser.on('end', function() {
    console.log('feedparser.end')

    // don't do anything if we have already errored out and sent a response
    if ( responseSent ) {
      return
    }

    // alright to send the data
    res.json(data)
  })
})

// --------------------------------------------------------------------------------------------------------------------
// server

const server = http.createServer(app)
server.listen(3000)

// --------------------------------------------------------------------------------------------------------------------
