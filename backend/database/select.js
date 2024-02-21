import {types} from "./utils.js";

const tracker = {
    id: 0, // needed to ID each channel and retrieve or update it's state
}

const comparers = {
    "eq": (a, b) => a === b,
    "gt": (a, b) => a > b,
    "ls": (a, b) => a < b
}

const mapSearch = function(direct, a, b){
    if(direct === "eq"){
        return comparers['eq'](a, b)
    }else if(direct === "gt"){
        return comparers['gt'](a, b)
    }else if(direct === "ls"){
        return comparers['ls'](a, b)
    }else{
        console.log('Not handled')
    }
}

const search = function(comm, data){
    let split = comm.split(" ")
    if(types[split[0]] === 'Number'){

        split[2] = +split[2]  // converting "23" to 23 (number)

    }

    let filtered = []

    if(split[1] === "===" || split[1] === "=="){

        data.map((obj, i)=> {
            if(mapSearch('eq' , obj[split[0]], split[2])){
                filtered.push(obj)
            }
        })

    }else if(split[1] === "<"){
        data.map((obj, i)=> {
            if(mapSearch('ls' , obj[split[0]], split[2])){
                filtered.push(obj)
            }
        })

    }else if(split[1] === ">"){
        data.map((obj, i)=> {
            if(mapSearch('gt' , obj[split[0]], split[2])){
                filtered.push(obj)
            }
        })
    }

    return filtered
}

function functionalObj(store){
    this.id = NaN
    this.beginQuery = (channelName = "") => {
        // safeguard not to open the same query/channel twice
        console.log("creating channel", channelName)
        if(tracker[this.id] && tracker[this.id].beganQ){ // checking if the channel already exists(when this.id !== NaN)
            console.warn('please close the previous query');
            return
        }



        // opening a node/channel
        this.id = tracker.id;
        tracker[this.id] = {
            filtered: [], // holds filtered data
            types: {},
            beganQ: false,  // initial status of the channel(began Query)
            cName : channelName === "" ? this.id : channelName
        };

        tracker.id++;  // for new channels

        tracker[this.id].filtered = Object.values(store.getAll()); // to be filtered data
        tracker[this.id].types = store.types();
        tracker[this.id].beganQ = true;  // opening the channel
        console.log('opening channel: ', tracker[this.id].cName); // for debugging

    }

    this.Where = (str) => {
        // do not allow a query of the channel/node if not opened
        if(!tracker[this.id] || tracker[this.id] && !tracker[this.id].beganQ){
            console.log('begin query to filter')
            return
        }

        let f = search(str, tracker[this.id].filtered, tracker[this.id].types)

        // update filtered data for the correct channel
        if(f.length > 0){
            tracker[this.id].filtered = f
        }
    }
    // end of where

    this.endQuery = () => {

        if(!tracker[this.id] || tracker[this.id] && !tracker[this.id].beganQ){
            console.warn('no query to close')
            return
        }

        // returns data
        return {data:tracker[this.id].filtered, channel: tracker[this.id].cName}
    };

    // end of endQuery

    this.close = ()=> {
        // if a node/channel exist destroy it
        if(tracker[this.id] && !tracker[this.id].closed){
            Reflect.deleteProperty(tracker, this.id) // delete
            console.log('cleaned up', tracker)
        }
    }

}

export default function select(option = "*"){
    // checking if option is a number
    if(Number(option) !== NaN){

        // return prevents select from running code below this if statement()
        // think of it as an early break
        return this.store.getByid(+option)
        // the +option converts option to a number just to make sure it is
    }
    return  new functionalObj(this.store)
}