const { ThaiCardReader, EVENTS, MODE } = require('./index')

const reader = new ThaiCardReader()
reader.readMode = MODE.PERSONAL_PHOTO
reader.autoRecreate = true
reader.startListener()

reader.on(EVENTS.CARD_INSERTED, () => {
  console.log('Card Inserted')
})

reader.on(EVENTS.CARD_REMOVED, () => {
  console.log('Card Removed')
})

reader.on(EVENTS.READING_INIT, () => {
  console.log('Initial Reading')
})

reader.on(EVENTS.READING_FAIL, () => {
  console.log('Reading Fail')
})

reader.on(EVENTS.READING_PROGRESS, (progress) => {
  console.log(progress)
})

reader.on(EVENTS.READING_COMPLETE, (obj) => {
  console.log(obj)
})

reader.on(EVENTS.DEVICE_DISCONNECTED, () => {
  console.log('Device Disconnect')
})