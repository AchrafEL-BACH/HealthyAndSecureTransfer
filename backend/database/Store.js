import {isStr, isNumb, isObj} from "./utils.js"

function checkColumns(doc, types){

    let checkOut = true  // state -> the most important value here
                         // if true everything is correct else not

    // yes you can definetley use forEach below instead of map(will change it too)
    // react.js habits cause me to use map everywhere 😂😂 i just noticed writing the article
    Object.keys(types).map((key, i)=> {
        if(!checkOut) return checkOut;

        if(doc[key] === undefined){
            console.log(key, "is missing in this document")
            checkOut = false
        }
    })

    if(Object.keys(types).length !== Object.keys(doc).length) checkOut = false

    return checkOut
}

function checkTypes(doc, types){

    let checkOut = true  // state


    // map again 🤦‍♂️, change to forEach please
    Object.keys(doc).map((key,i)=> { // looping over the doc keys {name: "sk", surname: "mhlungu", age: 23}

        if(!checkOut) return checkOut; // early break

        if(types[key] === "String"){ // if the column in question expects a string

            if(!isStr(doc[key])) checkOut = false // and the value in doc is not a string throw an error(checkout = false)

        }else if(types[key] === "Number"){

            if(!isNumb(doc[key])) checkOut = false

        }else if(types[key] === "Object"){

            if(!isObj(doc[key])) checkOut = false

        }

    })
    return checkOut

}

export default class Store{
    // private variables start with a "#"
    #data = {}
    #meta = {
        length: 0,
    }

    constructor(name, options){
        this.#meta.name = name;
        this.#meta.options = options
    }

    get getData(){
        return this.#data
    }

    set setData(data){
        // new code
        // check if the document has required columns
        if(!checkColumns(data, this.#meta.options.types)){

            throw new Error(`db expected a document with these columns: ${Object.keys(this.#meta.options.types)},

                                          but got ${Object.keys(data)} for this document ${JSON.stringify(data)}`)

        }

        // check if the document has correct types
        if(!checkTypes(data, this.#meta.options.types)){

            throw new Error(`db expected a document with these types: ${Object.values(this.#meta.options.types)},

                                          but got ${Object.values(data)} for this document ${JSON.stringify(data)}`)

        }


        // new code ends
        data._id = this.#meta.length

        if(this.#meta.options && this.#meta.options.timeStamp && this.#meta.options.timeStamp){

            data.timeStamp = Date.now()



        }

        this.#data[this.#meta.length] = data

        this.#meta.length++

        // console.log('data', this.#data)

    }

    get getTypes(){
        return this.#meta.options.types;
    }
}

Store.prototype.insert = function(data){
    this.setData  = data
}

Store.prototype.getByid = function(id){
    const data = this.getData

    if(data[id]){
        return data[id]
    }else{
        return "noDoc"
    }
}

Store.prototype.getAll = function(){
    return this.getData
}

Store.prototype.types = function (){
    return this.getTypes;
}