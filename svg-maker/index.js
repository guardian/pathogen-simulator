const fs        = require('fs');
const Recur = require('./recur')
const Radial = require('./radial')

var app = {

	init: (index) => {

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

			"disease" : "Delta",

			"r0" : 6,

			"fatality" : 0.1

		},{

			"disease" : "Chicken pox",

			"r0" : 10,

			"fatality" : 9.6

		},{

			"disease" : "Measles",

			"r0" : 15,

			"fatality" : 15

		}]

		app.wrangle(microbiology[index], index)

	},

	wrangle: async (microbiology, index) => {

		let virus  = new Recur(microbiology.r0, microbiology.disease, 2).json()

		let radial  = new Radial(virus, 300)

		let svg = await radial.create(virus)

		app.writer(svg, `microbe-${index + 1}`)

	},

	writer: (svg, filename) => {

		fs.writeFile(`./${filename}.svg`, svg, function(err) {
			
		    if(err) {
		        return console.log(err);
		    }

		    return console.log(`Un SVG s'appelle ${filename} a été créé`);
		}); 

	}

}

// Change to the index - between 0 and 8
app.init(7)




