import rzero from './modules/rzero'
//import multiples from './modules/multiples'
import effective from './modules/effective'
import pathogen from './modules/pathogen'

import config from './settings/settings'
import { Preflight } from './modules/preflight'

import { intro } from './modules/intro'

import shareable from "./modules/shareable";

var settings = new Preflight(config).getSettings()

var share = new shareable(settings.social, settings.app).precheck()

if (!settings.isMobile) {

	intro.initialize();

}

var conf = {

	rootMargin: '0px 0px 550px 0px',

	threshold: 0

}

let boom = new IntersectionObserver(function(entries, exit) {

  entries.forEach(entry => {

    if (entry.isIntersecting) {

      handle(entry.target.getAttribute('data-loader'))

      exit.unobserve(entry.target);

    }

  });

}, conf);

const components = document.querySelectorAll('[data-loader]');

components.forEach(component => {

  boom.observe(component);

});

function handle(load) {

	switch(load) {
	  case 'rzero':
	   rzero.init()
	    break;
	    /*
	  case 'multiples':
	    multiples.init()
	    break; */
	  case 'effective':
       	effective.init(settings.effective)
	    break;
	  case 'pathogen':
	    pathogen.init(settings.pathogen, settings.sliders, settings.cases)
	    break;
	  default:
	}

}
