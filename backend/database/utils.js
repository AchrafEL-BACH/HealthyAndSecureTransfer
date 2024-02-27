export function isInDb(store, id){
    return store[id] !== undefined
}

export const types = {
    "String": 1,
    "Number": 2,
    "Object": 3,

}

let store = new db("test db", {timeStamp: true,
    // mandatory
    types: {name:"String", surname:"String", age:"Number"}}

)

export const isStr = (val) => typeof val === "string"

export const isNumb = (val) => typeof val === "number"

export const isObj = (val) => typeof val === "object"