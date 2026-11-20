const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
// Run classic scripts in document order, as a browser does. Preloading helpers
// would hide startup failures caused by a misplaced dependency.
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(([,attrs,inline])=>{
 const src=attrs.match(/\bsrc="([^"]+)"/);
 return src?fs.readFileSync(path.join(__dirname,src[1]),'utf8'):inline;
});

function harness(){
 const nodes=new Map();
 function nodeFor(selector){
  if(!nodes.has(selector)){
   const classes=new Set();
   nodes.set(selector,{
    textContent:'',innerHTML:'',dataset:{},style:{},disabled:false,hidden:false,children:[],value:'',
    classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name),toggle(name,force){const on=force===undefined?!classes.has(name):force;if(on)classes.add(name);else classes.delete(name);return on}},
    setAttribute(name,value){this[name]=value},focus(){this.focused=true},
    click(){if(this.onclick)this.onclick()},
    querySelector:selector=>nodeFor(selector),addEventListener(){},removeEventListener(){},appendChild(child){this.children.push(child)},
   });
  }
  return nodes.get(selector);
 }
 const groups={};
 groups['.screen']=['home','lesson','journeyScreen'].map(id=>{const node=nodeFor('#'+id);node.id=id;return node});
 groups['.review-layout']=[nodeFor('review-layout')];
 groups['.tab']=['map','review','parent'].map(view=>{const node=nodeFor('tab-'+view);node.dataset.view=view;return node});
 groups['[data-set-mode]']=['explorer','builder'].map(mode=>{const node=nodeFor('mode-'+mode);node.dataset.setMode=mode;return node});
 ['soundChoices','formChoices'].forEach((id)=>{
  groups['#'+id+' .choice']=Array.from({length:id==='soundChoices'?3:4},(_,index)=>{
   const button=nodeFor(id+'-'+index);button.disabled=true;
   if(index===(id==='soundChoices'?0:1))button.dataset.correct='true';
   button.closest=()=>({querySelector:()=>groups['#'+id+' .choice'].find(choice=>choice.dataset.correct)});
   return button;
  });
 });
 const context=vm.createContext({
  document:{querySelector:nodeFor,querySelectorAll:selector=>selector.split(', ').flatMap(part=>groups[part]||[]),createElementNS:()=>nodeFor('svg-path')},
  window:{scrollTo(){}},
 });
 scripts.forEach(source=>vm.runInContext(source,context));
 vm.runInContext('globalThis.app={lessons,explored,practisedForms,checkedFamilies,familyJourney,handleFamilyJourney,answerShapeCheck,openFamily,startLearning,startShapeMatch,chooseShape,advanceShape,renderLesson,show,setMode,updateProgress,toggleWriting,writingNotebook,get current(){return {activeLetter,index,checking,shapeMatched}}};',context);
 const app=context.app;
 const choose=letter=>{const button=nodeFor(`[data-tile="${letter}"]`);button.dataset.tile=letter;app.chooseShape(button);return button};
 function finishFamily(){
  for(let index=0;index<app.lessons[app.current.activeLetter].forms.length;index++){
   assert.equal(app.current.index,index);
   app.advanceShape();choose(app.lessons[app.current.activeLetter].forms[index]);app.advanceShape();
  }
  assert.equal(app.familyJourney.phase,'recap');
  assert.match(nodeFor('#journeyScreen').innerHTML,/Your (seven vowel orders|\d+ forms)/);
  app.handleFamilyJourney('shape-check');
  let turns=0;
  while(app.familyJourney.phase==='check'&&turns<100){
   app.answerShapeCheck(app.familyJourney.check.current.question.correctKey);app.handleFamilyJourney('advance-shape-check');turns++;
  }
  assert.equal(app.familyJourney.phase,'result');
 }
 return {app,nodeFor,groups,choose,finishFamily};
}
let checks=0;
function check(name,run){run(harness());checks++;process.stdout.write(`PASS: ${name}\n`)}
check('initial progress is zero and unintroduced review is blocked',({app,nodeFor,groups})=>{
 assert.equal(nodeFor('#journeyBar').style.width,'0%');
 assert.equal(app.explored.size,0);
 assert.ok(groups['#formChoices .choice'].every(button=>button.disabled));
 groups['#formChoices .choice'][1].onclick();
 assert.equal(nodeFor('#formResult').textContent,'');
});
check('extended forms retain real order numbers and additional forms stay a group',({app,nodeFor})=>{
 app.openFamily('ኰ');
 assert.match(nodeFor('#familyStrip').innerHTML,/Order 3/);
 assert.doesNotMatch(nodeFor('#familyStrip').innerHTML,/Order 2/);
 nodeFor('#familyStrip').onclick({target:{closest:()=>({dataset:{form:'1'}})}});
 assert.match(nodeFor('#formMeta').textContent,/VOWEL ORDER 3 OF 7/);
 app.openFamily('additional');
 assert.match(nodeFor('#formMeta').textContent,/Additional forms · 1 of 18/);
 assert.doesNotMatch(nodeFor('#familyStrip').innerHTML,/Order 18/);
});
check('opening a family does not claim it has been practised',({app,nodeFor})=>{
 app.openFamily('በ');
 assert.equal(app.explored.size,0);
 assert.equal(app.practisedForms.get('በ').size,0);
 assert.equal(nodeFor('#form').textContent,'በ');
 assert.equal(nodeFor('#nextBtn').textContent,'Find it');
});
check('a shape is introduced before its guided matching activity',({app,nodeFor})=>{
 app.openFamily('በ');
 assert.equal(nodeFor('#buildArea').classList.contains('show'),false);
 assert.equal((nodeFor('#buildTiles').innerHTML.match(/data-tile=/g)||[]).length,1);
 app.advanceShape();
 assert.equal(app.current.index,0);
 assert.equal(nodeFor('#buildArea').classList.contains('show'),true);
 assert.equal(nodeFor('#nextBtn').disabled,true);
 app.advanceShape();assert.equal(app.current.index,0);
});
check('a wrong answer demonstrates the correct shape and allows retry',({app,nodeFor,choose})=>{
 app.openFamily('በ');app.startShapeMatch();
 choose('ቡ');
 assert.equal(app.current.shapeMatched,false);
 assert.equal(app.practisedForms.get('በ').size,0);
 assert.ok(nodeFor('[data-tile="በ"]').classList.contains('hint'));
 choose('በ');
 assert.equal(nodeFor('#message').textContent,'Same shape!');
 assert.equal(nodeFor('#nextBtn').disabled,false);
});
check('jumping to the final form cannot skip the rest of the family',({app,nodeFor,choose})=>{
 app.openFamily('በ');
 nodeFor('#familyStrip').onclick({target:{closest:()=>({dataset:{form:'6'}})}});
 app.advanceShape();choose('ቦ');app.advanceShape();
 assert.equal(app.current.index,0);
 assert.equal(app.explored.size,0);
 assert.equal(nodeFor('#finishCard').classList.contains('show'),false);
});
check('seven guided matches, recap and check complete a family and unlock review',({app,nodeFor,groups,finishFamily})=>{
 app.openFamily('በ');finishFamily();
 assert.equal(app.explored.size,1);
 assert.equal(app.practisedForms.get('በ').size,7);
 assert.equal(app.checkedFamilies.size,1);
 assert.equal(app.familyJourney.phase,'result');
 assert.ok(groups['#formChoices .choice'].every(button=>!button.disabled));
 groups['#formChoices .choice'][0].onclick();
 assert.match(nodeFor('#formResult').textContent,/Look again: ቤ/);
 groups['#formChoices .choice'][1].onclick();
 assert.equal(nodeFor('#formResult').textContent,'That matches!');
});
check('matching alternatives grow only from already practised shapes',({app,nodeFor,choose})=>{
 app.openFamily('በ');
 for(let index=0;index<4;index++){
  const choices=Array.from(nodeFor('#buildTiles').innerHTML.matchAll(/data-tile="([^"]+)"/g),match=>match[1]);
  assert.equal(choices.length,Math.min(index+1,3));
  assert.ok(choices.every(letter=>app.lessons['በ'].forms.slice(0,index+1).includes(letter)));
  app.advanceShape();choose(app.lessons['በ'].forms[index]);app.advanceShape();
 }
});
check('home and Continue preserve an unfinished shape activity',({app,nodeFor,choose})=>{
 app.openFamily('በ');app.startShapeMatch();choose('በ');app.show('home');
 assert.match(nodeFor('#startBtn').textContent,/Continue በ/);
 app.startLearning();
 assert.equal(app.current.shapeMatched,true);
 assert.equal(app.current.index,0);
});
check('missing picture words use shape practice and unknown family IDs are rejected',({app,nodeFor})=>{
 app.openFamily('ተ');
 assert.equal(nodeFor('#teachingWorld').hidden,true);
 assert.equal(nodeFor('#patternNote').hidden,false);
 assert.equal(app.openFamily('unknown'),false);
 assert.equal(app.current.activeLetter,'ተ');
 assert.equal(app.explored.size,0);
});
check('all 42 sourced activities work, with no approval or mastery claim',({app,nodeFor,finishFamily})=>{
 Object.keys(app.lessons).forEach(letter=>{app.openFamily(letter);finishFamily()});
 assert.equal(app.explored.size,42);
 assert.equal(nodeFor('#journeyBar').style.width,'100%');
 assert.equal(nodeFor('#journeyText').textContent,'42 of 42 activities checked');
 app.setMode('builder');assert.equal(nodeFor('#buildAction').classList.contains('hidden'),false);
 app.setMode('explorer');assert.equal(nodeFor('#buildAction').classList.contains('hidden'),true);
});
check('guided practice leads to a recap without claiming the family check is done',({app,nodeFor,choose,groups})=>{
 app.openFamily('በ');
 for(let n=0;n<7;n++){app.advanceShape();choose(app.lessons['በ'].forms[n]);app.advanceShape()}
 assert.equal(app.familyJourney.phase,'recap');assert.equal(app.checkedFamilies.size,0);
 assert.ok(groups['#formChoices .choice'].every(button=>button.disabled));
 assert.equal(nodeFor('#journeyProgress')['aria-valuenow'],0);
});
check('a paused family check resumes the same question and correction',({app,choose})=>{
 app.openFamily('በ');
 for(let n=0;n<7;n++){app.advanceShape();choose(app.lessons['በ'].forms[n]);app.advanceShape()}
 app.handleFamilyJourney('shape-check');
 const check=app.familyJourney.check;
 app.answerShapeCheck(check.current.question.options.find(option=>option.key!==check.current.question.correctKey).key);
 assert.equal(check.current.solved,false);assert.equal(check.helped,true);
 app.show('home');app.startLearning();
 assert.equal(app.familyJourney.check,check);assert.equal(check.position,0);assert.equal(check.helped,true);
 app.handleFamilyJourney('advance-shape-check');assert.equal(check.position,0);
});
check('a family check can finish with help and a later unaided revisit',({app,choose})=>{
 app.openFamily('መ');
 for(let n=0;n<7;n++){app.advanceShape();choose(app.lessons['መ'].forms[n]);app.advanceShape()}
 app.handleFamilyJourney('shape-check');app.handleFamilyJourney('shape-help');
 let turns=0;
 while(app.familyJourney.phase==='check'&&turns<100){
  app.answerShapeCheck(app.familyJourney.check.current.question.correctKey);app.handleFamilyJourney('advance-shape-check');turns++;
 }
 assert.equal(turns,8);assert.equal(app.familyJourney.phase,'result');
 assert.equal(app.checkedFamilies.get('መ').withHelp,1);assert.equal(app.checkedFamilies.get('መ').withoutHelp,6);
});
check('writing opens from the lesson, preserves per-form marks and never awards lesson credit',({app,nodeFor})=>{
 app.openFamily('በ');app.toggleWriting();
 assert.match(nodeFor('#writingWorkshop').innerHTML,/Replay my writing/);
 assert.equal(nodeFor('#traceArea').classList.contains('show'),true);
 app.writingNotebook.begin('በ',[.1,.2]);app.writingNotebook.finish();
 app.show('home');app.startLearning();assert.equal(app.writingNotebook.strokes('በ').length,1);
 nodeFor('#familyStrip').onclick({target:{closest:()=>({dataset:{form:'1'}})}});
 assert.equal(app.writingNotebook.strokes('ቡ').length,0);assert.equal(app.practisedForms.get('በ').size,0);
 app.toggleWriting();assert.match(nodeFor('#writingWorkshop').innerHTML,/Write <span lang="ti" dir="ltr">ቡ/);
});
check('vowel order labels and a noninitial character-in-word example use actual source content',({app,nodeFor})=>{
 app.openFamily('ተ');nodeFor('#familyStrip').onclick({target:{closest:()=>({dataset:{form:'5'}})}});
 assert.match(nodeFor('#formMeta').textContent,/VOWEL ORDER 6 OF 7/);
 assert.match(nodeFor('#familyStrip').innerHTML,/Order 7/);
 assert.match(nodeFor('#wordContexts').innerHTML,/ቤ<mark>ት<\/mark>/);
 assert.match(nodeFor('#wordContexts').innerHTML,/House/);
});
process.stdout.write(`${checks} Unit 1 flow checks passed.\n`);
