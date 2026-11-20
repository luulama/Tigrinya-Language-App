(function(root){
  'use strict';
  const normalize=value=>String(value).normalize('NFC');
  function graphemes(value){
    const text=normalize(value);
    if(typeof Intl.Segmenter==='function')return Array.from(new Intl.Segmenter('ti',{granularity:'grapheme'}).segment(text),entry=>entry.segment);
    const result=[];
    for(const character of text){if(/\p{M}/u.test(character)&&result.length)result[result.length-1]+=character;else result.push(character)}
    return result;
  }
  function searchKey(value){
    // Fold Latin accents for dictionary search, retaining Ethiopic combining marks.
    return normalize(value).normalize('NFD').replace(/\p{Script=Latin}\p{M}*/gu,part=>part.replace(/\p{M}/gu,'')).normalize('NFC').toLocaleLowerCase('en');
  }
  function compareEntry(value,target){
    const entry=normalize(value).trim();
    if(!entry)return 'empty';
    if(graphemes(entry).length!==1)return 'one-character';
    return entry===normalize(target)?'match':'compare';
  }
  root.FidalText={normalize,graphemes,searchKey,compareEntry};
})(globalThis);
