/* Browser memory only. Requests use a private Apps Script HTML bridge and confirmed RPC results. */
class SheetsBridge {
 constructor(url){this.url=url;this.channel=crypto.randomUUID();this.pending=new Map();this.target=null;this.targetOrigin=null;this.connecting=null;window.addEventListener('message',e=>this.receive(e));}
 receive(event){const d=event.data;if(!d||d.channel!==this.channel)return;
  if(d.type==='revive:ready'){
   if(!/^https:\/\/(?:script|[a-z0-9-]+-script)\.googleusercontent\.com$/.test(event.origin))return;
   if(this.target&&event.source!==this.target)return;
   this.target=event.source;this.targetOrigin=event.origin;this.resolveReady?.();return;
  }
  if(event.source!==this.target||event.origin!==this.targetOrigin||d.type!=='revive:response')return;
  const entry=this.pending.get(d.messageId);if(!entry)return;clearTimeout(entry.timer);this.pending.delete(d.messageId);entry.resolve(d.result);
 }
 async connect(){if(this.target)return;if(this.connecting)return this.connecting;
  this.connecting=new Promise((resolve,reject)=>{
   if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(this.url)){reject(new Error('The live Sheets connection needs setup. Please contact the studio administrator.'));return;}
   const timeout=setTimeout(()=>{this.connecting=null;this.frame?.remove();reject(new Error('The Sheets service did not connect. Check the web app deployment and permitted site origin.'));},30000);
   this.resolveReady=()=>{clearTimeout(timeout);resolve();};
   this.frame=document.createElement('iframe');this.frame.hidden=true;this.frame.title='Live Google Sheets connection';this.frame.setAttribute('aria-hidden','true');
   const url=new URL(this.url);url.searchParams.set('origin',location.origin);url.searchParams.set('channel',this.channel);url.searchParams.set('v','4');this.frame.src=url.href;document.body.append(this.frame);
  });
  try{await this.connecting;}catch(e){this.connecting=null;throw e;}
 }
 async call(request){await this.connect();const messageId=crypto.randomUUID();return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{this.pending.delete(messageId);const e=new Error('The service has not confirmed this request.');e.uncertain=true;reject(e);},60000);
  this.pending.set(messageId,{resolve,reject,timer});this.target.postMessage({type:'revive:request',channel:this.channel,messageId,request},this.targetOrigin);
 });}
}
