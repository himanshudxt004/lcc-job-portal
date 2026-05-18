(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  const LABELS={new:'New',contacted:'Contacted',in_progress:'In Progress',closed:'Closed'};
  ready(async function(){
    if(!LCCAdmin.initAdminPage('admin-hiring-requests.html'))return;
    document.getElementById('pageSub').textContent='Company inquiries and consultation requests';
    const wrap=document.getElementById('hireList');
    try{
      const r=await LCCApi.get('/hiring-requests');
      const list=r.requests||[];
      if(!list.length){wrap.innerHTML='<div class="empty-state"><h3>No requests yet</h3></div>';return;}
      wrap.innerHTML=list.map(function(h){
        return '<div class="row-item"><div><h4>'+LCCDash.escapeHTML(h.companyName)+' — '+LCCDash.escapeHTML(h.contactName)+'</h4><span>'+LCCDash.escapeHTML(h.email)+'</span><span>'+LCCDash.escapeHTML(h.rolesNeeded||h.type)+'</span><span>'+LCCDash.escapeHTML(h.message||'').slice(0,80)+'</span></div></div><div class="actions"><select data-h="'+h._id+'">'+Object.keys(LABELS).map(function(k){return '<option value="'+k+'"'+(k===h.status?' selected':'')+'>'+LABELS[k]+'</option>';}).join('')+'</select></div></div>';
      }).join('');
      wrap.querySelectorAll('select[data-h]').forEach(function(sel){sel.addEventListener('change',async function(){
        try{await LCCApi.patch('/hiring-requests/'+sel.getAttribute('data-h')+'/status',{status:sel.value});LCCDash.showToast('Updated','ok');}catch(e){LCCDash.showToast(e.message,'error');}
      });});
    }catch(e){wrap.innerHTML='<p>'+LCCDash.escapeHTML(e.message)+'</p>';}
  });
})();