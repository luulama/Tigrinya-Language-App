/* Fidäl writing is ephemeral. Printed glyphs are not stroke-order data. */
(function(root){
  'use strict';
  const finitePoint=point=>Array.isArray(point)&&point.length===2&&point.every(value=>Number.isFinite(value)&&value>=0&&value<=1);
  const clone=strokes=>strokes.map(stroke=>stroke.map(point=>[...point]));
  function createNotebook(){
    const pages=new Map(),history=new Map();let draft=null;
    const page=character=>pages.get(character)||[];
    const remember=character=>{const stack=history.get(character)||[];stack.push(clone(page(character)));if(stack.length>40)stack.shift();history.set(character,stack)};
    return {
      begin(character,point){if(draft||!finitePoint(point))return false;draft={character,points:[[...point]]};return true},
      move(point){if(!draft||!finitePoint(point))return false;if(draft.points.length<2000)draft.points.push([...point]);else draft.points[draft.points.length-1]=[...point];return true},
      finish(){if(!draft)return false;remember(draft.character);pages.set(draft.character,[...page(draft.character),draft.points]);draft=null;return true},
      cancel(){draft=null},
      strokes(character){return clone(page(character))},
      draft(){return draft?clone([draft.points])[0]:null},
      undo(character){draft=null;const stack=history.get(character);if(!stack||!stack.length)return false;pages.set(character,stack.pop());return true},
      clear(character){draft=null;if(!page(character).length)return false;remember(character);pages.set(character,[]);return true},
      canUndo(character){return !!(history.get(character)||[]).length}
    };
  }
  const filled=value=>typeof value==='string'&&value.trim().length>0;
  const sourceReference=value=>filled(value)&&(/^https:\/\//.test(value)||(/^shared\/content-review\/evidence\/[A-Za-z0-9_./-]+$/.test(value)&&!value.includes('..')));
  function reviewed(record){
    if(!record||record.status!=='approved'||!filled(record.reviewer)||!filled(record.rights)||!/^\d{4}-\d{2}-\d{2}$/.test(record.reviewedAt||''))return false;
    const date=new Date(record.reviewedAt);return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===record.reviewedAt;
  }
  function teacherReady(record){
    return !!(reviewed(record)&&record.language==='ti'&&sourceReference(record.sourceUrl)&&filled(record.sourceLocator)&&filled(record.style)&&Array.isArray(record.strokes)&&record.strokes.length&&record.strokes.every((stroke,index)=>stroke.order===index+1&&stroke.directionVerified===true&&filled(stroke.instruction)&&Array.isArray(stroke.points)&&stroke.points.length>1&&stroke.points.every(finitePoint)&&finitePoint(stroke.start)&&stroke.start.every((value,n)=>value===stroke.points[0][n])));
  }
  function audioReady(record){
    const local=path=>typeof path==='string'&&/^(?:\.\.\/shared\/)?assets\/[A-Za-z0-9_./-]+\.(mp3|wav|ogg|m4a)$/.test(path)&&!path.replace(/^\.\.\/shared\//,'').includes('..');
    return !!(reviewed(record)&&record.language==='ti'&&sourceReference(record.sourceUrl)&&filled(record.sourceLocator)&&local(record.normal)&&local(record.slow));
  }
  function pathData(points){if(!points.length)return '';return points.map((point,index)=>`${index?'L':'M'}${(point[0]*400).toFixed(1)},${(point[1]*360).toFixed(1)}`).join(' ')+(points.length===1?` L${(points[0][0]*400+.1).toFixed(1)},${(points[0][1]*360).toFixed(1)}`:'')}
  function replayFrame(strokes,progress){
    const total=strokes.reduce((sum,stroke)=>sum+stroke.length,0);let remaining=Math.ceil(Math.max(0,Math.min(1,progress))*total);
    return strokes.map(stroke=>{const visible=stroke.slice(0,Math.max(0,remaining));remaining-=stroke.length;return visible}).filter(stroke=>stroke.length);
  }
  function mount(container,{profile,family,notebook=createNotebook(),document:doc=root.document,window:win=root.window}){
    const escape=root.UnitJourney.escape,character=profile.character;
    const teacher=teacherReady(profile.handwriting),audio=audioReady(profile.audio);
    let pointer=null,animation=null,teacherStep=-1,destroyed=false;
    const reduced=win.matchMedia?win.matchMedia('(prefers-reduced-motion: reduce)'):null;
    container.innerHTML=`<section class="fidal-workshop" aria-labelledby="writingHeading"><h2 id="writingHeading" tabindex="-1">Write <span lang="ti" dir="ltr">${escape(character)}</span></h2><p class="writing-intro">Draw with a finger, mouse or pen. Compare with the model.</p><div class="writing-toolbar"><button data-writing="model" aria-pressed="true">Hide model</button><button data-writing="undo">Undo</button><button data-writing="clear">Clear</button></div><svg id="writingPad" class="writing-pad" viewBox="0 0 400 360" tabindex="0" role="img" aria-label="Freehand writing area for ${escape(character)}" aria-describedby="writingHelp"><rect width="400" height="360" fill="white"/><path d="M20 290H380" class="writing-baseline"/><text id="writingModel" x="200" y="277" text-anchor="middle" lang="ti" xml:lang="ti" direction="ltr">${escape(character)}</text><g id="teacherGuides"></g><g id="writingInk"></g></svg><p id="writingHelp" class="writing-note">This is a printed model. Stroke order is not checked. Use text practice below if drawing is uncomfortable.</p><div class="writing-toolbar"><button data-writing="replay">Replay my writing</button><label>Replay speed<select id="writingSpeed"><option value="1">Normal</option><option value="0.5">Slow</option></select></label><label class="writing-still"><input id="writingStill" type="checkbox" ${reduced&&reduced.matches?'checked':''}> Still picture</label></div>${teacher?'<div class="writing-toolbar"><button data-writing="teacher">Watch teacher</button><button data-writing="previous-step">Previous stroke</button><button data-writing="next-step">Next stroke</button></div><p id="teacherInstruction" class="writing-note"></p>':'<p class="writing-note">A teacher stroke guide needs verified source data. You can compare your writing with the printed model.</p>'}<p id="writingFeedback" class="writing-feedback" role="status" aria-live="polite">Your writing stays in this tab.</p><details class="text-practice"><summary>Text practice · use a keyboard or Fidäl keys</summary><label for="fidalEntry">Match <span lang="ti" dir="ltr">${escape(character)}</span><input id="fidalEntry" type="text" lang="ti" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="entryHelp"></label><p id="entryHelp">Enter one Fidäl character. These keys insert characters directly.</p><div class="fidal-input-keys" role="group" aria-label="Fidäl character keys">${family.map(script=>`<button data-insert="${escape(script)}" aria-label="Insert ${escape(script)}"><span lang="ti" dir="ltr">${escape(script)}</span></button>`).join('')}</div><button data-writing="check-entry">Compare text</button><p id="entryFeedback" role="status" aria-live="polite"></p></details>${audio?`<details><summary>Reviewed sound recordings</summary><label>Natural speed<audio controls preload="none" src="${escape(profile.audio.normal)}"></audio></label><label>Slow recording<audio controls preload="none" src="${escape(profile.audio.slow)}"></audio></label></details>`:'<p class="writing-note">Reviewed Tigrinya sound recordings are needed for this form.</p>'}</section>`;
    const get=id=>container.querySelector('#'+id),buttons=action=>container.querySelector(`[data-writing="${action}"]`);
    const pad=get('writingPad'),ink=get('writingInk'),model=get('writingModel');
    if(teacher){
      model.setAttribute('visibility','hidden');buttons('model').hidden=true;
      const guides=get('teacherGuides');
      profile.handwriting.strokes.forEach(stroke=>{
        const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',pathData(stroke.points));path.setAttribute('class','teacher-path');guides.appendChild(path);
        const circle=doc.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('cx',stroke.start[0]*400);circle.setAttribute('cy',stroke.start[1]*360);circle.setAttribute('r','13');circle.setAttribute('class','teacher-start');guides.appendChild(circle);
        const number=doc.createElementNS('http://www.w3.org/2000/svg','text');number.setAttribute('x',stroke.start[0]*400);number.setAttribute('y',stroke.start[1]*360+5);number.setAttribute('text-anchor','middle');number.setAttribute('class','teacher-start-label');number.textContent=String(stroke.order);guides.appendChild(number);
        const a=stroke.points[stroke.points.length-2],b=stroke.points[stroke.points.length-1];
        const angle=Math.atan2((b[1]-a[1])*360,(b[0]-a[0])*400),x=b[0]*400,y=b[1]*360;
        const arrow=doc.createElementNS('http://www.w3.org/2000/svg','path');arrow.setAttribute('d',`M${x-12*Math.cos(angle-.5)},${y-12*Math.sin(angle-.5)}L${x},${y}L${x-12*Math.cos(angle+.5)},${y-12*Math.sin(angle+.5)}`);arrow.setAttribute('class','teacher-direction');guides.appendChild(arrow);
      });
      get('teacherInstruction').textContent=profile.handwriting.strokes.map(stroke=>`${stroke.order}. ${stroke.instruction}`).join(' ');
    }
    const feedback=message=>get('writingFeedback').textContent=message;
    function draw(strokes){
      ink.innerHTML='';
      strokes.forEach(points=>{const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',pathData(points));path.setAttribute('class','writing-stroke');ink.appendChild(path)});
    }
    function sync(){draw(notebook.strokes(character));buttons('undo').disabled=!notebook.canUndo(character);buttons('clear').disabled=!notebook.strokes(character).length;buttons('replay').disabled=!notebook.strokes(character).length}
    function stop(){if(animation!==null)win.cancelAnimationFrame(animation);animation=null}
    function cancel(){stop();notebook.cancel();if(pointer!==null&&pad.hasPointerCapture&&pad.hasPointerCapture(pointer))pad.releasePointerCapture(pointer);pointer=null}
    function position(event){const rect=pad.getBoundingClientRect();if(!rect.width||!rect.height)return null;return [Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))]}
    function pointerDown(event){
      if(pointer!==null||(event.button!==undefined&&event.button!==0))return;
      const point=position(event);if(!point)return;
      stop();if(!notebook.begin(character,point))return;
      pointer=event.pointerId;pad.setPointerCapture(pointer);event.preventDefault();draw([...notebook.strokes(character),notebook.draft()]);
    }
    function pointerMove(event){if(event.pointerId!==pointer)return;const samples=event.getCoalescedEvents?event.getCoalescedEvents():[event];(samples.length?samples:[event]).forEach(sample=>{const point=position(sample);if(point)notebook.move(point)});draw([...notebook.strokes(character),notebook.draft()]);event.preventDefault()}
    function pointerUp(event){if(event.pointerId!==pointer)return;const point=position(event);if(point)notebook.move(point);notebook.finish();if(pad.hasPointerCapture(pointer))pad.releasePointerCapture(pointer);pointer=null;sync();feedback('Your mark is here. Compare its shape with the model; you can undo and try again.')}
    function pointerCancel(event){if(event.pointerId!==pointer)return;cancel();sync();feedback('That unfinished mark was cancelled. You can try again.')}
    function play(strokes,isTeacher=false){
      cancel();
      if(get('writingStill').checked||(reduced&&reduced.matches)){draw(strokes);feedback(isTeacher?'Verified strokes shown as a still picture.':'Your writing is shown as a still picture.');return}
      let start=null;const duration=2200/Number(get('writingSpeed').value||1);
      const frame=time=>{if(destroyed)return;if(start===null)start=time;const progress=Math.min(1,(time-start)/duration);draw(replayFrame(strokes,progress));if(progress<1)animation=win.requestAnimationFrame(frame);else{animation=null;feedback(isTeacher?'Teacher demonstration finished. Compare with the reviewed steps.':'That was your own writing. Compare with the printed model.')}};
      feedback(isTeacher?'Showing verified teacher strokes.':'Replaying your own writing.');animation=win.requestAnimationFrame(frame);
    }
    function showTeacherStep(delta){
      if(!teacher)return;cancel();teacherStep=Math.max(0,Math.min(profile.handwriting.strokes.length-1,teacherStep+delta));
      draw(profile.handwriting.strokes.slice(0,teacherStep+1).map(stroke=>stroke.points));
      get('teacherInstruction').textContent=`Stroke ${teacherStep+1} of ${profile.handwriting.strokes.length}. ${profile.handwriting.strokes[teacherStep].instruction}`;
    }
    function compare(){
      const result=root.FidalText.compareEntry(get('fidalEntry').value,character);
      get('entryFeedback').textContent={empty:'Enter a Fidäl character, or use a key below.', 'one-character':'Try one Fidäl character at a time.',match:'Same Fidäl character. This checks text, not handwriting or pronunciation.',compare:'Compare with the model and try again. Use the Fidäl keys if needed.'}[result];
    }
    let composing=false;
    get('fidalEntry').addEventListener('compositionstart',()=>{composing=true});
    get('fidalEntry').addEventListener('compositionend',()=>{composing=false});
    get('fidalEntry').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing&&!composing){event.preventDefault();compare()}});
    const click=event=>{
      const button=event.target.closest('button');if(!button||button.disabled)return;
      if(button.dataset.insert){get('fidalEntry').value=button.dataset.insert;get('fidalEntry').focus();get('entryFeedback').textContent='Character inserted. Compare it with the model.';return}
      const action=button.dataset.writing;
      if(action==='model'){const visible=model.getAttribute('visibility')!=='hidden';model.setAttribute('visibility',visible?'hidden':'visible');button.setAttribute('aria-pressed',String(!visible));button.textContent=visible?'Show model':'Hide model'}
      if(action==='undo'){cancel();notebook.undo(character);sync();feedback('Last writing change undone.')}
      if(action==='clear'){cancel();notebook.clear(character);sync();feedback('Writing cleared. Undo can restore it.')}
      if(action==='replay')play(notebook.strokes(character));
      if(action==='check-entry'&&!composing)compare();
      if(action==='teacher'&&teacher)play(profile.handwriting.strokes.map(stroke=>stroke.points),true);
      if(action==='previous-step')showTeacherStep(-1);
      if(action==='next-step')showTeacherStep(1);
    };
    const stopReplay=()=>{stop();sync();feedback('Replay stopped. Your writing remains here.')};
    const onMotionChange=()=>{if(reduced.matches)get('writingStill').checked=true;stopReplay()};
    get('writingStill').addEventListener('change',stopReplay);get('writingSpeed').addEventListener('change',stopReplay);
    if(reduced&&reduced.addEventListener)reduced.addEventListener('change',onMotionChange);
    pad.addEventListener('pointerdown',pointerDown);pad.addEventListener('pointermove',pointerMove);pad.addEventListener('pointerup',pointerUp);pad.addEventListener('pointercancel',pointerCancel);pad.addEventListener('lostpointercapture',pointerCancel);
    container.addEventListener('click',click);sync();
    return {cancel:()=>{cancel();sync()},destroy(){destroyed=true;cancel();container.removeEventListener('click',click);if(reduced&&reduced.removeEventListener)reduced.removeEventListener('change',onMotionChange);[['pointerdown',pointerDown],['pointermove',pointerMove],['pointerup',pointerUp],['pointercancel',pointerCancel],['lostpointercapture',pointerCancel]].forEach(([name,handler])=>pad.removeEventListener(name,handler))}};
  }
  root.FidalWriting={createNotebook,teacherReady,audioReady,pathData,replayFrame,mount};
})(globalThis);
