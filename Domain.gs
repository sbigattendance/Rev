/* Pure business rules, shared with the regression tests. Dates are YYYY-MM-DD in Asia/Kolkata. */
const RF_MONTHS_ = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function fail_(message){throw new Error(message);}
function text_(value,max){return String(value==null?'':value).trim().slice(0,max||250);}
function money_(value){const n=Number(value);if(!Number.isFinite(n)||n<0||n>10000000)fail_('Enter a valid non-negative amount.');return Math.round(n*100)/100;}
function date_(value){const s=text_(value,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||new Date(s+'T12:00:00Z').toISOString().slice(0,10)!==s)fail_('Enter a valid date.');return s;}
function month_(value){const s=text_(value,7);if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(s))fail_('Invalid billing month.');return s;}
function phone_(value){let s=String(value||'').replace(/\D/g,'');if(s.length===12&&s.startsWith('91'))s=s.slice(2);if(!/^\d{10}$/.test(s))fail_('Enter a 10-digit mobile number.');return s;}
function addMonths_(value,n){const d=new Date(date_(value)+'T12:00:00Z');const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+n);d.setUTCDate(Math.min(day,new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate()));return d.toISOString().slice(0,10);}
function previousMonth_(p){return addMonths_(month_(p)+'-01',-1).slice(0,7);}
function fy_(date){const y=Number(date.slice(0,4)),m=Number(date.slice(5,7)),s=m>=4?y:y-1;return s+'-'+(s+1);}
function fyPeriods_(fy){if(!/^\d{4}-\d{4}$/.test(fy)||Number(fy.slice(5))!==Number(fy.slice(0,4))+1)fail_('Invalid financial year.');const y=Number(fy.slice(0,4));return Array.from({length:12},(_,i)=>addMonths_(y+'-04-01',i).slice(0,7));}
function eligibleReadmission_(member,attendance,asOf,basis){let last=member.date;if(basis!=='admission'){attendance.filter(a=>a.memberId===member.id&&a.date<=asOf).forEach(a=>{if(a.date>last)last=a.date;});}const eligibleOn=addMonths_(last,6);return {eligible:asOf>=eligibleOn,lastActivity:last,eligibleOn,basis:basis||'lastAttendance'};}
function nextMemberId_(members){const max=members.reduce((n,m)=>Math.max(n,/^REV-\d+$/.test(m.id)?Number(m.id.slice(4)):0),0);return 'REV-'+String(max+1).padStart(4,'0');}
function effectiveTariff_(date,tariffs,promos,settings){date=date_(date);const promo=promos.filter(p=>p.active!==false&&date>=p.startDate&&date<=p.endDate).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))||String(b.id).localeCompare(String(a.id)))[0];const t=promo||tariffs.find(t=>t.id===date.slice(0,7))||{admissionFee:settings.admissionFee,regularFee:settings.regularFee,ptFee:settings.ptFee};return {admissionFee:money_(t.admissionFee),regularFee:money_(t.regularFee),ptFee:money_(t.ptFee),promoName:promo?promo.name:''};}
function admissionQuote_(p,tariffs,promos,s){const date=date_(p.date),t=effectiveTariff_(date,tariffs,promos,s);const days=new Date(Number(date.slice(0,4)),Number(date.slice(5,7)),0).getDate()-Number(date.slice(8))+1;const rate=p.trainingCategory==='Personal Training'?t.ptFee:t.regularFee;const fee=days<15?Math.round(rate/30*days):rate;return {date,period:date.slice(0,7),admissionFee:t.admissionFee,trainingFee:fee,total:money_(t.admissionFee+fee),promoName:t.promoName,remainingDays:days,prorated:days<15};}
function active_(m){return m.status==='Active';}
function periodAllowed_(m,p,today){return p>=m.date.slice(0,7)&&p<=today.slice(0,7)&&(!m.billingEnd||p<=m.billingEnd);}
function calendar_(member,fy,charges,transactions,attendance,tariffs,promos,settings,today){return fyPeriods_(fy).filter(p=>periodAllowed_(member,p,today)).map(p=>{
 const cid=member.id+':training:'+p,c=charges.find(x=>x.id===cid);const amount=c?money_(c.amount):effectiveTariff_(p+'-01',tariffs,promos,settings)[member.trainingCategory==='Personal Training'?'ptFee':'regularFee'];
 const tx=transactions.filter(t=>t.chargeId===cid),paid=money_(tx.reduce((s,t)=>s+Number(t.amount),0));const due=money_(Math.max(0,amount-paid));return {period:p,chargeId:cid,amount,paid,due,status:due===0?'Paid':paid>0?'Partial':'Unpaid',attendance:attendance.filter(a=>a.memberId===member.id&&a.date.slice(0,7)===p).length,receipts:[...new Set(tx.map(t=>t.receiptId))]};
 });}
function changePercent_(current,previous){return previous===0?null:Math.round((current-previous)/previous*1000)/10;}
