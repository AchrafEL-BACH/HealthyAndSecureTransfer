import db from './index.js'



let store = new db({timeStamp: true})


store.insert({name: "sk", surname: "mhlungu", age: 23})
store.insert({name: "np", surname: "mhlungu", age: 19})
store.insert({name: "jane", surname: "doe", age: 0})


const c = store.select() // return a new node/channel to be opened

c.beginQuery("THIS IS CHANNEL C")  // opening the channel and naming it

c.Where('age < 23') // return all documents where age is smaller than 23


const d = store.select() // return a new node/channel

d.beginQuery("THIS IS CHANNEL D") // open the channel
d.Where('age > 10') // all documents where age > 10

console.log('===============================================')
console.log(d.endQuery(), 'D RESULT age > 10')  // return d's data
console.log('===============================================')
console.log(c.endQuery(), "C RESULT age <  23") // return c's data
console.log('===============================================')
c.close() // destroy c
d.close()  // destroy d