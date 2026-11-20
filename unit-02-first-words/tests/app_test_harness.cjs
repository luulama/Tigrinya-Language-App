const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createHarness(options={}) {
  const root = path.resolve(__dirname,'..');
  const content = fs.readFileSync(path.join(root,'unit-2-content-review.json'),'utf8');
  const nodes = new Map();
  const nodeFor = selector => {
    if (!nodes.has(selector)) {
      const classes = new Set();
      nodes.set(selector,{
        textContent:selector === '#unit2Content' ? content : '',
        innerHTML:'',
        value:selector === '#bankPlacement' ? 'all' : '',
        dataset:{},
        disabled:false,
        hidden:false,
        open:false,
        classList:{add:name => classes.add(name),remove:name => classes.delete(name),contains:name => classes.has(name)},
        setAttribute(name,value) {this[name] = value;},
        removeAttribute(name) {delete this[name];},
        focus() {this.focused = true;},
        insertAdjacentHTML(position,markup) {this.innerHTML += markup;},
        addEventListener() {},
        close() {this.open = false;},
        showModal() {this.open = true;},
      });
    }
    return nodes.get(selector);
  };
  const context = vm.createContext({
    ...options,
    document:{querySelector:nodeFor,querySelectorAll:() => [],addEventListener() {}},
    window:{setTimeout:() => 1,clearTimeout() {},scrollTo() {}},
  });
  // Exercise the generated page in browser order, not an idealized preload order.
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  for (const [,attrs,source] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/type="application\/json"/.test(attrs)) vm.runInContext(source,context);
  }
  vm.runInContext('globalThis.app = {LearningPath,state,words,defaultPictures,createPairDeck,startSession,openPairs,flipPairCard,showPairHint,nextStep,updateNext,goHome,play,handleAction,keepPictures,renderGame,choiceWords,showHint,matchWord,placeLetter,planLesson,reviewSelection,renderHome,review,handleJourney,answerWordCheck,openRecap,renderReview};',context);
  return {app:context.app,nodeFor};
}

function finishCheck(app) {
  if(app.state.sessionPhase!=='recap')throw new Error('Expected a recap before the check');
  app.handleJourney('word-check');
  let turns=0;
  while(!app.state.sessionComplete&&turns<20){
    app.answerWordCheck(app.state.check.current.question.correctKey);
    app.handleJourney('advance-check');
    turns++;
  }
  if(!app.state.sessionComplete)throw new Error('Check did not finish');
}
module.exports = {createHarness,finishCheck};
