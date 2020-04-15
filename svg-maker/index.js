const fs        = require('fs');
const Recur = require('./recur')
const Radial = require('./radial')

var app = {

	init: (index) => {

		var microbiology = [{

			"id" : "microbe-1",

			"disease" : "Influenza (bird flu)",

			"r0" : 1,

			"fatality" : 60

		},{

			"id" : "microbe-2",

			"disease" : "Influenza (seasonal flu)",

			"r0" : 2.5,

			"fatality" : 0.1

		},{

			"id" : "microbe-3",

			"disease" : "Influenza (Spanish flu)",

			"r0" : 3,

			"fatality" : 2.5

		},{

			"id" : "microbe-4",

			"disease" : "Influenza (swine flu)",

			"r0" : 1.5,

			"fatality" : 0.2

		},{

			"id" : "microbe-5",

			"disease" : "Measles",

			"r0" : 15,

			"fatality" : 0.3

		},{

			"id" : "microbe-6",

			"disease" : "Mumps",

			"r0" : 13,

			"fatality" : 1

		},{

			"id" : "microbe-7",

			"disease" : "SARS",

			"r0" : 2.4,

			"fatality" : 9.6

		},{

			"id" : "microbe-8",

			"disease" : "Smallpox",

			"r0" : 6,

			"fatality" : 15

		}]

		app.wrangle(microbiology[index])

	},

	wrangle: async (microbiology) => {

		let virus  = new Recur(microbiology.r0, microbiology.disease, 2).json()

		let radial  = new Radial(virus, 300)

		let svg = await radial.create(virus)

		app.writer(svg, microbiology.id)


	},

	writer: (svg, filename) => {

		fs.writeFile(`./${filename}.svg`, svg, function(err) {
			
		    if(err) {
		        return console.log(err);
		    }

		    return console.log(`An SVG called ${filename} was created`);
		}); 

	}

}

app.init(7)


