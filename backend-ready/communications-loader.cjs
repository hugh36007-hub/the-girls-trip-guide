const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');

function loadReference(file,names){
  const filename=path.join(root,file);
  const source=fs.readFileSync(filename,'utf8');
  const context=vm.createContext({});
  const expose=`\n;globalThis.__GTG_EXPORTS__={${names.join(',')}};`;
  vm.runInContext(source+expose,context,{filename});
  return context.__GTG_EXPORTS__;
}

const core=loadReference('communications-girls.js',[
  'GTG_GALS',
  'GTG_TRIGGERS',
  'GTG_FREE_OPERATIONAL',
  'GTG_FREE_TRANSACTIONALS',
  'GTG_COMMUNICATION_POLICY',
  'GTG_EMAIL_IDENTITIES',
  'GTG_SCHEDULE'
]);

const voices=loadReference('communications-girls-voices.js',[
  'GTG_VOICE_LIBRARY',
  'gtgVoiceMessage'
]);

function validateCommunications(){
  const errors=[];
  const expectedCharacters=['grace','ava','lola','seb'];
  if(!Array.isArray(core.GTG_TRIGGERS)||core.GTG_TRIGGERS.length!==39){
    errors.push(`GTG_TRIGGERS expected 39 messages, found ${core.GTG_TRIGGERS?.length ?? 'missing'}`);
  }
  for(const character of expectedCharacters){
    const list=voices.GTG_VOICE_LIBRARY?.[character];
    if(!Array.isArray(list)||list.length!==39){
      errors.push(`${character} expected 39 voice messages, found ${list?.length ?? 'missing'}`);
    }
  }
  if(errors.length){
    const error=new Error(`Girls communications validation failed:\n- ${errors.join('\n- ')}`);
    error.validationErrors=errors;
    throw error;
  }
  return {
    triggerCount:core.GTG_TRIGGERS.length,
    characters:expectedCharacters.reduce((out,key)=>{
      out[key]=voices.GTG_VOICE_LIBRARY[key].length;
      return out;
    },{})
  };
}

module.exports={...core,...voices,validateCommunications};
