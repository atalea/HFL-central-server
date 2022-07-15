class Iterations {
    global
    edge_server
    local
    constructor(g=0,e=0,l=0) {
        if(typeof g != Number) g=0
        if(typeof e != Number) e=0
        if(typeof l != Number) l=0
        this.global = g
        this.edge_server = e
        this.local = l
    }
}
module.exports = {
    Iterations
}