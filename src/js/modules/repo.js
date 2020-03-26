import * as d3 from "d3"
import { Graph }  from '../modules/graph'

export class repo {

  constructor(r0, cyles, cid) {

    this.r0 = r0

    this.floored = Math.floor(r0)

    this.cid = cid

    this.cycles = d3.range(cyles).map((i) => [i+1])

    this.current = this.cycles[0][0]

    this.max = this.cycles.length

    this.array = [ this.cycles[0][0] ]

    this.counter = 0

    this.database = []

    this.nodes = []

    this.links = []

    this.x = 0

    this.memory = null

    this.ids = 1

    this.chart()

  }

  chart() {

    var self = this

    var canvas = document.getElementById(this.cid),
        context = canvas.getContext('2d'),
        width = canvas.width,
        height = canvas.height

    this.graph = new Graph(canvas);

    this.generate()

  }

  generate() {

    var self = this

    for (const cycle of this.cycles) {

      this.array.push(this.current * this.r0)

      this.current = (this.current * this.r0)

    }

    for (var i = 0; i < this.array.length; i++) {

      var level = i + 1

      var nodes = d3.range(parseInt(this.array[i])).map(() => { 

        ++self.counter

        return { index : self.counter , level : level }

      })

      var count = parseInt(this.array[i])

      var offset = Math.floor(Math.floor(this.array[i]) * this.getDecimal(this.array[i]))

      var ids = nodes.map(item => item.index)

      var obj = { level : level, count : count, ids : ids, offset : offset, nodes : nodes }

      this.database.push(obj)

    }

    this.contagion()

  }

  contagion() {

    var self = this

    this.nodes.push(...this.database[this.x].nodes)

    if (this.database[this.x].count > 1) {

      var check = this.memory  * this.floored

      if (this.database[this.x].count === check) {

        var chuncks =  this.chunkArrayInGroups(this.database[this.x].ids , this.floored)

        var bucket = []

        for (var i = 0; i < this.ids.length; i++) {

          var source = this.ids[i]

          var json = chuncks[i].map(item => {

            return { source: source, target: item }

          })

          bucket.push(...json)

          //this.links.push(...json)

        }

        for (const item of bucket) {

          self.graph.add(item.source, item.target);

        }

      } else {

        var core = this.database[this.x].ids.slice(0,check);

        var extras = this.database[this.x].ids.slice(check);

        var chuncks =  this.chunkArrayInGroups(core , this.floored)

        var bucket = []

        for (var i = 0; i < extras.length; i++) {

          chuncks[i].push(extras[i])

        }


        for (var i = 0; i < this.ids.length; i++) {

          var source = this.ids[i]

          var json = chuncks[i].map(item => {

            return { "source": source, "target": item }

          })

          bucket.push(...json)

        }

        for (const item of bucket) {

          self.graph.add(item.source, item.target);

        }

      }

    }

    this.ids = this.database[this.x].ids

    this.memory = this.database[this.x].count

    this.next()

  }

  next() {

    var self = this

    if (this.x < this.database.length - 1) {

      ++this.x

      setTimeout(function(){ self.contagion(); }, 1000);

    }
    
  }

  getDecimal(n) {
    return (n - Math.floor(n));
  }

  chunkArrayInGroups(arr, size) {
      var result =  arr.reduce((all,one,i) => {
             const ch = Math.floor(i/size); 
             all[ch] = [].concat((all[ch]||[]),one); 
             return all
          }, [])

      return result
  }

}