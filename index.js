const pcsclite = require('@pokusew/pcsclite')
const { readData, STATUS } = require('./logics')
const EventEmitter = require('events')

const EVENTS = {
  PCSC_INITIAL: 'PCSC_INITIAL',
  PCSC_ERROR: 'PCSC_ERROR',

  DEVICE_CONNECTED: 'DEVICE_CONNECTED',
  DEVICE_ERROR: 'DEVICE_ERROR',
  DEVICE_DISCONNECTED: 'DEVICE_DISCONNECTED',

  CARD_INSERTED: 'CARD_INSERTED',
  CARD_REMOVED: 'CARD_REMOVED',

  READING_INIT: 'READING_INIT',
  READING_START: 'READING_START',
  READING_PROGRESS: 'READING_PROGRESS',
  READING_COMPLETE: 'READING_COMPLETE',
  READING_FAIL: 'READING_FAIL'
}

const MODE = {
  PERSONAL: 'PERSONAL',
  PERSONAL_PHOTO: 'PERSONAL_PHOTO'
}

class ThaiCardReader extends EventEmitter {
  
  static get MODE() { return MODE }
  static get EVENTS() { return EVENTS }

  constructor(...args) {
    super(...args)

    this.pcsc = pcsclite()
    this.mode = MODE.PERSONAL
    this.emit(EVENTS.PCSC_INITIAL)
  }

  setMode(mode) {
    this.mode = mode
  }

  startListener() {
    const _this = this
    _this.pcsc.on('reader', reader => {
      // Device ready to read
      _this.emit(EVENTS.DEVICE_CONNECTED)
      
      reader.on('status', status => {
        const changes = reader.state ^ status.state
  
        if(!changes) {
          return
        }
  
        if ((changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY)) {
          // Card remove
          _this.emit(EVENTS.CARD_REMOVED)

          reader.disconnect(reader.SCARD_LEAVE_CARD, err => {
              if (err) {
                  console.log(err)
                  return
              }
          })
        }
        else if((changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {
          // Card insert
          _this.emit(EVENTS.CARD_INSERTED)
          setTimeout(() => {
            // Start reading data
            _this.emit(EVENTS.READING_INIT)

            reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err, protocol) => {
              if(err) {
                _this.emit(EVENTS.READING_FAIL, err)
                return
              }
      
              readData(reader, protocol, _this.mode === MODE.PERSONAL_PHOTO, (res) => {
                switch(res.status) {
                  case STATUS.START:
                    _this.emit(EVENTS.READING_START)
                    break
                  case STATUS.READING:
                    _this.emit(EVENTS.READING_PROGRESS, res.obj)
                    break
                  case STATUS.COMPLETE:
                    _this.emit(EVENTS.READING_COMPLETE, res.obj)
                    break
                  case STATUS.ERROR:
                    _this.emit(EVENTS.READING_FAIL, res.obj)
                    break
                }
              })
            })
          }, 1000)
        }
      })
  
      reader.on('error', err => {
        // Device error
        _this.emit(EVENTS.DEVICE_ERROR, err)
      })
  
      reader.on('end', () => {
        // Device disconnect from host
        _this.emit(EVENTS.DEVICE_DISCONNECTED)
      })
    })
  
    _this.pcsc.on('error', (err) => {
      // PCSC Error
      _this.emit(EVENTS.PCSC_ERROR, err)
    })
  }
}

module.exports = ThaiCardReader
