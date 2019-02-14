const ThaiCardReader = require('./index')

const reader = new ThaiCardReader()
reader.setMode(ThaiCardReader.MODE.PERSONAL_PHOTO)
reader.startListener()

reader.on(ThaiCardReader.EVENTS.CARD_INSERTED, () => {
  console.log('Card Inserted')
})

reader.on(ThaiCardReader.EVENTS.CARD_REMOVED, () => {
  console.log('Card Removed')
})

reader.on(ThaiCardReader.EVENTS.READING_INIT, () => {
  console.log('Initial Reading')
})

reader.on(ThaiCardReader.EVENTS.READING_FAIL, () => {
  console.log('Reading Fail')
})

reader.on(ThaiCardReader.EVENTS.READING_PROGRESS, (progress) => {
  console.log(progress)
})

reader.on(ThaiCardReader.EVENTS.READING_COMPLETE, (obj) => {
  console.log(obj)
})