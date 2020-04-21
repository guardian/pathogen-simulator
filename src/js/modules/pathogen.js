import ScrollyTeller from "../modules/scrollyteller"
import { Contagion } from "../modules/contagion"
import tippy from 'tippy.js'

export default {

	init: (config, sliders, cases) => {

		const scrolly = new ScrollyTeller({
			parent: document.querySelector("#scrolly-3"),
			triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
			triggerTopMobile: 0.75,
			transparentUntilActive: true
		});

		var contagion = new Contagion(config, "pathogen-simulator", sliders, cases)

		contagion.init()

		tippy('.tipper')

		scrolly.addTrigger({num: 1, do: () => {

		   //contagion.randomize()

		}});

	    scrolly.watchScroll();

	}

};
