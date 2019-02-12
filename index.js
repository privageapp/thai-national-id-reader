/*
https://github.com/chakphanu/ThaiNationalIDCard
*/

const pcsclite = require('@pokusew/pcsclite')
const pcsc = pcsclite()
const utils = require('./utils')
const DataURI = require('datauri')
const datauri = new DataURI()

const CMD_SELECT = [
  [0x00, 0xA4, 0x04, 0x00, 0x08, 0xA0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01]
]
const CMD_CID = [
  [0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d],
  [0x00, 0xc0, 0x00, 0x00, 0x0d]
]
const CMD_PERSON_INFO = [
  [0x80, 0xb0, 0x00, 0x11, 0x02, 0x00, 0xd1],
  [0x00, 0xc0, 0x00, 0x00, 0xd1]
]
const CMD_ADDRESS = [
  [0x80, 0xb0, 0x15, 0x79, 0x02, 0x00, 0x64],
  [0x00, 0xc0, 0x00, 0x00, 0x64]
]
const CMD_ISSUE_EXPIRE = [
  [0x80, 0xb0, 0x01, 0x67, 0x02, 0x00, 0x12],
  [0x00, 0xc0, 0x00, 0x00, 0x12]
]

const _CMD_GET_PHOTO = () => {
  let cmds = []

  for(let i=0; i<21; i++) {
    let xwd
    let xof = i * 254 + 379
    if (i === 20) {
      xwd = 38
    }
    else {
      xwd = 254
    }
    const sp2 = (xof >> 8) & 0xff
    const sp3 = xof & 0xff
    const sp6 = xwd & 0xff
    const spx = xwd & 0xff

    cmds.push([
      [0x80, 0xb0, sp2, sp3, 0x02, 0x00, sp6],
      [0x00, 0xc0, 0x00, 0x00, spx]
    ])
  }

  return cmds
}

const CMD_GET_PHOTO = _CMD_GET_PHOTO()

pcsc.on('reader', reader => {
  console.log('New Reader Detected', reader.name)

  reader.on('status', status => {
    const changes = reader.state ^ status.state

    if(!changes) {
      return
    }

    if ((changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY)) {
      console.log('card removed')
      reader.disconnect(reader.SCARD_LEAVE_CARD, err => {
          if (err) {
              console.log(err)
              return
          }
      })
    }
    else if((changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {
      console.log('card inserted')
      setTimeout(() => {
        reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err, protocol) => {
          if(err) {
            console.log(err)
            return
          }
  
          readAllData(reader, protocol, true)
        })
      }, 500)
    }
  })
})

const readAllData = async (reader, protocol, withPhoto = false) => {
  try {
    // Select
    await sendCommand(reader, CMD_SELECT, protocol)

    // Get Data
    const citizenId = await sendCommand(reader, CMD_CID, protocol)
    const rawPersonalInfo = await sendCommand(reader, CMD_PERSON_INFO, protocol)
    const rawAddress = await sendCommand(reader, CMD_ADDRESS, protocol)
    const rawIssueExpire = await sendCommand(reader, CMD_ISSUE_EXPIRE, protocol)

    console.log(citizenId)
    console.log(rawPersonalInfo)
    console.log(rawAddress)
    console.log(rawIssueExpire)

    if(withPhoto) {
      const rawPhoto = await readPhoto(reader, protocol)

      const encodedData = datauri.format('.jpg', rawPhoto)
      console.log(encodedData.content)
    }
    
    console.log('done')
  } catch(e) {
    console.log(e)
  }

  reader.disconnect(reader.SCARD_LEAVE_CARD, err => {
      if (err) {
          console.log(err)
          return
      }
  })
}

const readPhoto = async (reader, protocol) => {
  let bufferList = []
  for(let i in CMD_GET_PHOTO) {
    await transmit(reader, CMD_GET_PHOTO[i][0], protocol)

    let result = await transmit(reader, CMD_GET_PHOTO[i][1], protocol)
    if (result.length > 2) {
      result = result.slice(0, -2)
    }
    bufferList.push(result)
  }

  const tempBuffer = Buffer.concat(bufferList)
  return tempBuffer
}

const sendCommand = async (reader, command, protocol) => {
  let data = null
  for(let i in command) {
    data = await transmit(reader, command[i], protocol)
  }
  return utils.hex2string(data.toString('hex'))
}

const transmit = async (reader, command, protocol) => {
  return new Promise((resolve, reject) => {
    reader.transmit(Buffer.from(command), 256, protocol, (err, data) => {
      if(err) {
        reject(err)
      }
      else {
        resolve(data)
      }
    })
  })
}
