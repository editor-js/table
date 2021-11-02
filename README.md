# Table tool with paste ability 

Fork From https://github.com/editor-js/table

paste in editor.js will lost tr/td data of table node，so need modify

editor.js\src\components\modules\paste.ts

555 content.innerHTML = clean(content.innerHTML, customConfig);
   to
555  if(!(/<tbody>/i.test(content.innerHTML)))
556         content.innerHTML = clean(content.innerHTML, customConfig);
  
  
