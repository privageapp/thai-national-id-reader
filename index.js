const pcsclite = require('pcsclite')
const { readData, STATUS } = require('./logics')
const EventEmitter = require('events')

const EVENTS = {
  PCSC_INITIAL: 'PCSC_INITIAL',
  PCSC_CLOSE: 'PCSC_CLOSE',

  DEVICE_WAITING: 'DEVICE_WAITING',
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
    this.readMode = MODE.PERSONAL
    this.autoRecreate = true

    this.emit(EVENTS.PCSC_INITIAL)

    this.onReader = this.onReader.bind(this)
  }

  setReadMode(mode) {
    this.readMode = mode
  }

  setAutoRecreate(isAutoRecreate) {
    this.autoRecreate = isAutoRecreate
  }

  startListener() {
    this.pcsc.on('reader', this.onReader)
    this.pcsc.on('error', (err) => {

      // Recreate if device has been disconnected
      if(this.autoRecreate) {
        this.emit(EVENTS.DEVICE_WAITING, err)
        
        // Re-create
        this.pcsc = pcsclite()
        this.startListener()
      }
      else {
        this.emit(EVENTS.PCSC_CLOSE)
      }
    })
  }

  onReader(reader) {
    // Device ready to read
    this.emit(EVENTS.DEVICE_CONNECTED)
    
    reader.on('status', status => {
      const changes = reader.state ^ status.state

      if(!changes) {
        return
      }

      if ((changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY)) {
        // Card remove
        this.emit(EVENTS.CARD_REMOVED)

        reader.disconnect(reader.SCARD_LEAVE_CARD, err => {
            if (err) {
                console.log(err)
                return
            }
        })
      }
      else if((changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {
        // Card insert
        this.emit(EVENTS.CARD_INSERTED)
        setTimeout(() => {
          // Start reading data
          this.emit(EVENTS.READING_INIT)

          reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err, protocol) => {
            if(err) {
              this.emit(EVENTS.READING_FAIL, err)
              return
            }
    
            readData(reader, protocol, this.readMode === MODE.PERSONAL_PHOTO, (res) => {
              switch(res.status) {
                case STATUS.START:
                  this.emit(EVENTS.READING_START)
                  break
                case STATUS.READING:
                  this.emit(EVENTS.READING_PROGRESS, res.obj)
                  break
                case STATUS.COMPLETE:
                  this.emit(EVENTS.READING_COMPLETE, res.obj)
                  break
                case STATUS.ERROR:
                  this.emit(EVENTS.READING_FAIL, res.obj)
                  break
              }
            })
          })
        }, 1000)
      }
    })

    reader.on('error', err => {
      // Device error
      this.emit(EVENTS.DEVICE_ERROR, err)
    })

    reader.on('end', () => {
      // Device disconnect from host
      this.emit(EVENTS.DEVICE_DISCONNECTED)
    })
  }
}

module.exports = {
  default: ThaiCardReader,
  ThaiCardReader,
  EVENTS,
  MODE,
}
