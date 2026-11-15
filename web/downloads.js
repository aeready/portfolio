/* Original bytes are hosted in parts only when larger than the asset limit. */
window.PortfolioDownloads = (() => {
  const states = new Map();
  const type='application/vnd.openxmlformats-officedocument.presentationml.presentation';
  const update=(id,state,notify)=>{states.set(id,state);notify?.(state);};
  const saveBlob=(blob,filename)=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);};
  async function download(id,notify,typeLabel='PowerPoint presentation') {
    const file=window.PORTFOLIO_ORIGINALS[id];
    if(!file||states.get(id)?.busy)return;
    let writable;
    try {
      update(id,{state:'downloadPreparing',busy:true},notify);
      if(file.url){const a=document.createElement('a');a.href=file.url;a.download=file.filename;document.body.appendChild(a);a.click();a.remove();update(id,{state:'downloadStarted',busy:false},notify);return;}
      if(typeof window.showSaveFilePicker==='function'){
        try {
          const handle=await window.showSaveFilePicker({suggestedName:file.filename,types:[{description:typeLabel,accept:{[type]:['.pptx']}}]});
          writable=await handle.createWritable();
        } catch(error) {if(!['SecurityError','TypeError','NotAllowedError'].includes(error.name))throw error; /* Embedded browsers may require the normal download fallback. */}
      }
      const buffers=[];let received=0;
      for(const part of file.parts){
        const response=await fetch(part.url);if(!response.ok)throw Error('Transfer failed');
        const buffer=await response.arrayBuffer();if(buffer.byteLength!==part.bytes)throw Error('Incomplete file');
        if(globalThis.crypto?.subtle){const digest=await crypto.subtle.digest('SHA-256',buffer);const hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');if(hex!==part.sha256)throw Error('File verification failed');}
        if(writable)await writable.write(buffer);else buffers.push(buffer);
        received+=buffer.byteLength;update(id,{state:'downloadReceiving',busy:true,percent:Math.floor(received/file.bytes*100)},notify);
      }
      if(received!==file.bytes)throw Error('Incomplete file');
      if(writable){await writable.close();writable=null;update(id,{state:'downloadSaved',busy:false},notify);}
      else {saveBlob(new Blob(buffers,{type}),file.filename);update(id,{state:'downloadStarted',busy:false},notify);}
    } catch(error) {
      if(error.name!=='AbortError')console.warn('Original file transfer failed:',error.name,error.message);
      if(writable)try{await writable.abort();}catch{}
      update(id,{state:error.name==='AbortError'?'downloadCancelled':'downloadFailed',busy:false},notify);
    }
  }
  return {download,getState:id=>states.get(id)};
})();
