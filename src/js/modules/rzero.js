import ScrollyTeller from "../modules/scrollyteller"

export default (function viz() {

	console.log("Viz")

	 const scrolly = new ScrollyTeller({
            parent: document.querySelector("#scrolly-1"),
            triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
            triggerTopMobile: 0.75,
            transparentUntilActive: true
     });

     scrolly.watchScroll();

})();