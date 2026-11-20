const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({});
for(const file of ['unit-journey.js','fidal-text.js','fidal-content.js','fidal-writing.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../shared',file),'utf8'),context);
const {FidalText:Text,FidalWriting:Writing,FidalContent:Content}=context;
let checks=0;
function check(name,run){run();checks++;process.stdout.write(`PASS: ${name}\n`)}
const profile=Content.families[0].forms[0];
function widget(reduced=false,custom=profile){
 const nodes=new Map(),frames=new Map();let frameId=0;
 function element(name){
  const attrs=new Map(),listeners=new Map();let html='';
  return {name,children:[],dataset:{},value:name==='#writingSpeed'?'1':'',checked:name==='#writingStill'&&reduced,disabled:false,hidden:false,
   get innerHTML(){return html},set innerHTML(value){html=value;this.children=[]},
   setAttribute(key,value){attrs.set(key,String(value))},getAttribute(key){return attrs.get(key)||null},
   appendChild(child){this.children.push(child)},focus(){this.focused=true},
   addEventListener(name,handler){listeners.set(name,handler)},removeEventListener(name){listeners.delete(name)},
   emit(name,event={}){listeners.get(name)?.({preventDefault(){},...event})},
   getBoundingClientRect(){return {left:10,top:20,width:400,height:360}},
   setPointerCapture(id){this.capture=id},hasPointerCapture(id){return this.capture===id},releasePointerCapture(){this.capture=null},
   querySelector:selector=>node(selector)
  };
 }
 function node(name){if(!nodes.has(name))nodes.set(name,element(name));return nodes.get(name)}
 const container=node('container'),motion={matches:reduced,addEventListener(){},removeEventListener(){}};
 const win={matchMedia:()=>motion,requestAnimationFrame(callback){frames.set(++frameId,callback);return frameId},cancelAnimationFrame(id){frames.delete(id)}};
 const notebook=Writing.createNotebook();
 const controller=Writing.mount(container,{profile:custom,family:Content.families[0].forms.map(form=>form.character),notebook,document:{createElementNS:(_,tag)=>element(tag)},window:win});
 function click(action){const button=node(`[data-writing="${action}"]`);button.dataset.writing=action;container.emit('click',{target:{closest:()=>button}})}
 function draw(id=1){const pad=node('#writingPad');pad.emit('pointerdown',{pointerId:id,button:0,clientX:50,clientY:80});pad.emit('pointermove',{pointerId:id,clientX:100,clientY:170});pad.emit('pointerup',{pointerId:id,clientX:150,clientY:250})}
 function tick(time){const pending=[...frames];frames.clear();pending.forEach(([,callback])=>callback(time))}
 return {node,container,controller,notebook,frames,motion,click,draw,tick};
}
check('all 293 Fidäl forms retain family, order, language and Unicode identity',()=>{
 assert.equal(JSON.stringify(Content),JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname,'../shared/content-review/fidal-writing.json'),'utf8'))));
 assert.equal(Content.language,'ti');assert.equal(Content.script,'Ethi');assert.equal(Content.direction,'ltr');
 assert.equal(Content.families.length,42);
 const allForms=Content.families.flatMap(family=>family.forms);
 assert.equal(allForms.length,293);assert.equal(new Set(allForms.map(form=>form.character)).size,293);
 assert.equal(Content.families.filter(family=>family.kind==='basic').length,35);
 assert.equal(Content.families.filter(family=>family.kind==='labialized').length,6);
 const expected=['በቡቢባቤብቦ','ተቱቲታቴትቶ','መሙሚማሜምሞ'];
 Content.families.forEach((family,index)=>{if(index<3)assert.equal(family.forms.map(form=>form.character).join(''),expected[index]);family.forms.forEach((form,n)=>{assert.equal(form.order,family.kind==='basic'?n+1:family.kind==='labialized'?[1,3,4,5,6][n]:4);assert.equal(form.unicode,'U+'+form.character.codePointAt(0).toString(16).toUpperCase());assert.equal(Writing.teacherReady(form.handwriting),false);assert.equal(Writing.audioReady(form.audio),false)})});
});
check('every contextual word is existing source content and contains the target character',()=>{
 const bank=JSON.parse(fs.readFileSync(path.join(__dirname,'../unit-02-first-words/unit-2-content-review.json'),'utf8'));
 const anchors={'በጊዕ':'sheep','ቡን':'coffee'};
 Content.families.flatMap(family=>family.forms).forEach(form=>form.contexts.forEach(example=>{
  assert.ok(Text.graphemes(example.word).includes(form.character));
  if(example.corpusId){const source=bank.items.find(item=>item.id===example.corpusId);assert.equal(source.scriptCandidate,example.word);assert.equal(source.pictureLesson.englishConcept,example.meaning);assert.equal(source.sourceUrl,example.source)}else {assert.equal(anchors[example.word],example.meaning);assert.ok(fs.existsSync(path.join(__dirname,'..',example.source)))}
  assert.match(example.status,/awaiting/);
 }));
});
check('Ethiopic combining marks remain attached to their base',()=>{
 assert.equal(Text.graphemes('ስሳ፟').length,2);assert.equal(Text.graphemes('ስሳ፟')[1],'ሳ፟');
 assert.notEqual(Text.searchKey('ሳ፟'),Text.searchKey('ሳ'));
 assert.notEqual(Text.searchKey('አ'),Text.searchKey('ኣ'));
});
check('grapheme fallback also keeps combining marks',()=>{
 const fallback=vm.createContext({Intl:{}});vm.runInContext(fs.readFileSync(path.join(__dirname,'../shared/fidal-text.js'),'utf8'),fallback);
 assert.equal(fallback.FidalText.graphemes('ስሳ፟').length,2);
});
check('NFC text entry accepts Fidäl and never treats Latin transliteration as the character',()=>{
 assert.equal(Text.compareEntry('በ','በ'),'match');assert.equal(Text.compareEntry('be','በ'),'one-character');
 assert.equal(Text.compareEntry('b','በ'),'compare');assert.equal(Text.compareEntry('ቤት','ቤ'),'one-character');assert.equal(Text.compareEntry('','በ'),'empty');
 assert.equal(Text.compareEntry(' ቤ ','ቤ'),'match');
});
check('search remains case- and Latin-accent-tolerant without changing Ethiopic',()=>{
 assert.equal(Text.searchKey('CAFÉ'),'cafe');assert.equal(Text.searchKey('cafe\u0301'),'cafe');
 assert.equal(Text.searchKey('ቤት'),'ቤት');assert.equal(Text.searchKey('ስሳ፟'),'ስሳ፟');
});
check('notebook commits only finished marks and returns independent copies',()=>{
 const notebook=Writing.createNotebook();notebook.begin('በ',[.1,.2]);notebook.move([.2,.3]);assert.equal(notebook.strokes('በ').length,0);
 notebook.finish();const copy=notebook.strokes('በ');copy[0][0][0]=99;assert.equal(notebook.strokes('በ')[0][0][0],.1);
 assert.equal(notebook.strokes('ቡ').length,0);
});
check('clear is undoable, and undo affects only the current character',()=>{
 const notebook=Writing.createNotebook();notebook.begin('በ',[.1,.2]);notebook.finish();notebook.begin('ቡ',[.2,.3]);notebook.finish();
 notebook.clear('በ');assert.equal(notebook.strokes('በ').length,0);notebook.undo('በ');assert.equal(notebook.strokes('በ').length,1);
 notebook.undo('በ');assert.equal(notebook.strokes('በ').length,0);assert.equal(notebook.strokes('ቡ').length,1);
});
check('invalid points and a second active pointer cannot corrupt writing',()=>{
 const notebook=Writing.createNotebook();assert.equal(notebook.begin('በ',[NaN,.1]),false);assert.equal(notebook.begin('በ',[1.1,0]),false);
 assert.equal(notebook.begin('በ',[.1,.2]),true);assert.equal(notebook.begin('ቡ',[.2,.3]),false);assert.equal(notebook.move([Infinity,.2]),false);notebook.cancel();assert.equal(notebook.finish(),false);
});
check('pointer drawing is scaled correctly and stores no pressure or timestamps',()=>{
 const test=widget();test.draw();
 const stroke=test.notebook.strokes('በ')[0];assert.equal(stroke[0][0],.1);assert.equal(stroke[0][1],1/6);assert.equal(stroke[0].length,2);assert.equal(test.node('#writingInk').children.length,1);
});
check('cancelled pointer capture discards only an unfinished mark',()=>{
 const test=widget();test.draw();const pad=test.node('#writingPad');pad.emit('pointerdown',{pointerId:2,button:0,clientX:100,clientY:100});pad.emit('lostpointercapture',{pointerId:2});
 assert.equal(test.notebook.strokes('በ').length,1);assert.equal(test.notebook.draft(),null);
});
check('drawing controls undo, clear and restore actual writing',()=>{
 const test=widget();test.draw();test.click('clear');assert.equal(test.notebook.strokes('በ').length,0);
 test.click('undo');assert.equal(test.notebook.strokes('በ').length,1);test.click('undo');assert.equal(test.notebook.strokes('በ').length,0);
});
check('normal and slow replay use the learner’s own marks',()=>{
 const test=widget();test.draw();test.click('replay');test.tick(0);test.tick(2200);assert.equal(test.frames.size,0);
 assert.match(test.node('#writingFeedback').textContent,/own writing/);
 test.node('#writingSpeed').value='.5';test.click('replay');test.tick(0);test.tick(2200);assert.equal(test.frames.size,1);test.tick(4400);assert.equal(test.frames.size,0);
});
check('reduced motion and still-picture mode never schedule animation',()=>{
 const test=widget(true);test.draw();test.click('replay');assert.equal(test.frames.size,0);assert.match(test.node('#writingFeedback').textContent,/still picture/);
 const other=widget();other.draw();other.node('#writingStill').checked=true;other.click('replay');assert.equal(other.frames.size,0);
});
check('closing writing cancels playback and unfinished input without losing earlier marks',()=>{
 const test=widget();test.draw();test.click('replay');assert.equal(test.frames.size,1);test.controller.cancel();assert.equal(test.frames.size,0);assert.equal(test.notebook.strokes('በ').length,1);
});
check('native text input respects IME composition and provides gentle comparison',()=>{
 const test=widget(),input=test.node('#fidalEntry');input.value='በ';input.emit('compositionstart');input.emit('keydown',{key:'Enter',isComposing:true});assert.equal(test.node('#entryFeedback').textContent,undefined);
 input.emit('compositionend');input.emit('keydown',{key:'Enter',isComposing:false});assert.match(test.node('#entryFeedback').textContent,/Same Fidäl character/);
 input.value='ቡ';test.click('check-entry');assert.match(test.node('#entryFeedback').textContent,/try again/);
});
check('onscreen Fidäl keys insert Unicode without pretending to test recall',()=>{
 const test=widget(),button={dataset:{insert:'ቡ'},disabled:false};test.container.emit('click',{target:{closest:()=>button}});
 assert.equal(test.node('#fidalEntry').value,'ቡ');assert.match(test.node('#entryFeedback').textContent,/inserted/);assert.equal(test.notebook.strokes('በ').length,0);
});
check('no teacher controls, start points or directions appear for pending data',()=>{
 const test=widget();assert.doesNotMatch(test.container.innerHTML,/Watch teacher|Previous stroke|Next stroke/);assert.equal(test.node('#teacherGuides').children.length,0);
 assert.match(test.container.innerHTML,/printed model/);assert.match(test.container.innerHTML,/needs verified source data/);
});
// This is a synthetic geometry fixture, never a Tigrinya teaching asset or approval record.
const fixture={status:'approved',language:'ti',reviewer:'Synthetic test fixture',reviewedAt:'2026-11-20',rights:'Unit test only',sourceUrl:'https://example.invalid/geometry-fixture',sourceLocator:'Synthetic segment 1',style:'synthetic geometry',strokes:[{order:1,start:[.1,.1],points:[[.1,.1],[.2,.2]],directionVerified:true,instruction:'Synthetic test instruction'}]};
check('a stroke guide requires full Tigrinya review, provenance, rights and ordered directions',()=>{
 assert.equal(Writing.teacherReady(fixture),true);
 for(const change of [{language:'am'},{status:'pending'},{reviewer:null},{rights:null},{reviewedAt:'2026-99-99'},{sourceLocator:null},{strokes:[]},{strokes:[{...fixture.strokes[0],directionVerified:false}]},{strokes:[{...fixture.strokes[0],order:2}]},{strokes:[{...fixture.strokes[0],start:[.9,.9]}]}])assert.equal(Writing.teacherReady({...fixture,...change}),false);
});
check('verified-provider UI supports numbered starts, directions and static step review',()=>{
 const test=widget(true,{...profile,handwriting:fixture});assert.match(test.container.innerHTML,/Watch teacher/);assert.equal(test.node('#teacherGuides').children.length,4);
 test.click('next-step');assert.match(test.node('#teacherInstruction').textContent,/Stroke 1 of 1/);test.click('teacher');assert.equal(test.frames.size,0);
});
check('audio requires reviewed Tigrinya local files and never accepts remote or traversal paths',()=>{
 const audio={...fixture,normal:'../shared/assets/audio/test.mp3',slow:'../shared/assets/audio/test-slow.mp3'};assert.equal(Writing.audioReady(audio),true);
 for(const change of [{language:'am'},{normal:'https://example.invalid/test.mp3'},{slow:'assets/../test.mp3'},{reviewer:null}])assert.equal(Writing.audioReady({...audio,...change}),false);
});
check('unit 2 searches real Tigrinya and existing meanings through the shared Unicode helper',()=>{
 const {app,nodeFor}=require('../unit-02-first-words/tests/app_test_harness.cjs').createHarness();
 nodeFor('#bankSearch').value='ቤት';app.renderReview();assert.match(nodeFor('#reviewRows').innerHTML,/ቤት/);assert.match(nodeFor('#bankCount').textContent,/1 of 142/);
 nodeFor('#bankSearch').value='CAT';app.renderReview();assert.match(nodeFor('#reviewRows').innerHTML,/ድሙ/);
});
process.stdout.write(`${checks} Fidäl writing, Unicode and source-gate checks passed.\n`);
