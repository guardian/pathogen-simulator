export default function cumulative(r0, population, steps) {

    var array = []

    var rt = [1]

    var total = 0

    var current = 1

    for (var i = 0; i < steps; i++) {

      array.push(current * r0)

      current = current * r0

      total += current

      rt.push(total)

    }

    var closest = getClosest(rt, population)

    var index = rt.findIndex( step =>  step === closest);

    var cumulative = (closest < population) ? index + 1 : index ;

    var min = rt[cumulative - 1]

    var max = rt[cumulative]

    var precise = intersection(min, max, population, cumulative - 1)

    var dataset = rt.map(function(i) {
        return {
          y: i
        }
      });

    var obj = {

      value : max,

      total : cumulative,

      data :  dataset,

      precise : precise

    }

    return obj

}

function intersection(min, max, pop, left) {

  return left + ( pop - min ) * ( 100 / ( max - min ) ) / 100

}

function getClosest(array, num) {

  var i=0;
  var minDiff=1000;
  var ans;
  for(i in array) {
    var m=Math.abs(num-array[i]);
    if(m<minDiff){ 
      minDiff=m; 
      ans=array[i]; 
    }
  }
  return ans;
}