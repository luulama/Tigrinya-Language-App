const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createHarness() {
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
    document:{querySelector:nodeFor,querySelectorAll:() => [],addEventListener() {}},
    window:{setTimeout:() => 1,clearTimeout() {},scrollTo() {}},
  });
  const source = fs.readFileSync(path.join(root,'src/unit2-child-app.js'),'utf8');
  vm.runInContext(source + '\nglobalThis.app = {state,words,defaultPictures,createPairDeck,startSession,openPairs,flipPairCard,showPairHint,nextStep,updateNext,goHome,play,handleAction,keepPictures,renderGame,choiceWords,showHint,matchWord,placeLetter};',context);
  return {app:context.app,nodeFor};
}

module.exports = {createHarness};
