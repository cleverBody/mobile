import{bd as a,be as i,bf as d,bg as c,bh as l}from"./index-C9U6OB9Y.js";/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const h=()=>{const e=window;e.addEventListener("statusTap",()=>{a(()=>{const o=e.innerWidth,s=e.innerHeight,n=document.elementFromPoint(o/2,s/2);if(!n)return;const t=i(n);t&&new Promise(r=>d(t,r)).then(()=>{c(async()=>{t.style.setProperty("--overflow","hidden"),await l(t,300),t.style.removeProperty("--overflow")})})})})};export{h as startStatusTap};
//# sourceMappingURL=status-tap-zGKGE0xs.js.map
