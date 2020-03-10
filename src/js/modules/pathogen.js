import ScrollyTeller from "../modules/scrollyteller"

export default (function viz() {

	console.log("Viz")

	 const scrolly = new ScrollyTeller({
            parent: document.querySelector("#scrolly-2"),
            triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
            triggerTopMobile: 0.75,
            transparentUntilActive: true
     });

    scrolly.watchScroll();

    var totalPopulation = 100;
	var initSusceptibleProportion = 0.7;
	var initR0 = 1.19698;
	var initDeathRate = 0.1;
	var startTime = 0;
	var endTime = 365;
	var initAttackRate = 0.6;

	// Attack rate is a % value between 0 and 1

	var population = []

	for (var i = 0; i < totalPopulation; i++) {

		if (i < totalPopulation * initSusceptibleProportion && i < totalPopulation * initAttackRate) {
			population.push({"id": i, "susceptible":true, "toInfect": true, "infected":false})
		}

		else if (i < totalPopulation * initSusceptibleProportion) {
			population.push({"id": i, "susceptible":true, "toInfect": false, "infected":false})
		}

		else {
			population.push({"id": i, "toInfect": false, "susceptible":false})
		}
	}

	console.log(population)


	// R0.from.AR = function(AR, S0) {-log((1-AR)/S0)/(AR - (1-S0))}

	function getRzero(attackRate, susceptibleProportion) {
		return -Math.log((1-attackRate)/susceptibleProportion)/(attackRate - (1-susceptibleProportion))
	}

	function getAttackRate(r0, susceptibleProportion) {
		return (gsl_sf_lambert_W0_e(-Math.exp((r0 - 2*r0*susceptibleProportion)) * (r0*susceptibleProportion)).val + r0*susceptibleProportion)/r0
	}

	var startID = Math.round(Math.random(0,1) * 100);

	console.log(startID)

})();