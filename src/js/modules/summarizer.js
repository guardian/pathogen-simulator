export default function summarizer(payload, plusOne=true) {

  var data = payload

  function guardianista(num) {

    switch(num) {
      case 0:
       return 'Zero'
        break;
      case 1:
        return 'One'
        break;
      case 2:
         return 'Two'
        break;
      case 3:
        return 'Three'
        break;
      case 4:
        return 'Four'
        break;
      case 5:
        return 'Five'
        break;
      case 6:
        return 'Six'
        break;
      case 7:
        return 'Seven'
        break;
      case 8:
        return 'Eight'
        break;
      case 9:
        return 'Nine'
        break;
      case 10:
        return 'Ten'
        break;
      default:
      return num
    }

  }

  function pluralizer(num) {

    return (num > 1) ? 'people' : 'person'

  }

  function wasWere(num) {

    return (num > 1) ? 'was' : 'were'

  }


  var summary = ""

  if (plusOne) {

    if (data.immunity > 0) {

      summary += `In this model ${(100 / data.population * data.infected).toFixed(0)}% of the group was infected compared with ${data.susceptible * 100}% of the population if no isolation strategy had been implemented.`

      var unchecked = Math.floor( (data.susceptible * data.population) / 100 * data.fatality_rate ) 

      if (data.deaths < unchecked) {

        var saved = unchecked - data.deaths

          if (data.deaths > 0 ) {

            summary += ` <strong>${guardianista(data.deaths)} ${pluralizer(data.deaths)} died</strong>.`

          }

        //summary += ` In this scenario ${data.deaths} people died instead of ${unchecked}. <strong>${saved} lives were saved.</strong>`

      } else {

        if (data.deaths > 0 ) {

          summary += ` <strong>${guardianista(data.deaths)} ${pluralizer(data.deaths)} died</strong>.`

        }

      }

    } else {

      summary += `In this model every susceptible member of the group (${data.susceptible * 100}% of the population) was infected after ${data.steps.precise.toFixed(1)} phases.`

      if (data.deaths > 0 ) {

        summary += ` <strong>${guardianista(data.deaths)} ${pluralizer(data.deaths)} died</strong>.`

      }

    }

  } else {

      if (data.infected > 1) {

        summary += ` ${guardianista(data.infected)} ${pluralizer(data.infected)} were infected with the virus before it stopped spreading.`

      } else {

        summary += `Patient zero was the only infected person in this scenario. The virus was not transmitted to anybody else.`

      }

      if (data.deaths > 0) {

        summary += ` <strong>${guardianista(data.deaths)} ${pluralizer(data.deaths)} died</strong>.`

      }

  }

  return summary

}