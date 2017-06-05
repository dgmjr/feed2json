// --------------------------------------------------------------------------------------------------------------------

// core
const http = require('http')
const childProcess = require('child_process')

// local
const app = require('./lib/app.js')
const constant = require('./lib/constant.js')
const log = require('./lib/log.js')

// --------------------------------------------------------------------------------------------------------------------
// setup

setInterval(() => {
  log('Cleaning up')

  childProcess.execFile('find', [ constant.cacheDir, '-mmin', '+60', '-delete' ], (err, stdout, stderr) => {
    if (err) {
      console.warn('Error removing old cache files: ' + err)
      return
    }
    log('Removed old files')
  })

}, constant.cleanUpInterval)

// --------------------------------------------------------------------------------------------------------------------
// server

const port = process.env.PORT || 3000
const server = http.createServer(app)
server.listen(port, () => {
  log('Listening on port ' + port)
})

// --------------------------------------------------------------------------------------------------------------------
