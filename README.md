# thai-national-id-reader

Thai National ID card reader for nodeJS. 

[![npm version](https://badge.fury.io/js/%40privageapp%2Fthai-national-id-reader.svg)](https://badge.fury.io/js/%40privageapp%2Fthai-national-id-reader) ![MIT](https://img.shields.io/dub/l/vibe-d.svg)  

Credits. ADPU Command from [ThaiNationalIDCard](https://github.com/chakphanu/ThaiNationalIDCard) and HexString convertion from [thai-smartcard-reader](https://github.com/aodstudio/thai-smartcard-reader/blob/master/src/index.js)

## Installation

#### Using npm

```bash
$ npm install --save @privageapp/thai-national-id-reader
```

#### Using yarn

```bash
$ yarn add @privageapp/thai-national-id-reader
```

## Example

```js
const { ThaiCardReader, EVENTS, MODE } = require('@privageapp/thai-national-id-reader')

const reader = new ThaiCardReader()
reader.readMode = MODE.PERSONAL_PHOTO
reader.autoRecreate = true
reader.startListener()

reader.on(EVENTS.READING_COMPLETE, (obj) => {
  console.log(obj)
})
```

## API

### EVENTS
The `ThaiCardReader` object emits the following events

##### Event: PCSC_INITIAL
Emitted when a listener is started.

##### Event: PCSC_CLOSE
Emitted when a PCSC device is detached.

##### Event: DEVICE_WAITING
Emitted when a smart card reader is disconnected from host. (Only auto re-create is set to `true`).

##### Event: DEVICE_CONNECTED
Emitted when a smart card reader is ready to read.

##### Event: DEVICE_ERROR
Emitted when a smart card reader is error.

##### Event: DEVICE_DISCONNECTED
Emitted when a smart card reader is detached from host.

##### Event: CARD_INSERTED
Emitted when a smart card is inserted.

##### Event: CARD_REMOVED
Emitted when a smart card is removed.

##### Event: READING_INIT
Emitted when a device prepare to reading data.

##### Event: READING_START
Emitted when a device start to reading data.

##### Event: READING_PROGRESS
Emitted while a device reading data. This event return progress.
Returns `Object`:
```js
{ 
  step: 1, // Current reading segment
  of: 25, // All segment
  message: '' // Section name
}
```

##### Event: READING_COMPLETE
Emitted when a device finish reading data.
Returns `Object`:
```js
{ 
  citizenId: '1999999999999',
  titleTH: 'นาย',
  firstNameTH: '',
  lastNameTH: '',
  titleEN: 'Mr.',
  firstNameEN: '',
  lastNameEN: '',
  birthday: '1900-01-01',
  gender: 'male',
  address: 'address',
  issue: '2000-01-01',
  expire: '2010-01-01',
  photo: 'data:image/jpeg;....'
}
```

##### Event: READING_FAIL
Emitted when reading data fail

### MODE
##### Mode: PERSONAL
Read only personal data

##### Mode: PERSONAL_PHOTO
Read both personal data and photo


## License

You can use for free with [MIT License](https://github.com/privageapp/thai-national-id-reader/blob/master/LICENSE)



