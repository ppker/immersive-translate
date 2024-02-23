(()=>{var u="imt-subtitle-inject",f=class{from;to;constructor(e,s){this.from=e,this.to=s}sendMessages(e){globalThis.postMessage({type:u,to:this.to,from:this.from,action:e.action,data:e.data,id:e.id||new Date().getTime(),isAsync:!1})}getRandomId(){return(new Date().getTime()+Math.random())*Math.random()}sendAsyncMessages({action:e,data:s}){return new Promise(t=>{let n=this.getRandomId();globalThis.postMessage({type:u,to:this.to,from:this.from,action:e,data:s,id:n,isAsync:!0});let o=({data:a})=>{u===a.type&&a.id===n&&a.to===this.from&&(t(a.data),globalThis.removeEventListener("message",o))};globalThis.addEventListener("message",o)})}handleMessageOnce(e){return new Promise(s=>{let t=({data:n})=>{u===n.type&&n.action===e&&n.to===this.from&&(s(n.data),globalThis.removeEventListener("message",t))};globalThis.addEventListener("message",t)})}handleMessage(e,s){let t=({data:n})=>{u===n.type&&n.action===e&&n.to===this.from&&s(n)};return globalThis.addEventListener("message",t),()=>{globalThis.removeEventListener("message",t)}}handleMessages(e){let s=({data:t})=>{u===t.type&&t.to===this.from&&e(t)};return globalThis.addEventListener("message",s),()=>{globalThis.removeEventListener("message",s)}}},R=new f("content-script","inject"),l=new f("inject","content-script"),S={get(r,e,s){return e in r?(...t)=>{let n=r[e];return typeof n=="function"?n.apply(r,t):Reflect.get(r,e,s)}:t=>r.sendAsyncMessages({action:e,data:t})}},M=new Proxy(l,S),P=new Proxy(R,S);var i=class{content=M;config;constructor(e){this.config=e,l.handleMessages(async({action:s,id:t,data:n})=>{let o=this[s];if(!o)return;let a=o.apply(this,[n]);a instanceof Promise&&(a=await a),l.sendMessages({id:t,data:a})})}triggerSubtitle(e){}async translateSubtitle(e){let s=await this.content.requestSubtitle({url:x(e._url)});if(s){if(this.config.responseType=="document"){let n=new DOMParser().parseFromString(s,"text/xml");Object.defineProperty(e,"responseXML",{value:n,writable:!1}),Object.defineProperty(e,"response",{value:n,writable:!1});return}let t=s;(e.responseType=="arraybuffer"||this.config.responseType=="arraybuffer")&&typeof s=="string"&&(t=new TextEncoder().encode(s).buffer),Object.defineProperty(e,"responseText",{value:t,writable:!1}),Object.defineProperty(e,"response",{value:t,writable:!1})}}async translateSubtitleWithFetch(e,s){let t;return typeof e=="string"?t={url:e,method:"GET",headers:{}}:t=await v(e),this.content.requestSubtitle({fetchInfo:JSON.stringify({input:t,options:s})})}async getVideoMeta(e){}isSubtitleRequest(e){return!this.config||!this.config.subtitleUrlRegExp||!e?!1:new RegExp(this.config.subtitleUrlRegExp).test(e||"")}};function v(r){if(r instanceof URL)return{url:r.href,method:"GET",headers:{}};let e=r.clone(),s={url:r.url,method:r.method,headers:Object.fromEntries(r.headers.entries())};if(e.body)if(e.body instanceof FormData){let t={};for(let[n,o]of e.body.entries())t[n]=o;s.body=t}else return e.text().then(t=>(s.body=t,s));return Promise.resolve(s)}function x(r){return r?r.startsWith("//")?"https:"+r:r.match(/(http|https):\/\//)?r:"https://"+r:null}var d=class extends i{timer=null;triggerSubtitle({force:e}){setTimeout(()=>{if(this.config?.subtitleButtonSelector){let s=document.querySelector(this.config.subtitleButtonSelector);if(s){let t=s.getAttribute("aria-pressed")==="true";t&&e?(s.click(),setTimeout(()=>{s.click()},100)):t||s.click();return}}if(this.config?.videoPlayerSelector){let s=document.querySelector(this.config.videoPlayerSelector);s.toggleSubtitles(),setTimeout(()=>{s.toggleSubtitles()},100)}},1e3)}async getVideoMeta(){if(!this.config.videoPlayerSelector)return null;try{return await this.sleep(100),document.querySelector(this.config.videoPlayerSelector)?.getPlayerResponse()}catch{return null}}sleep(e){return new Promise(s=>{setTimeout(()=>{s(null)},e)})}};var h=class extends i{timer=null;videoMeta={};lastVideoMeta=null;constructor(e){super(e),this.hookJSON()}hookJSON(){let e=JSON.parse;JSON.parse=s=>{let t=e(s);try{t&&t.result&&t.result.timedtexttracks&&t.result.movieId&&(this.videoMeta[t.result.movieId]=t.result,this.lastVideoMeta=t.result)}catch(n){console.log(n)}return t}}getVideoMeta(e){return this.lastVideoMeta}};var g=class extends i{timer=null;videoMeta={};constructor(e){super(e),this.hookJSON()}hookJSON(){let e=JSON.parse;JSON.parse=s=>{let t=e(s);try{t?.asset?.captions?.length?this.videoMeta[t.id]=t?.asset:t?.previews&&t?.course&&t?.previews?.forEach(n=>{this.videoMeta[n.id]=n})}catch(n){console.error(n)}return t}}getVideoMeta(e){return this.videoMeta[e]}};var m=class extends i{timer=null;videoMeta={};constructor(e){super(e),this.hookJSON()}hookJSON(){let e=JSON.parse;JSON.parse=s=>{let t=e(s);try{if(t?.stream?.sources?.length&&t?.stream?.sources[0]?.complete?.url){let n=window.location.pathname.split("/");n.length>2&&n[n.length-2]==="video"&&(this.videoMeta[n[n.length-1]]=t.stream.sources[0].complete.url)}}catch(n){console.error(n)}return t}}getVideoMeta(e){return this.videoMeta[e]}};var p=class extends i{constructor(e){super(e)}async translateSubtitleWithFetch(e,s){this.main(e,s)}async main(e,s){let t=globalThis.__originalFetch;if(!t)return;let n=e;e instanceof Request&&(n=e.clone());let o=await t(n,s);if(!o.ok)return;let a=await o.json();a.transcripts_urls&&this.requestSubtitle(a.transcripts_urls)}async requestSubtitle(e){await c(),await this.content.requestSubtitle(e)}};async function T(){let r=await l.sendAsyncMessages({action:"getConfig"});if(!r)return;let s={youtube:d,netflix:h,webvtt:i,khanacademy:i,bilibili:i,udemy:g,general:i,ebutt:i,hulu:p,disneyplus:m,"fmp4.xml":i,multi_attach_vtt:i,twitter:i,subsrt:i,xml:i,text_track_dynamic:i}[r.type||""];if(!s)return;let t=new s(r);w(t,r)}c();T();function w(r,e){if(e.hookType==="xhr"){let s=XMLHttpRequest.prototype.open,t=XMLHttpRequest.prototype.send,n=function(){return this._url=arguments[1],s.apply(this,arguments)},o=async function(){return r.isSubtitleRequest(this._url)?(await c(),await r.translateSubtitle(this),t.apply(this,arguments)):t.apply(this,arguments)};Object.defineProperty(XMLHttpRequest.prototype,"open",{value:n,writable:!0}),Object.defineProperty(XMLHttpRequest.prototype,"send",{value:o,writable:!0})}else if(e.hookType==="fetch"){let s=globalThis.fetch;globalThis.__originalFetch=s,globalThis.fetch=async function(t,n){let o=typeof t=="string"?t:t.url||t.href;if(!r.isSubtitleRequest(o))return s(t,n);await c();let b=await r.translateSubtitleWithFetch(t,n);return b?new Response(b):s(t,n)}}}var y=!1;async function c(){return y||(await l.handleMessageOnce("contentReady"),y=!0),y}})();