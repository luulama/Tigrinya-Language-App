/* Optional device-only practice history. No names, recordings or network requests. */
(function(root){
  'use strict';
  const KEY='tigrinya.practice.v1', DAY=86400000, intervals=[1,3,7,14,30,60];
  const fresh=()=>({version:1,save:false,mode:'child',minutes:5,items:{},families:{}});
  let data=fresh(), storageError=false, adapter=null;
  const now=()=>Date.now();
  function valid(value){
    if(!value||value.version!==1||value.save!==true||!['child','teen','adult'].includes(value.mode)||![3,5,10,15,30].includes(value.minutes))return false;
    if(!value.items||!value.families||typeof value.items!=='object'||typeof value.families!=='object'||Array.isArray(value.items)||Array.isArray(value.families))return false;
    return Object.entries(value.items).every(([key,item])=>/^(shapes|words):.{1,100}$/.test(key)&&item&&Number.isFinite(item.due)&&Number.isFinite(item.last)&&Number.isInteger(item.step)&&item.step>=0&&item.step<intervals.length&&typeof item.helped==='boolean'&&typeof item.delayed==='boolean')&&Object.values(value.families).every(summary=>summary&&Number.isInteger(summary.total)&&summary.total>0&&Number.isInteger(summary.withoutHelp)&&Number.isInteger(summary.withHelp)&&summary.withHelp>=0&&summary.withoutHelp>=0&&summary.withHelp+summary.withoutHelp===summary.total);
  }
  try{const raw=root.localStorage&&root.localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(valid(parsed))data=parsed}}catch(error){storageError=true}
  function persist(){if(!data.save)return;try{root.localStorage.setItem(KEY,JSON.stringify(data));storageError=false}catch(error){data.save=false;storageError=true}}
  function due(unit,time=now()) {return Object.entries(data.items).filter(([key,item])=>key.startsWith(unit+':')&&item.due<=time).sort((a,b)=>a[1].due-b[1].due).map(([key])=>key.slice(unit.length+1))}
  function record(unit,results,time=now()){
    results.forEach(result=>{
      const key=unit+':'+result.id,previous=data.items[key];
      if(previous&&time<previous.last)return;
      const later=previous&&time-previous.last>=DAY;
      let step=previous?previous.step:0;
      if(result.helped)step=0;else if(later)step=Math.min(step+1,intervals.length-1);
      const dueDate=previous&&!later&&!result.helped?previous.due:time+intervals[step]*DAY;
      data.items[key]={last:time,due:dueDate,step,helped:!!result.helped,delayed:!result.helped&&!!(later||(previous&&previous.delayed))};
    });persist();render();
  }
  function saveFamily(id,summary){data.families[id]={...summary};persist()}
  function completedWords(){return Object.keys(data.items).filter(key=>key.startsWith('words:')).map(key=>key.slice(6))}
  function wordLimit(){return data.minutes===3?1:3}
  function configure(options){adapter=options;render()}
  function render(){
    const doc=root.document,host=doc&&doc.querySelector('#learningPath');if(!host)return;
    const entries=Object.values(data.items),supported=entries.filter(item=>item.helped).length,delayed=entries.filter(item=>item.delayed).length;
    const unit=adapter&&adapter.unit,reviewCount=unit?due(unit).length:due('shapes').length+due('words').length;
    const rootPage=!adapter;
    const recommendation=rootPage?(due('words').length?'unit-02-first-words/index.html':due('shapes').length?'unit-01-fidel-foundations/index.html':completedWords().length||Object.keys(data.families).length?'unit-02-first-words/index.html':'unit-01-fidel-foundations/index.html'):null;
    host.innerHTML=`<div class="path-card"><div class="path-next"><span class="path-symbol" aria-hidden="true">${reviewCount?'↻':'✦'}</span><div><p class="path-kicker">YOUR NEXT STEP</p><h2>${reviewCount?'Revisit familiar '+(unit==='shapes'?'forms':'practice'):'One small activity'}</h2><p>${reviewCount?'A few familiar items are ready to revisit.':'Look first. Practise. Then try for yourself.'}</p></div>${rootPage?`<a class="path-primary" href="${recommendation}">${reviewCount?'Review':'Begin'} →</a>`:''}</div><details class="path-details"><summary>My practice & settings</summary><div class="path-stats"><p><strong>${entries.length}</strong> items checked</p><p><strong>${supported}</strong> last checked with help</p><p><strong>${delayed}</strong> checked without help on a later day</p></div><p class="path-note">Visual checks only. These counts do not measure reading, pronunciation or fluency. Reviews teach again before checking.</p><div class="path-options"><label>Presentation<select id="pathMode"><option value="child" ${data.mode==='child'?'selected':''}>Child · pictures first</option><option value="teen" ${data.mode==='teen'?'selected':''}>Teen · simple view</option><option value="adult" ${data.mode==='adult'?'selected':''}>Adult · simple view</option></select></label><label>Time available<select id="pathMinutes">${[3,5,10,15,30].map(n=>`<option value="${n}" ${data.minutes===n?'selected':''}>${n} minutes</option>`).join('')}</select></label></div><p class="path-note">Time is a preference, not a timer. Picture activities use 1–3 words. Longer sessions can include more activities. Presentation changes appearance, not your skill level.</p><p id="pathStorageStatus" role="status">${storageError?'Saving is unavailable. Practice still works in this tab.':data.save?'Completed checks and preferences are saved on this device.':'Practice stays in this tab unless you choose to save.'}</p><p class="path-note">No name, account, recording or upload. Shared-device users share this history. Unfinished activities and drawings are not saved. Saving across pages requires the same website address.</p><button type="button" class="path-secondary" data-path-action="save">${data.save?'Stop saving; keep this tab':'Save practice on this device'}</button><details><summary>Clear this app’s practice history</summary><p>Removes this app’s saved checks and preferences. Other browser data is untouched.</p><button type="button" class="path-secondary" data-path-action="clear">Clear practice history</button></details><p class="path-note">Stories, conversation, listening and culture lessons need reviewed Tigrinya material. No automatic proficiency level is assigned.</p></details></div>`;
    if(doc.documentElement)doc.documentElement.dataset.learnerMode=data.mode;
    const mode=doc.querySelector('#pathMode'),minutes=doc.querySelector('#pathMinutes');
    if(mode)mode.onchange=()=>{data.mode=mode.value;persist();if(doc.documentElement)doc.documentElement.dataset.learnerMode=data.mode};
    if(minutes)minutes.onchange=()=>{data.minutes=Number(minutes.value);persist();if(adapter&&adapter.refresh){adapter.refresh();const details=host.querySelector&&host.querySelector('.path-details');if(details)details.open=true;const control=doc.querySelector('#pathMinutes');if(control)control.focus()}};
    host.onclick=event=>{
      const button=event.target.closest('[data-path-action]');if(!button)return;
      if(button.dataset.pathAction==='save'){
        if(data.save){try{root.localStorage.removeItem(KEY);data.save=false;storageError=false}catch(error){storageError=true}}
        else{data.save=true;persist()}
      }
      if(button.dataset.pathAction==='clear'){
        try{if(root.localStorage)root.localStorage.removeItem(KEY);data=fresh();storageError=false;if(adapter&&adapter.reset)adapter.reset()}catch(error){storageError=true}
      }
      render();const details=host.querySelector&&host.querySelector('.path-details');if(details)details.open=true;
      const status=doc.querySelector('#pathStorageStatus');if(status){status.setAttribute('tabindex','-1');status.focus()}
    };
  }
  root.LearningPath={due,record,saveFamily,completedWords,wordLimit,configure,render,get families(){return data.families},get saving(){return data.save}};
  /* BEGIN pronunciation-card storage extension */
  root.LearningPath.cardPractice={
    read(){return data.pronunciation?JSON.parse(JSON.stringify(data.pronunciation)):null},
    write(value){data.pronunciation=JSON.parse(JSON.stringify(value));persist()},
    setSaving(enabled){
      if(enabled){data.save=true;persist()}
      else{try{root.localStorage.removeItem(KEY);data.save=false;storageError=false}catch(error){storageError=true}}
      render();return data.save;
    },
    get error(){return storageError}
  };
  /* END pronunciation-card storage extension */
  render();
})(globalThis);
