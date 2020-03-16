import ScrollyTeller from "../modules/scrollyteller"
import * as d3 from "d3"
import Recur from '../modules/recur'
import Radial from '../modules/radial'

export default {

	init: () => {

		var json  = new Recur(2, "Coro").json()

		var element = d3.select('.scroll-text').node();

		var unit = element.getBoundingClientRect().width;

		var tree  = new Radial(json, "r-zero-animation")

		tree.create(unit)

		const scrolly = new ScrollyTeller({
	            parent: document.querySelector("#scrolly-1"),
	            triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
	            triggerTopMobile: 0.75,
	            transparentUntilActive: true
	     });

		scrolly.watchScroll();

	}

}

