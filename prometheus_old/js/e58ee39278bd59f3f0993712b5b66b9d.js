var extsrc=null;(function(){extsrc=new Object;extsrc.complete=function(f){this.complete.funcs.push(f)};extsrc.complete.funcs=[];var document_write=document.write;var document_writeln=document.writeln;var buffer='';var span='';function dumpBuffer(){if(buffer&&span){document.write=document_write;document.writeln=document_writeln;var txt=document.createElement('span');txt.innerHTML=buffer;span.appendChild(txt);buffer=''}};function runNextScript(){dumpBuffer();var scripts=document.getElementsByTagName('script');for(var i=0;i<scripts.length;i++){var current_script=scripts[i];var cur_asyncsrc=current_script.getAttribute('asyncsrc');if(cur_asyncsrc){current_script.setAttribute('asyncsrc','');var s=document.createElement('script');s.async=!0;s.src=cur_asyncsrc;document.getElementsByTagName('head')[0].appendChild(s)};var cur_extsrc=current_script.getAttribute('extsrc');if(cur_extsrc){current_script.setAttribute('extsrc','');span=document.createElement('span');current_script.parentNode.insertBefore(span,current_script);document.write=function(txt){buffer+=txt};document.writeln=function(txt){buffer+=txt;buffer+='\n'};var s=document.createElement('script');s.async=!0;s.src=cur_extsrc;if(isIE()){s.onreadystatechange=function(){if(this.readyState=='loaded'||this.readyState=='complete'){runNextScript()}}}else{if((navigator.userAgent.indexOf("Firefox")!=-1)||('onerror' in s)){s.onload=runNextScript;s.onerror=runNextScript}else{s.onload=runNextScript;s.onreadystatechange=runNextScript}};document.getElementsByTagName('head')[0].appendChild(s);return}};dumpBuffer();document.write=document_write;document.writeln=document_writeln;for(var i=0;i<extsrc.complete.funcs.length;i++){extsrc.complete.funcs[i]()}};function isIE(){return/msie/i.test(navigator.userAgent)&&!/opera/i.test(navigator.userAgent)};function init(){if(arguments.callee.done)return;arguments.callee.done=!0;runNextScript()};if(document.addEventListener){document.addEventListener("DOMContentLoaded",init,!1)}
if(/WebKit/i.test(navigator.userAgent)){var _timer=setInterval(function(){if(/loaded|complete/.test(document.readyState)){clearInterval(_timer);init()}},10)}
window.onload=init})()