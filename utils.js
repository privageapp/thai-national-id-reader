/*

Hex to String method
https://github.com/aodstudio/thai-smartcard-reader/blob/master/src/index.js

*/
const hex2string = (input) => {
  let tempHex = input
  if (tempHex.length > 4) tempHex = tempHex.slice(0, -4)
  const patt = /^[a-zA-Z0-9&@.$%\-,():`# \/]+$/
  const hex = tempHex.toString()
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
