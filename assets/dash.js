videojs("my-video");const path=window.location.pathname.slice(1).split("@"),username=path[0],room=path[1];var toastTrigger=document.getElementById("liveToastBtn"),toastLiveExample=document.getElementById("liveToast");toastTrigger&&toastTrigger.addEventListener("click",(function(){new bootstrap.Toast(toastLiveExample).show()})),document.querySelector("#share-link").setAttribute("data-bs-content",window.location.origin+"/<USERNAME>@"+room);var popoverTriggerList=[].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]')),popoverList=popoverTriggerList.map((function(e){return new bootstrap.Popover(e)}));const membersDiv=document.querySelector("#members"),fileInput=document.querySelector("#vid-file"),mainVid=document.querySelector("#my-video_html5_api"),constraints={audio:!0,video:{width:120,height:100}};var socket,openMediaStream=null,connectedUsers={};async function init(){try{openMediaStream=await navigator.mediaDevices.getUserMedia(constraints),addStream(Math.random,"self",openMediaStream,!0),socket=io("/");const e=new Peer;e.on("open",(e=>{socket.emit("joinRoom",{uname:username,room:room,peer:e})})),socket.on("member-left",(({peer:e})=>{connectedUsers[e][0].close(),connectedUsers[e][1].remove()})),socket.on("pause",(e=>{mainVid.pause(),mainVid.currentTime=e.tStamp})),socket.on("play",(e=>{mainVid.currentTime=e.tStamp,mainVid.currentTime>0&&!mainVid.paused&&!mainVid.ended&&mainVid.readyState>mainVid.HAVE_CURRENT_DATA||mainVid.play()})),e.on("call",(e=>{e.answer(openMediaStream),e.on("stream",(t=>{connectedUsers[e.peer]||addStream(e,e.peer,t,!1)}))})),socket.on("add-member",(t=>{const a=e.call(t,openMediaStream);a.on("stream",(e=>{connectedUsers[t]||addStream(a,t,e,!1)}))})),socket.on("updateURI",(e=>{magnetPlay(e)}))}catch(e){console.log("error: ",e.message)}}function addStream(e,t,a,i){const o=document.createElement("div"),n=document.createElement("div"),s=document.createElement("div"),d=document.createElement("i"),c=document.createElement("i"),r=document.createElement("video");o.classList.add("col"),n.classList.add("position-relative","user_vid"),s.classList.add("control-panel","position-absolute","bottom-0","start-50","translate-middle","d-flex","justify-content-center"),d.classList.add("fs-3","bi","text-light","bi-camera-video"),i?c.classList.add("fs-3","bi","text-light","bi-mic"):c.classList.add("fs-3","bi","text-light","bi-volume-up"),r.classList.add("rounded","border-3","ms-1","ms-sm-0","mb-0","mb-sm-1","w-100","d-block"),r.volume=i?0:.4,r.srcObject=a,r.addEventListener("loadedmetadata",r.play),d.addEventListener("click",(e=>handleMediaStream(a,!0,e.target,i))),c.addEventListener("click",(e=>handleMediaStream(a,!1,e.target,i))),s.appendChild(c),s.appendChild(d),n.appendChild(s),n.appendChild(r),o.appendChild(n),membersDiv.append(o),connectedUsers[t]=[e,o]}function handleMediaStream(e,t,a){t?(e.getVideoTracks().forEach((e=>{e.enabled=!e.enabled})),a.classList.contains("bi-camera-video")?a.classList.replace("bi-camera-video","bi-camera-video-off"):a.classList.replace("bi-camera-video-off","bi-camera-video")):(e.getAudioTracks().forEach((e=>{e.enabled=!e.enabled})),self&&(a.classList.contains("bi-mic")?a.classList.replace("bi-mic","bi-mic-mute"):a.classList.replace("bi-mic-mute","bi-mic")),a.classList.contains("bi-volume-up")?a.classList.replace("bi-volume-up","bi-volume-mute"):a.classList.replace("bi-volume-mute","bi-volume-up")),a.classList.toggle("bg-danger")}init();