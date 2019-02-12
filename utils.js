// This method from https://github.com/aodstudio/thai-smartcard-reader/blob/master/src/index.js
const hex2string = (hexx) => {
  let tempHexx = hexx
  if (tempHexx.length > 4) tempHexx = tempHexx.slice(0, -4)
  const patt = /^[a-zA-Z0-9&@.$%\-,():`# \/]+$/
  const hex = tempHexx.toString()
  let str = ''
  let tmp = ''
  for (let i = 0; i < hex.length; i += 2) {
    tmp = String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    if (!tmp.match(patt)) {
      tmp = String.fromCharCode(parseInt(hex.substr(i, 2), 16) + 3424)
    }
    str += tmp
  }
  str = str.replace(/#/g, ' ')
  return str
}

module.exports = {
  hex2string
}
