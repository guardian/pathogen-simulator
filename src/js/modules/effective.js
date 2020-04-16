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

			reduction.loadCase(0, 0, 0, false, true, "Single infection")

		}});

		scrolly.addTrigger({num: 2, do: () => {

		    reduction.loadCase(3, 0, 1, true, false, "Infect 100%")

		}});


		scrolly.addTrigger({num: 3, do: () => {

			reduction.loadCase(3, 0, 0.5, true, true, "Partial infection")

		}});

		scrolly.addTrigger({num: 4, do: () => {

		    reduction.loadCase(1.1, 0, 0.05, true, true, "R0 below one")

		}});

		scrolly.addTrigger({num: 5, do: () => {

		    reduction.loadCase(1.5, 50, 0.1, true, true, "Ebola")

		}});


	    scrolly.watchScroll();

	}

};
