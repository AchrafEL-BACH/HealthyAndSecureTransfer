import {isInDb} from "./utils.js"

export function insert(row){

    try{
        if(this.meta.options.timeStamp){
            row["timeStamp"] = Date.now()
        }

        this.store[this.meta.length] = row
        this.meta.length++
        return true
    }catch(err){
        console.log(err)
        return false
    }

}

export function select(){


}


export function delete_(){


}


export function update(){


}