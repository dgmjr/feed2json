// --------------------------------------------------------------------------------------------------------------------

let valid = {
  't'     : true,
  'f'     : false,
  'true'  : true,
  'false' : false,
  '0'     : true,
  '1'     : false,
  'on'    : true,
  'off'   : false,
  'yes'   : true,
  'no'    : false,
  'y'     : true,
  'n'     : false,
}

function booleanify(v) {
  // we're not going to mess around with type conversions here, since this string
  // always comes from the req.query anyway, therefore it already is a string
  console.log('typeof v:', typeof v)
  if ( typeof v !== 'string' ) {
    return false
  }

  v = v.toLowerCase()

  // if we don't know what this string is, return false
  if ( !(v in valid) ) {
    return false
  }

  return valid[v]
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = booleanify

// --------------------------------------------------------------------------------------------------------------------
