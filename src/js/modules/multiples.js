import ScrollyTeller from "../modules/scrollyteller"
import * as d3 from "d3"
import Recur from '../modules/recur'
import Radial from '../modules/radial'

export default {

	init: () => {

		var microbiology = [{

			"disease" : "Influenza (bird flu)",

			"r0" : 1,

			"fatality" : 60

		},{

			"disease" : "Influenza (seasonal flu)",

			"r0" : 2.5,

			"fatality" : 0.1

		},{

			"disease" : "Influenza (Spanish flu)",

			"r0" : 3,

			"fatality" : 2.5

		},{

			"disease" : "Influenza (swine flu)",

			"r0" : 1.5,

			"fatality" : 0.2

		},{

			"disease" : "Measles",

			"r0" : 15,

			"fatality" : 0.3

		},{

			"disease" : "Mumps",

			"r0" : 13,

			"fatality" : 1

		},{

			"disease" : "SARS",

			"r0" : 2.4,

			"fatality" : 9.6

		},{

			"disease" : "Smallpox",

			"r0" : 6,

			"fatality" : 15

		}]

	    document.querySelectorAll('.virology').forEach((elem, index) => {

	        var unit = elem.clientWidth || elem.offsetWidth

	        var id = `virology_${index}`;

	        elem.id = id

			var virus  = new Recur(microbiology[index].r0, microbiology[index].disease, 2).json()

			var radial  = new Radial(virus, id, unit)

			radial.update(virus)

	    });

	}

}

