import {insert, update, delete_} from './operators.js'
import Store from "./Store.js"
import select from "./select.js"
import {types} from "./utils.js"

function db(name,options) {
    // if options does not have the types property
    if(!options.types){

        throw new Error("db needs a types option to work")
    }

    // checking if the types are supported by the database
    const n = Object.keys(options.types).map((val, i)=> {

        return types[options.types[val]]

    });

    if(n.indexOf(undefined) !== -1){ // if we have undefined
        const m = Object.keys(options.types)[n.indexOf(undefined)]
        // show which column and type is unsupported
        throw new Error(`type of ${options.types[m]} for column ${m} does not exist`)
    }

    this.store = new Store(name, options)
}

db.prototype.insert = insert
db.prototype.update = update
db.prototype.select = select
db.prototype.delete_ = delete_

export default db