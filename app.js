const feedList = document.querySelector('#feedList');
const videoInput = document.querySelector('#videoInput');
const preview = document.querySelector('#preview');
const caption = document.querySelector('#caption');
const publishBtn = document.querySelector('#publishBtn');
const status = document.querySelector('#uploadStatus');
const myVideos = document.querySelector('#myVideos');

const demoVideos = [
  {src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", user:"@vibe", caption:"أول فيديو تجريبي في Vibe 🌸", likes:128},
  {src:"https://www.w3schools.com/html/mov_bbb.mp4", user:"@creator", caption:"تجربة تشغيل الفيديو العمودي 🎬", likes:64}
];

let userVideos = JSON.parse(localStorage.getItem('vibeVideos') || '[]');

function makeFeedItem(v){
  const item=document.createElement('article');
  item.className='feed-item';
  item.innerHTML=`
    <video src="${v.src}" playsinline loop muted preload="metadata"></video>
    <div class="overlay">
      <div class="caption"><b>${escapeHtml(v.user||'@user')}</b><br>${escapeHtml(v.caption||'')}</div>
      <div class="actions">
        <button class="action like">♥<small>${v.likes||0}</small></button>
        <button class="action comment">💬<small>تعليق</small></button>
        <button class="action share">↗<small>مشاركة</small></button>
      </div>
    </div>`;
  const video=item.querySelector('video');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>e.isIntersecting ? video.play().catch(()=>{}) : video.pause());
  },{threshold:.65});
  io.observe(item);
  item.querySelector('.like').onclick=()=>{
    v.likes=(v.likes||0)+1;
    item.querySelector('.like small').textContent=v.likes;
  };
  item.querySelector('.share').onclick=async()=>{
    try{await navigator.share({title:'Vibe',text:v.caption||'',url:location.href})}
    catch{}
  };
  item.querySelector('.comment').onclick=()=>alert('التعليقات ستُربط بقاعدة البيانات في المرحلة القادمة.');
  return item;
}

function renderFeed(){
  feedList.innerHTML='';
  [...userVideos,...demoVideos].reverse().forEach(v=>feedList.appendChild(makeFeedItem(v)));
}
function renderProfile(){
  myVideos.innerHTML='';
  userVideos.forEach(v=>{
    const video=document.createElement('video');
    video.src=v.src; video.muted=true; video.loop=true; video.playsInline=true;
    myVideos.appendChild(video);
  });
}
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelector('#'+id)?.classList.add('active');
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.screen===id));
}
document.querySelectorAll('.nav[data-screen]').forEach(b=>b.onclick=()=>showScreen(b.dataset.screen));
document.querySelector('#navSearch').onclick=()=>document.querySelector('#searchDialog').showModal();
document.querySelector('#searchBtn').onclick=()=>document.querySelector('#searchDialog').showModal();

videoInput.onchange=()=>{
  const file=videoInput.files[0];
  if(!file)return;
  preview.src=URL.createObjectURL(file);
  preview.hidden=false;
  status.textContent=`تم اختيار: ${file.name}`;
};
publishBtn.onclick=()=>{
  const file=videoInput.files[0];
  if(!file){status.textContent='اختر فيديو أولاً.';return;}
  const url=URL.createObjectURL(file);
  userVideos.push({src:url,user:'@vibe_user',caption:caption.value||'فيديو جديد',likes:0});
  localStorage.setItem('vibeVideos',JSON.stringify(userVideos));
  status.textContent='تم نشر الفيديو محليًا. الربط بالإنترنت يأتي في المرحلة التالية.';
  caption.value=''; videoInput.value=''; preview.hidden=true;
  renderFeed(); renderProfile(); showScreen('feed');
};
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
renderFeed(); renderProfile();
