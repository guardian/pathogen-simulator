import ScrollyTeller from "../modules/scrollyteller"
import { Reduction } from "../modules/reduction"

export default {

	init: (config) => {

		const scrolly = new ScrollyTeller({
			parent: document.querySelector("#scrolly-2"),
			triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
			triggerTopMobile: 0.75,
			transparentUntilActive: true
		});

		var reduction = new Reduction(config, "effective-simulator")

		reduction.init()

		scrolly.addTrigger({num: 1, do: () => {

			console.log("Trigger 1 - one infection")

			reduction.loadCase(0, 0, 0, false, false)


		}});

		scrolly.addTrigger({num: 2, do: () => {

			console.log("Trigger 2 - 100% susceptible")

		    reduction.loadCase(3, 1, 0, true, false) // r0, fatality_rate, susceptible

		}});


		scrolly.addTrigger({num: 3, do: () => {

			console.log("Trigger 3 - 50% susceptible")

			reduction.loadCase(3, 1, 0.5) // r0, fatality_rate, susceptible

		}});

		scrolly.addTrigger({num: 4, do: () => {

			console.log("Trigger 4 - R-naught below 1")

		    reduction.loadCase(1.1, 1, 0.2) // r0, fatality_rate, susceptible

		}});

		scrolly.addTrigger({num: 5, do: () => {

			console.log("Trigger 5 Ebola")

		    reduction.loadCase(1.5, 50, 0.1) // r0, fatality_rate, susceptible

		}});


	    scrolly.watchScroll();

	}

};
