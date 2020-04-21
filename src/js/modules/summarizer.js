export default function summarizer(payload) {

  var data = payload

  console.log(data)

  var summary = ""

  if (data.immunity > 0) {

    summary += `In this model ${(100 / data.population * data.infected).toFixed(0)}% of the group was infected compared with ${data.susceptible * 100}% of the population if no isolation strategy had been implemented.`

    var unchecked = Math.floor( ( data.population / 100 *  data.susceptible) * data.fatality_rate ) 

    if (data.deaths < unchecked) {

      var saved = unchecked - data.deaths

      // summary += ` In this scenario ${saved} lives in every 1000 were saved.`

    }

  } else {

    summary += `In this model every susceptible member of the group (${data.susceptible * 100}% of the population) was infected after ${data.steps.precise.toFixed(1)} phases.`

    if (data.deaths > 0 ) {

      summary += ` <strong>${data.deaths} people died</strong>.`

    }

  }

  return summary

}