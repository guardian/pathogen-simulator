
import Recur from '../modules/recur'
import Radial from '../modules/radial'

export default {

	init: () => {

		var microbiology = [{

			"disease" : "Covid-19 (low)",

			"r0" : 2,

			"fatality" : 0.1

		},{

			"disease" : "Covid-19 (high)",

			"r0" : 3,

			"fatality" : 0.1

		},{

			"disease" : "Influenza (Spanish flu)",

			"r0" : 1.8,

			"fatality" : 2.5

		},{

			"disease" : "Ebola (high)",

			"r0" : 2,

			"fatality" : 0.2

		},{

			"disease" : "SARS",

			"r0" : 3,

			"fatality" : 9.6

		},{

			"disease" : "Smallpox (high)",

			"r0" : 6,

			"fatality" : 1

		},{

			"disease" : "Chicken pox",

			"r0" : 10,

			"fatality" : 9.6

		},{

			"disease" : "Measles",

			"r0" : 15,

			"fatality" : 15

		}]

	    document.querySelectorAll('.virology').forEach((elem, index) => {

	        var unit = elem.clientWidth || elem.offsetWidth

	        var id = `virology_${index}`;

	        elem.id = id

			var virus  = new Recur(microbiology[index].r0, microbiology[index].disease, 2).json()

			var radial  = new Radial(virus, id, unit)

			radial.create()

	    });

	}

}

