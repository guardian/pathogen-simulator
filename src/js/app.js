import loadJson from '../components/load-json/'
import { $, $$, round, numberWithCommas, wait, getDimensions } from './modules/util'

import rzero from './modules/rzero'
import pathogen from './modules/pathogen'
import multiples from './modules/multiples'

import config from './settings/settings'
import { Preflight } from './modules/preflight'

var settings = new Preflight(config).getSettings()

pathogen.init(settings.pathogen, settings.sliders, settings.cases)

multiples.init()

rzero.init()