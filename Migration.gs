/** Run only from the Apps Script editor, before any v4 live registrations. */
function legacySnapshot_(){
 const url=props_().getProperty('LEGACY_API_URL')||'';
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url))fail_('Set LEGACY_API_URL to the existing deployment URL.');
 const response=UrlFetchApp.fetch(url+'?action=pull',{muteHttpExceptions:true});
 if(response.getResponseCode()!==200)fail_('Legacy export failed.');
 const data=JSON.parse(response.getContentText());
 if(!Array.isArray(data.users)||!Array.isArray(data.payments))fail_('Unexpected legacy export. No records imported.');
 return data;
}
function previewLegacyMigration_(){const x=legacySnapshot_();const summary={members:x.users.length,payments:x.payments.length,attendance:(x.attendance||[]).length,expenses:(x.expenses||[]).length,staff:(x.staff||[]).length};console.log(JSON.stringify(summary));return summary;}
function importLegacy_(){if(props_().getProperty('MIGRATION_APPROVED')!=='YES')fail_('Back up the old sheet, pause old-site writes, then set MIGRATION_APPROVED=YES.');const result=importLegacyData_(legacySnapshot_());props_().deleteProperty('MIGRATION_APPROVED');console.log(JSON.stringify(result));return result;}
function importLegacyData_(x){
 const lock=LockService.getScriptLock();if(!lock.tryLock(15000))fail_('Sheet busy.');
 try{
 const d=new Store_();if(d.get('Settings','legacyImportedAt'))fail_('Legacy import is already complete. Do not import twice.');
 if(d.rows('Members').length||d.rows('Transactions').length||d.rows('Attendance').length)fail_('Import requires an empty v4 member/transaction/attendance database. Original sheets are preserved.');
 const warnings=[],stamp=now_();
 const iso=v=>{v=String(v||'');if(/^\d{2}-\d{2}-\d{4}$/.test(v))v=v.slice(6)+'-'+v.slice(3,5)+'-'+v.slice(0,2);return date_(v.slice(0,10));};
 const key=(prefix,v)=>prefix+hash_(JSON.stringify(v)).slice(0,24);
 const media=(data,id)=>{if(!data)return '';if(!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(data))fail_('Unsupported legacy image for '+id+'. Correct the source image first.');const group=key('LEGACY-IMG-',id);for(let i=0;i<data.length;i+=35000)d.append('Media',{id:group+':'+i,part:group,content:data.slice(i,i+35000)});return group;};
 for(const m of x.users){if(!m.id)fail_('Legacy member has no ID.');const date=iso(m.date);d.append('Members',{id:m.id,date,status:'Active',firstName:m.firstName||m.fullName||'',lastName:m.lastName||'',fullName:m.fullName||[m.firstName,m.lastName].filter(Boolean).join(' '),primaryContact:String(m.primaryContact||''),alternateContact:String(m.alternateContact||''),dob:m.dob?iso(m.dob):'',address:m.address||'',admissionCategory:m.admissionCategory||'Individual',trainingCategory:m.trainingCategory||'Regular',previousId:'',billingEnd:'',photoId:media(m.photo,m.id+':photo'),signatureId:media(m.signature,m.id+':signature'),createdAt:date+'T06:30:00.000Z',createdBy:'Legacy import',updatedAt:stamp});}
 for(const p of x.payments){const n=RF_MONTHS_.indexOf(p.month),start=Number(String(p.fy).slice(0,4));if(n<0||!start||!p.userId)fail_('Invalid legacy payment month/year/member.');const period=(start+(n<3?1:0))+'-'+String(n+1).padStart(2,'0'),id=p.userId+':training:'+period;const amount=money_(p.totalDue),paid=money_(p.amountPaid);d.append('Charges',{id,memberId:p.userId,type:'Fee',period,amount,promoName:'Imported combined monthly balance',createdAt:stamp});if(!paid)continue;
 const m=d.get('Members',p.userId),estimated=!p.lastDate||!Number.isFinite(Date.parse(p.lastDate)),createdAt=estimated?period+'-01T06:30:00.000Z':new Date(p.lastDate).toISOString();if(estimated)warnings.push('Estimated payment date: '+id);
 const txId=key('LEGACY-TX-',id);d.append('Transactions',{id:txId,receiptId:txId.replace('TX','RCT'),memberId:p.userId,memberName:m?.fullName||'Archived member '+p.userId,phone:m?.primaryContact||'',chargeId:id,period,type:'Legacy',amount:paid,mode:p.method||'Unknown',reference:'Imported monthly aggregate',staffId:'LEGACY',staffName:'Legacy import',createdAt,detailsJson:JSON.stringify({legacyAggregate:true,dateEstimated:estimated,note:'Original system retained monthly totals, not individual payment receipts.'})});}
 for(const a of x.attendance||[]){const date=iso(a.dateKey),id=a.userId+':'+date;if(d.get('Attendance',id))continue;d.append('Attendance',{id,memberId:a.userId,name:a.fullName||'',date,time:String(a.timestamp||''),createdAt:date+'T06:30:00.000Z',markedBy:'Legacy import'});}
 for(const e of x.expenses||[])d.append('Expenses',{id:e.id||key('LEGACY-EXP-',e),date:iso(e.date),amount:money_(e.amount),category:e.category||'Other',mode:e.mode||'Unknown',description:e.desc||'',staffId:'LEGACY',staffName:'Legacy import',createdAt:e.timestamp||stamp});
 for(const [fy,months] of Object.entries(x.tariffs||{}))for(const [month,t] of Object.entries(months)){const n=RF_MONTHS_.indexOf(month);if(n<0)fail_('Unknown legacy tariff month.');d.put('Tariffs',{id:(Number(fy.slice(0,4))+(n<3?1:0))+'-'+String(n+1).padStart(2,'0'),admissionFee:money_(t.admFee),regularFee:money_(t.regFee),ptFee:money_(t.ptFee)});}
 for(const t of x.specialTariffs||[])d.put('Promotions',{id:String(t.id||key('LEGACY-PROMO-',t)),name:t.name||'Imported promotion',startDate:iso(t.startDate),endDate:iso(t.endDate),admissionFee:money_(t.admFee),regularFee:money_(t.regFee),ptFee:money_(t.ptFee),active:true,createdAt:stamp});
 for(const s of x.staff||[])d.put('Staff',{id:key('LEGACY-STAFF-',s.id||s.name),name:s.name||'Imported staff',role:'staff',pinHash:'',active:false,authVersion:1,createdAt:stamp});
 if(x.settings?.upiId)d.put('Settings',{id:'upiId',value:JSON.stringify(x.settings.upiId)});
 d.put('Settings',{id:'legacyImportedAt',value:JSON.stringify(stamp)});
 const result={members:x.users.length,monthlyPayments:x.payments.length,attendance:(x.attendance||[]).length,expenses:(x.expenses||[]).length,estimatedPaymentDates:warnings.length,staffRequireNewPins:(x.staff||[]).length};
 d.put('Settings',{id:'legacyImportSummary',value:JSON.stringify(result)});audit_(d,{id:'ADMIN',name:'Administrator'},'legacyImport','database',JSON.stringify(result));d.commit();return result;
 }finally{lock.releaseLock();}
}
