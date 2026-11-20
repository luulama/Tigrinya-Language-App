const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../shared/learning-path.js'),'utf8');
const DAY=86400000,KEY='tigrinya.practice.v1';
function harness(saved,blocked=false){
 const store=new Map(saved?[[KEY,saved]]:[]),nodes=new Map(),writes=[];
 const host={innerHTML:'',querySelector:()=>({open:false})};
 const document={documentElement:{dataset:{}},querySelector(selector){if(selector==='#learningPath')return host;if(!nodes.has(selector))nodes.set(selector,{value:'',setAttribute(){},focus(){}});return nodes.get(selector)}};
 const localStorage={getItem:key=>{if(blocked)throw Error('blocked');return store.get(key)||null},setItem(key,value){if(blocked)throw Error('blocked');writes.push(key);store.set(key,value)},removeItem(key){if(blocked)throw Error('blocked');store.delete(key)}};
 const context=vm.createContext({document,localStorage});vm.runInContext(source,context);
 return {app:context.LearningPath,host,store,writes,nodes,click(action){host.onclick({target:{closest:()=>({dataset:{pathAction:action}})}})}};
}
let count=0;function test(name,run){run();count++;console.log('PASS: '+name)}
test('practice never writes before explicit device-save choice',()=>{const h=harness();h.app.record('words',[{id:'house',helped:false}],DAY);assert.equal(h.writes.length,0);assert.equal(h.app.saving,false)});
test('review is due after one day and isolated by skill',()=>{const h=harness();h.app.record('words',[{id:'house',helped:false}],DAY);assert.equal(h.app.due('words',2*DAY-1).length,0);assert.equal(h.app.due('words',2*DAY)[0],'house');assert.equal(h.app.due('shapes',3*DAY).length,0)});
test('same-day repeats cannot create delayed evidence or extend an interval',()=>{const h=harness();h.app.record('words',[{id:'house',helped:false}],DAY);h.app.record('words',[{id:'house',helped:false}],DAY+100);assert.equal(h.app.due('words',2*DAY).length,1);assert.match(h.host.innerHTML,/<strong>0<\/strong> checked without help on a later day/)});
test('later independent checks lengthen review; assistance shortens it',()=>{const h=harness();h.app.record('words',[{id:'house',helped:false}],DAY);h.app.record('words',[{id:'house',helped:false}],2*DAY);assert.equal(h.app.due('words',4*DAY).length,0);assert.equal(h.app.due('words',5*DAY).length,1);assert.match(h.host.innerHTML,/<strong>1<\/strong> checked without help on a later day/);h.app.record('words',[{id:'house',helped:true}],5*DAY);assert.equal(h.app.due('words',6*DAY).length,1);assert.match(h.host.innerHTML,/<strong>0<\/strong> checked without help on a later day/)});
test('opt-in history restores completed words and family checks',()=>{const h=harness();h.app.record('words',[{id:'house',helped:true}],DAY);h.app.saveFamily('በ',{total:7,withoutHelp:5,withHelp:2});h.click('save');assert.equal(h.app.saving,true);const next=harness(h.store.get(KEY));assert.equal(next.app.completedWords()[0],'house');assert.equal(next.app.families['በ'].withHelp,2)});
test('stop-saving removes this app key and preserves in-tab evidence',()=>{const h=harness();h.store.set('unrelated','keep');h.app.record('words',[{id:'house',helped:false}],DAY);h.click('save');h.click('save');assert.equal(h.store.has(KEY),false);assert.equal(h.store.get('unrelated'),'keep');assert.equal(h.app.completedWords().length,1)});
test('clear removes only own history and resets adapters',()=>{const h=harness();let reset=false;h.app.configure({unit:'words',reset(){reset=true}});h.store.set('unrelated','keep');h.app.record('words',[{id:'house',helped:false}],DAY);h.click('save');h.click('clear');assert.equal(h.store.has(KEY),false);assert.equal(h.store.get('unrelated'),'keep');assert.equal(h.app.completedWords().length,0);assert.equal(reset,true)});
test('blocked storage and corrupt data preserve a working memory-only app',()=>{for(const h of [harness('{broken'),harness(null,true),harness(JSON.stringify({version:1,save:true,mode:'child',minutes:5,items:{'words:x':{due:'bad'}},families:{}}))]){h.app.record('words',[{id:'house',helped:false}],DAY);assert.equal(h.app.completedWords().length,1)}const h=harness(null,true);h.click('save');assert.equal(h.app.saving,false);assert.match(h.host.innerHTML,/Saving is unavailable/)});
test('three-minute preference reduces picture activity without adding a timer',()=>{const h=harness();h.nodes.get('#pathMinutes').value='3';h.nodes.get('#pathMinutes').onchange();assert.equal(h.app.wordLimit(),1);assert.match(h.host.innerHTML,/not a timer/)});
const {createHarness,finishCheck}=require('../unit-02-first-words/tests/app_test_harness.cjs');
test('short sessions progress to a new word rather than repeating their familiar first word forever',()=>{
 const saved=JSON.stringify({version:1,save:true,mode:'child',minutes:3,items:{},families:{}});
 const store=new Map([[KEY,saved]]),localStorage={getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
 const {app,nodeFor}=createHarness({localStorage});
 assert.equal(app.planLesson().length,1);assert.match(nodeFor('#practiceSummary').textContent,/1 picture word to begin/);
 const first=app.planLesson()[0];app.startSession([first]);app.openRecap();finishCheck(app);app.goHome();
 assert.notEqual(app.planLesson()[0].id,first.id);assert.equal(app.state.check.summary.withHelp,1);
 const next=createHarness({localStorage}).app;
 assert.equal(next.state.practised.has(first.id),true);assert.notEqual(next.planLesson()[0].id,first.id);
});
test('due reviewed words take priority over new words and the action says Review',()=>{
 const time=Date.now(),item={last:time-2*DAY,due:time-DAY,step:0,helped:true,delayed:false};
 const initial=createHarness().app.defaultPictures[1];
 const saved=JSON.stringify({version:1,save:true,mode:'child',minutes:5,items:{['words:'+initial.id]:item},families:{}});
 const {app,nodeFor}=createHarness({localStorage:{getItem:()=>saved,setItem(){}}});
 assert.equal(app.planLesson()[0].id,initial.id);assert.match(nodeFor('#playButton').innerHTML,/Review/);
});

console.log(count+' learning-path checks passed.');
