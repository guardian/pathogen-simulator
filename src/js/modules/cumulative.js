export default function cumulative(r0, population) {

  var array = [1]

  var current = 1

  var steps =  (r0 > 1 ) ? Math.ceil(getBaseLog(r0, population)) : population ;

  for (var i = 0; i < steps; i++) {

    array.push(current * r0)

    current = current * r0

  }

  var cumulative = [];

  array.reduce(function(a,b,i) { return cumulative[i] = a+b; },0);

  var closest = getClosest(cumulative, population)

  var index = cumulative.findIndex( step =>  step === closest);

  var marked = (closest < population) ? index + 1 : index ;

  var min = cumulative[marked - 1]

  var max = cumulative[marked]

  var precise = (r0 > 1) ?  intersection(min, max, population, marked - 1) : population

  var dataset = cumulative.map(function(i) {
      return {
        y: i
      }
    });

  var obj = {

    value : (r0 > 1) ? max : population,

    total : marked,

    data :  dataset,

    precise : precise

  }

  return obj

}

function intersection(min, max, pop, left) {

  return left + ( pop - min ) * ( 100 / ( max - min ) ) / 100

}

function getBaseLog(r0, total) {

  return Math.log(total) / Math.log(r0);

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