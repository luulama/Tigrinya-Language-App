const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {createHarness,finishCheck}=require('../unit-02-first-words/tests/app_test_harness.cjs');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../shared/unit-journey.js'),'utf8'),context);
const Journey=context.UnitJourney;
const shapes=['በ','ቡ','ቢ','ባ','ቤ','ብ','ቦ'].map((script,index)=>({id:String(index),script}));
const random=()=>.25;
let checks=0;
function check(name,run){run();checks++;process.stdout.write(`PASS: ${name}\n`)}
check('the shared structure supplies a purpose, context, estimated time and complete sequence',()=>{
 for(const type of ['shapes','words']){
  const overview=Journey.overview(type);
  ['unit-context','unit-goal','unit-time','Meet','Practise','Recap','Check'].forEach(text=>assert.ok(overview.includes(text)));
 }
});
check('each shape check has two identical shapes and one distinct taught shape',()=>{
 shapes.forEach(shape=>{
  const question=Journey.shapeQuestion(shape,shapes,random);
  assert.equal(question.options.length,3);
  assert.equal(question.options.filter(option=>option.label===shape.script).length,1);
  assert.equal(new Set(question.options.map(option=>option.label)).size,2);
  assert.ok(question.options.every(option=>shapes.some(known=>known.script===option.label)));
 });
});
check('a complete seven-shape check records only actual answers',()=>{
 const check=Journey.createCheck(shapes,Journey.shapeQuestion,random);
 assert.equal(check.summary.withoutHelp,0);
 assert.equal(check.advance(),false);
 while(!check.complete){assert.equal(check.answer(check.current.question.correctKey),'correct');check.advance()}
 assert.equal(check.summary.withoutHelp,7);
 assert.equal(check.summary.withHelp,0);
 assert.equal(check.total,7);
});
check('a mistake gives help, blocks skipping and schedules the item after other questions',()=>{
 const check=Journey.createCheck(shapes,Journey.shapeQuestion,random);
 const first=check.current.item.id;
 const wrong=check.current.question.options.find(option=>option.key!==check.current.question.correctKey);
 assert.equal(check.answer(wrong.key),'retry');
 assert.equal(check.helped,true);assert.equal(check.advance(),false);
 check.answer(check.current.question.correctKey);check.advance();
 assert.equal(check.total,8);assert.notEqual(check.current.item.id,first);
 while(!check.current.repeat){check.answer(check.current.question.correctKey);check.advance()}
 assert.equal(check.current.item.id,first);
 assert.equal(check.helped,false,'a revisit must offer a fresh attempt without revealing the model');
 check.answer(check.current.question.correctKey);check.advance();
 assert.equal(check.complete,true);
 assert.equal(check.summary.withHelp,1);assert.equal(check.summary.withoutHelp,6);
});
check('help does not answer a question or inflate independent results',()=>{
 const check=Journey.createCheck(shapes,Journey.shapeQuestion,random);
 check.help();check.help();
 assert.equal(check.current.solved,false);assert.equal(check.summary.withoutHelp,0);
 check.answer(check.current.question.correctKey);check.advance();
 assert.equal(check.summary.withHelp,1);assert.equal(check.total,8);
});
check('repeated mistakes and assistance cannot create an endless check',()=>{
 const check=Journey.createCheck(shapes,Journey.shapeQuestion,random);
 let turns=0;
 while(!check.complete&&turns<30){check.help();check.answer(check.current.question.correctKey);check.advance();turns++}
 assert.equal(check.complete,true);assert.equal(turns,14);
 assert.equal(check.summary.withHelp,7);assert.equal(check.summary.withoutHelp,0);
});
check('unknown answers and duplicate taps do not create progress',()=>{
 const check=Journey.createCheck(shapes,Journey.shapeQuestion,random);
 assert.equal(check.answer('unknown'),'ignored');assert.equal(check.summary.withoutHelp,0);
 check.answer(check.current.question.correctKey);assert.equal(check.answer(check.current.question.correctKey),'ignored');
 check.help();assert.equal(check.summary.withHelp,0);
 check.advance();assert.equal(check.advance(),false);
});
check('checks reject empty or duplicate item sets',()=>{
 assert.throws(()=>Journey.createCheck([],Journey.shapeQuestion));
 assert.throws(()=>Journey.createCheck([shapes[0],shapes[0]],Journey.shapeQuestion));
});
check('a single-word guided match is never counted as an independent answer',()=>{
 const word={id:'house',word:'ቤት',art:'house'};
 const check=Journey.createCheck([word],Journey.wordQuestion,random);
 assert.equal(check.helped,true);
 check.answer('house');check.advance();
 assert.equal(check.complete,true);assert.equal(check.summary.withoutHelp,0);assert.equal(check.summary.withHelp,1);
});
check('the word check never pits identical pictures or untaught words against each other',()=>{
 const {app}=createHarness();
 const taught=[...app.words.filter(word=>word.art==='house'),app.defaultPictures[1]];
 taught.forEach(target=>{
  const question=Journey.wordQuestion(target,taught,random);
  question.options.forEach(option=>{
   assert.ok(taught.some(word=>word.id===option.key));
   assert.ok(option.key===target.id||taught.find(word=>word.id===option.key).art!==target.art);
  });
 });
});
check('a recap precedes the check and cannot save or finish a session prematurely',()=>{
 const {app,nodeFor}=createHarness();app.startSession(app.defaultPictures);app.openRecap();
 assert.match(nodeFor('#journeyScreen').innerHTML,/Your picture words/);
 assert.equal(app.state.sessionComplete,false);app.keepPictures();assert.equal(app.state.saved.size,0);
 app.handleJourney('advance-check');assert.equal(app.state.sessionPhase,'recap');
 finishCheck(app);
 assert.equal(app.state.check.summary.total,3);assert.equal(app.state.screen,'finish');
 assert.match(nodeFor('#checkOutcome').innerHTML,/matched without help/);
});
check('a wrong final-check answer reveals the model but does not complete the question',()=>{
 const {app,nodeFor}=createHarness();app.startSession(app.defaultPictures);app.openRecap();app.handleJourney('word-check');
 const wrong=app.state.check.current.question.options.find(option=>option.key!==app.state.check.current.question.correctKey);
 assert.match(nodeFor('#journeyScreen').innerHTML,/id="checkModel" hidden/);
 app.answerWordCheck(wrong.key);
 assert.doesNotMatch(nodeFor('#journeyScreen').innerHTML,/id="checkModel" hidden/);
 assert.equal(app.state.check.current.solved,false);assert.equal(app.state.sessionComplete,false);
 app.handleJourney('advance-check');assert.equal(app.state.check.position,0);
});
check('a paused recap and a paused check resume without losing an answer or hint',()=>{
 const {app}=createHarness();app.startSession(app.defaultPictures);app.openRecap();app.goHome();app.play();
 assert.equal(app.state.sessionPhase,'recap');assert.equal(app.state.screen,'journey');
 app.handleJourney('word-check');app.handleJourney('check-help');
 const check=app.state.check,question=check.current;
 app.goHome();app.play();
 assert.equal(app.state.check,check);assert.equal(check.current,question);assert.equal(check.helped,true);
 app.answerWordCheck(check.current.question.correctKey);app.goHome();app.play();
 assert.equal(check.current.solved,true);assert.equal(check.position,0);
});
check('the complete default journey finishes after correction and later revisit',()=>{
 const {app,nodeFor}=createHarness();app.play();
 for(let n=0;n<3;n++){
  const word=app.state.session[app.state.wordIndex];
  app.nextStep();[0,1].forEach(index=>app.placeLetter({dataset:{token:String(index)}}));app.nextStep();
  const button=nodeFor(`[data-choice="${word.id}"]`);button.dataset.choice=word.id;app.matchWord(button);app.nextStep();
 }
 assert.equal(app.state.screen,'pairs');
 app.state.pairPictures.forEach(word=>app.state.pairDeck.filter(card=>card.word.id===word.id).forEach(card=>app.flipPairCard(card.id)));
 app.handleAction('finish-pairs');app.handleJourney('word-check');app.handleJourney('check-help');
 let turns=0;
 while(!app.state.sessionComplete&&turns<10){app.answerWordCheck(app.state.check.current.question.correctKey);app.handleJourney('advance-check');turns++}
 assert.equal(app.state.screen,'finish');assert.equal(turns,4);
 assert.equal(app.state.check.summary.withHelp,1);assert.equal(app.state.check.summary.withoutHelp,2);
 assert.equal(app.state.saved.size,0);app.keepPictures();assert.equal(app.state.saved.size,3);
 app.goHome();assert.match(nodeFor('#playButton').innerHTML,/Next words/);
});
process.stdout.write(`${checks} complete-journey checks passed.\n`);
