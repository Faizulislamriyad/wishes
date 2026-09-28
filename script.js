import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged, signOut,
  GoogleAuthProvider, signInWithPopup, linkWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, setDoc, onSnapshot, query, orderBy,
  serverTimestamp, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKbFYxRaZLn0NZwgL7HF4JHBGlwT5BIjc",
  authDomain: "wishes-726f9.firebaseapp.com",
  projectId: "wishes-726f9",
  storageBucket: "wishes-726f9.firebasestorage.app",
  messagingSenderId: "341661769706",
  appId: "1:341661769706:web:8b18d096c1c08bcd449c93",
  measurementId: "G-78M565LVHH"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ---------- i18n ---------- */
const I18N = {
  bn: {
    shareProfile:'🔗 শেয়ার', signInGoogle:'Google দিয়ে সাইন ইন',
    continueGuest:'অতিথি হিসেবে চালিয়ে যান',
    authTitle:'স্বাগতম!', authSubtitle:'আপনার উইশ শেয়ার করতে সাইন ইন করুন',
    postPlaceholder:'আপনার উইশ লিখুন... ✨', image:'ছবি', anonymous:'বেনামী',
    attachProfile:'প্রোফাইল যুক্ত', postWish:'উইশ পোস্ট করুন', posting:'পোস্ট হচ্ছে...',
    myProfile:'আমার প্রোফাইল', displayName:'প্রদর্শিত নাম', avatarImage:'প্রোফাইল ছবি',
    save:'সেভ', cancel:'বাতিল', signOut:'সাইন আউট', signInWithGoogle:'Google দিয়ে সাইন ইন',
    guest:'অতিথি', anon:'বেনামী', edited:'সম্পাদিত',
    like:'লাইক', liked:'লাইকড', comment:'কমেন্ট', share:'শেয়ার',
    likes:'লাইক', comments:'কমেন্ট',
    noPosts:'এখনো কোনো উইশ নেই', noPostsSub:'প্রথম উইশটা আপনিই লিখুন!',
    noComments:'এখনো কোনো কমেন্ট নেই। প্রথম কমেন্ট আপনিই করুন!',
    writeComment:'একটি কমেন্ট লিখুন...', writeReply:'উত্তর লিখুন...',
    send:'পাঠান', reply:'উত্তর', edit:'সম্পাদনা', delete:'মুছুন',
    justNow:'এইমাত্র', minAgo:m=>`${m} মিনিট আগে`, hrAgo:h=>`${h} ঘণ্টা আগে`,
    dayAgo:d=>`${d} দিন আগে`,
    confirmDeletePost:'এই উইশটি মুছে ফেলবেন?',
    confirmDeleteComment:'এই কমেন্ট ও এর সব উত্তর মুছে ফেলবেন?',
    wishRequired:'উইশ লিখুন অথবা একটি ছবি দিন', commentRequired:'কমেন্ট লিখুন',
    replyRequired:'উত্তর লিখুন', imageTooBig:'ছবি অনেক বড় — ছোট একটি ছবি দিন',
    postSuccess:'উইশ পোস্ট হয়ে গেছে ✨', postError:'পোস্ট করা যায়নি — আবার চেষ্টা করুন',
    deleted:'মুছে ফেলা হয়েছে 🗑️', deleteError:'মুছে ফেলা যায়নি',
    updated:'আপডেট হয়েছে ✅', updateError:'আপডেট করা যায়নি',
    profileUpdated:'প্রোফাইল আপডেট হয়েছে ✅', profileError:'প্রোফাইল সেভ করা যায়নি',
    linkCopied:'লিংক কপি হয়েছে 🔗', copyPrompt:'এই লিংকটি কপি করুন:',
    showingFrom:'দেখানো হচ্ছে', userWishesOf:' এর উইশগুলো', showAll:'সব দেখান',
    googleSignInError:'Google সাইন ইন ব্যর্থ হয়েছে', welcome:'স্বাগতম',
    signOutConfirm:'সাইন আউট করবেন?', viewProfile:'প্রোফাইল দেখুন →',
    sharedProfile:'শেয়ার করা প্রোফাইল',
    anonDisabled:'Anonymous sign-in Firebase Console-এ চালু করা নেই',
    netErr:'নেটওয়ার্ক সমস্যা', signInFail:'সাইন ইন ব্যর্থ'
  },
  en: {
    shareProfile:'🔗 Share', signInGoogle:'Sign in with Google',
    continueGuest:'Continue as Guest',
    authTitle:'Welcome!', authSubtitle:'Sign in to share your wishes',
    postPlaceholder:'Write your wish... ✨', image:'Image', anonymous:'Anonymous',
    attachProfile:'Attach profile', postWish:'Post Wish', posting:'Posting...',
    myProfile:'My Profile', displayName:'Display name', avatarImage:'Avatar image',
    save:'Save', cancel:'Cancel', signOut:'Sign Out', signInWithGoogle:'Sign in with Google',
    guest:'Guest', anon:'anon', edited:'edited',
    like:'Like', liked:'Liked', comment:'Comment', share:'Share',
    likes:'likes', comments:'comments',
    noPosts:'No wishes yet', noPostsSub:'Be the first to write one!',
    noComments:'No comments yet. Be the first!',
    writeComment:'Write a comment...', writeReply:'Write a reply...',
    send:'Send', reply:'Reply', edit:'Edit', delete:'Delete',
    justNow:'just now', minAgo:m=>`${m}m ago`, hrAgo:h=>`${h}h ago`,
    dayAgo:d=>`${d}d ago`,
    confirmDeletePost:'Delete this wish?',
    confirmDeleteComment:'Delete this comment and all its replies?',
    wishRequired:'Write a wish or add an image', commentRequired:'Write a comment',
    replyRequired:'Write a reply', imageTooBig:'Image too large — pick a smaller one',
    postSuccess:'Wish posted ✨', postError:'Could not post — try again',
    deleted:'Deleted 🗑️', deleteError:'Could not delete',
    updated:'Updated ✅', updateError:'Could not update',
    profileUpdated:'Profile updated ✅', profileError:'Could not save profile',
    linkCopied:'Link copied 🔗', copyPrompt:'Copy this link:',
    showingFrom:'Showing wishes from', userWishesOf:'', showAll:'Show all',
    googleSignInError:'Google sign-in failed', welcome:'Welcome',
    signOutConfirm:'Sign out?', viewProfile:'View profile →',
    sharedProfile:'Shared Profile',
    anonDisabled:'Anonymous sign-in is disabled in Firebase Console',
    netErr:'Network error', signInFail:'Sign-in failed'
  }
};
let lang = localStorage.getItem('wishes-lang') || 'bn';
const t = (k, arg) => {
  const v = I18N[lang][k];
  return typeof v === 'function' ? v(arg) : (v || k);
};
function applyI18n(){
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = t(el.dataset.i18nPlaceholder));
  document.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
  $('langToggle').textContent = lang === 'bn' ? 'EN' : 'বাং';
  $('postBtn').textContent = t('postWish');
}

/* ---------- State ---------- */
let currentUser = null;
let myProfile   = { name:'Guest', photo:'' };
let allPosts    = [];
let selectedFile = null;
let pendingAvatar = null;
let filterUid = new URLSearchParams(location.search).get('user') || null;
let feedUnsub = null;
const openComments = new Set();
const commentsCache = new Map();
const commentUnsubs = new Map();
const drafts = new Map();
const renderedSigs = new Map();

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);
const feed = $('feed');
const wishText = $('wishText');
const imageInput = $('imageInput');
const previewWrap = $('previewWrap');
const previewImg = $('previewImg');
const anonToggle = $('anonToggle');
const profileToggle = $('profileCardToggle');
const postBtn = $('postBtn');
const filterBanner = $('filterBanner');
const toastEl = $('toast');

/* ---------- Helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove('show'), 2600);
}
function timeAgo(ts){
  if (!ts) return t('justNow');
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 45) return t('justNow');
  if (s < 3600) return t('minAgo', Math.floor(s/60));
  if (s < 86400) return t('hrAgo', Math.floor(s/3600));
  if (s < 604800) return t('dayAgo', Math.floor(s/86400));
  return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US');
}
function avatarHTML(name, photo, cls=''){
  if (photo) return `<span class="avatar ${cls}"><img src="${esc(photo)}" alt=""></span>`;
  const ch = (name||'?').trim().charAt(0).toUpperCase() || '?';
  const hue = [...(name||'x')].reduce((a,c)=>a+c.charCodeAt(0),0) % 360;
  return `<span class="avatar ${cls}" style="background:hsl(${hue} 58% 42%)">${esc(ch)}</span>`;
}

async function compressImage(file, maxDim=1100, quality=0.72){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > maxDim || h > maxDim){
          if (w >= h){ h = Math.round(h*maxDim/w); w = maxDim; }
          else       { w = Math.round(w*maxDim/h); h = maxDim; }
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('image load failed'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('file read failed'));
    reader.readAsDataURL(file);
  });
}

/* ---------- AUTH ---------- */
onAuthStateChanged(auth, async (user) => {
  if (user){
    currentUser = user;
    try { await loadProfile(); } catch(e){ console.error(e); }
    showApp();
    if (!feedUnsub) startFeed();
    await buildFilterBanner();
    updateAuthUI();
  } else {
    currentUser = null;
    if (feedUnsub){ feedUnsub(); feedUnsub = null; }
    try {
      await signInAnonymously(auth);
    } catch (e){
      console.error('Auto anonymous sign-in failed:', e);
      showAuthGate();
      updateAuthUI();
      if (e.code === 'auth/operation-not-allowed'){
        toast(t('anonDisabled'));
      } else if (e.code === 'auth/network-request-failed'){
        toast(t('netErr'));
      } else {
        toast(t('signInFail') + ': ' + (e.code || e.message));
      }
    }
  }
});

function showApp(){
  $('authGate').classList.add('hidden');
  $('appMain').classList.remove('hidden');
  $('profileBtn').classList.remove('hidden');
  $('shareProfileBtn').classList.remove('hidden');
}
function showAuthGate(){
  $('authGate').classList.remove('hidden');
  $('appMain').classList.add('hidden');
  $('profileBtn').classList.add('hidden');
  $('shareProfileBtn').classList.add('hidden');
  feed.innerHTML = '';
  renderedSigs.clear();
}
function updateAuthUI(){
  const btn = $('signInGoogle');
  if (!currentUser){ btn.classList.add('hidden'); return; }
  if (currentUser.isAnonymous) btn.classList.remove('hidden');
  else btn.classList.add('hidden');
}

async function doGoogleSignIn(){
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    let result;
    if (currentUser && currentUser.isAnonymous){
      try {
        result = await linkWithPopup(currentUser, provider);
      } catch (e){
        if (e.code === 'auth/credential-already-in-use' ||
            e.code === 'auth/email-already-in-use'){
          result = await signInWithPopup(auth, provider);
        } else if (e.code === 'auth/popup-closed-by-user' ||
                   e.code === 'auth/cancelled-popup-request'){
          return;
        } else throw e;
      }
    } else {
      result = await signInWithPopup(auth, provider);
    }
    const u = result.user;
    const snap = await getDoc(doc(db, 'users', u.uid));
    const existingName = snap.exists() ? (snap.data().name || '') : '';
    if (!existingName || existingName.startsWith('Guest')){
      await setDoc(doc(db, 'users', u.uid), {
        name: u.displayName || 'User',
        photo: u.photoURL || '',
        email: u.email || '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      await loadProfile();
    }
    toast(t('welcome') + ' ' + (u.displayName || ''));
  } catch (err){
    console.error('Google sign-in error:', err);
    if (err.code === 'auth/popup-blocked') toast('Popup blocked — allow popups');
    else if (err.code === 'auth/unauthorized-domain') toast('Domain not authorized');
    else toast(t('googleSignInError'));
  }
}
$('googleSignInBtn').addEventListener('click', doGoogleSignIn);
$('signInGoogle').addEventListener('click', doGoogleSignIn);
$('guestSignInBtn').addEventListener('click', async () => {
  try { await signInAnonymously(auth); }
  catch (e){
    console.error('guest sign-in:', e);
    if (e.code === 'auth/operation-not-allowed') toast(t('anonDisabled'));
    else toast(t('signInFail') + ': ' + (e.code || e.message));
  }
});
$('signOutBtn').addEventListener('click', async () => {
  if (!confirm(t('signOutConfirm'))) return;
  try {
    await signOut(auth);
    $('modalBackdrop').classList.add('hidden');
  } catch(e){ console.error(e); }
});

/* ---------- PROFILE ---------- */
async function loadProfile(){
  try {
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    if (snap.exists()){
      const d = snap.data();
      myProfile = { name: d.name || 'Guest', photo: d.photo || '' };
    } else {
      myProfile = { name: 'Guest-' + currentUser.uid.slice(0,4).toUpperCase(), photo: '' };
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...myProfile, createdAt: serverTimestamp()
      });
    }
  } catch (e){
    console.error('loadProfile:', e);
    myProfile = { name:'Guest', photo:'' };
  }
  renderMyChip();
}
function renderMyChip(){
  $('myAvatarWrap').innerHTML = avatarHTML(myProfile.name, myProfile.photo, 'sm');
  $('myName').textContent = myProfile.name;
}

$('profileBtn').addEventListener('click', () => {
  pendingAvatar = null;
  $('nameInput').value = myProfile.name;
  $('avatarInput').value = '';
  $('modalAvatar').innerHTML = avatarHTML(myProfile.name, myProfile.photo);
  if (currentUser && !currentUser.isAnonymous) $('signOutBtn').classList.remove('hidden');
  else $('signOutBtn').classList.add('hidden');
  $('modalBackdrop').classList.remove('hidden');
});
$('closeModal').addEventListener('click', () => $('modalBackdrop').classList.add('hidden'));
$('modalBackdrop').addEventListener('click', e => {
  if (e.target.id === 'modalBackdrop') $('modalBackdrop').classList.add('hidden');
});
$('avatarInput').addEventListener('change', () => {
  const f = $('avatarInput').files[0];
  if (!f) return;
  if (f.size > 5*1024*1024){ toast(t('imageTooBig')); $('avatarInput').value=''; return; }
  pendingAvatar = f;
  $('modalAvatar').innerHTML = `<span class="avatar"><img src="${URL.createObjectURL(f)}" alt=""></span>`;
});
$('saveProfile').addEventListener('click', async () => {
  const name = $('nameInput').value.trim() || myProfile.name;
  const btn = $('saveProfile');
  btn.disabled = true; btn.textContent = '...';
  try {
    let photo = myProfile.photo;
    if (pendingAvatar) photo = await compressImage(pendingAvatar, 320, 0.82);
    await setDoc(doc(db, 'users', currentUser.uid),
      { name, photo, updatedAt: serverTimestamp() }, { merge: true });
    myProfile = { name, photo };
    renderMyChip();
    $('modalBackdrop').classList.add('hidden');
    toast(t('profileUpdated'));
  } catch (e){
    console.error('saveProfile:', e);
    toast(t('profileError'));
  } finally {
    btn.disabled = false; btn.textContent = t('save');
  }
});
$('shareProfileBtn').addEventListener('click', async () => {
  if (!currentUser) return;
  const url = `${location.origin}${location.pathname}?user=${currentUser.uid}`;
  try { await navigator.clipboard.writeText(url); toast(t('linkCopied')); }
  catch { prompt(t('copyPrompt'), url); }
});

/* ---------- Language toggle ---------- */
$('langToggle').addEventListener('click', () => {
  lang = lang === 'bn' ? 'en' : 'bn';
  localStorage.setItem('wishes-lang', lang);
  applyI18n();
  renderedSigs.clear();
  feed.innerHTML = '';
  renderFeed();
  buildFilterBanner();
});

/* ---------- Filter banner ---------- */
async function buildFilterBanner(){
  if (!filterUid){ filterBanner.classList.add('hidden'); return; }
  let name = '...';
  try {
    const s = await getDoc(doc(db, 'users', filterUid));
    if (s.exists()) name = s.data().name || name;
  } catch {}
  filterBanner.innerHTML = `
    <span>🔎 ${esc(t('showingFrom'))} <b>${esc(name)}</b>${esc(t('userWishesOf'))}</span>
    <div class="spacer"></div>
    <button class="btn ghost small" id="clearFilter">${esc(t('showAll'))}</button>`;
  filterBanner.classList.remove('hidden');
  $('clearFilter').addEventListener('click', () => {
    filterUid = null;
    history.replaceState(null, '', location.pathname);
    filterBanner.classList.add('hidden');
    renderedSigs.clear();
    feed.innerHTML = '';
    renderFeed();
  });
}

/* ---------- FEED ---------- */
function startFeed(){
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  feedUnsub = onSnapshot(q, snap => {
    allPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderFeed();
  }, err => {
    console.error('feed error:', err);
    feed.innerHTML = `<div class="empty"><span class="big">⚠️</span>
      <span>Firestore load failed — rules check করুন।</span></div>`;
  });
}

function renderFeed(){
  const posts = filterUid ? allPosts.filter(p => p.uid === filterUid) : allPosts;

  if (!posts.length){
    renderedSigs.clear();
    feed.innerHTML = `<div class="empty"><span class="big">🌠</span>
      <b>${esc(t('noPosts'))}</b><br>
      <span class="small">${esc(t('noPostsSub'))}</span></div>`;
    return;
  }
  if (feed.querySelector('.empty')) feed.innerHTML = '';

  const seen = new Set();
  posts.forEach(p => {
    seen.add(p.id);
    const liked = currentUser ? (p.likes || []).includes(currentUser.uid) : false;
    const sig = JSON.stringify([
      lang, p.text, p.imageUrl, p.likeCount || 0, liked,
      p.commentCount || 0, p.editedAt, p.showProfile,
      p.authorName, p.authorPhoto, p.anonymous, p.createdAt
    ]);
    const existing = feed.querySelector(`.post[data-id="${p.id}"]`);
    if (existing && renderedSigs.get(p.id) === sig) return;

    const tmp = document.createElement('div');
    tmp.innerHTML = renderPost(p);
    const el = tmp.firstElementChild;
    if (existing) existing.replaceWith(el);
    else feed.appendChild(el);
    renderedSigs.set(p.id, sig);
  });

  [...feed.querySelectorAll('.post')].forEach(el => {
    if (!seen.has(el.dataset.id)){ el.remove(); renderedSigs.delete(el.dataset.id); }
  });
  posts.forEach(p => {
    const el = feed.querySelector(`.post[data-id="${p.id}"]`);
    if (el) feed.appendChild(el);
  });
  openComments.forEach(id => renderCommentsFor(id));
}

function renderPost(p){
  const mine = p.uid === currentUser?.uid;
  const likes = p.likes || [];
  const liked = currentUser ? likes.includes(currentUser.uid) : false;
  const likeCount = Math.max(0, likes.length);
  const commentCount = Math.max(0, p.commentCount || 0);
  const name = p.anonymous ? t('guest') : (p.authorName || t('guest'));
  const photo = p.anonymous ? '' : (p.authorPhoto || '');
  const displayName = p.anonymous ? t('anon') : name;

  return `
  <article class="post card" data-id="${p.id}">
    <div class="post-head">
      ${avatarHTML(p.anonymous ? '?' : name, photo)}
      <div class="post-meta">
        <div class="post-name">${esc(displayName)}${p.anonymous ? ` <span class="tag">${esc(t('anon'))}</span>` : ''}</div>
        <div class="post-time">${timeAgo(p.createdAt)}${p.editedAt ? ' · ' + esc(t('edited')) : ''}</div>
      </div>
      ${mine ? `<div>
        <button class="icon-btn" data-act="edit-post" title="${esc(t('edit'))}">✏️</button>
        <button class="icon-btn" data-act="delete-post" title="${esc(t('delete'))}">🗑️</button>
      </div>` : ''}
    </div>
    ${p.text ? `<div class="post-body">${esc(p.text)}</div>` : ''}
    ${p.imageUrl ? `<div class="post-image"><img src="${esc(p.imageUrl)}" loading="lazy" alt=""></div>` : ''}
    ${(p.showProfile && !p.anonymous) ? `
      <div class="profile-card">
        <div class="pc-label">${esc(t('sharedProfile'))}</div>
        <div class="pc-row">
          ${avatarHTML(name, photo)}
          <div>
            <div class="pc-name">${esc(name)}</div>
            <a class="pc-link" href="?user=${esc(p.uid)}">${esc(t('viewProfile'))}</a>
          </div>
        </div>
      </div>` : ''}
    <div class="post-stats">
      <span>❤️ ${likeCount} ${esc(t('likes'))}</span>
      <span>💬 ${commentCount} ${esc(t('comments'))}</span>
    </div>
    <div class="post-actions">
      <button class="act ${liked ? 'liked' : ''}" data-act="like">
        ${liked ? '❤️' : '🤍'} ${esc(liked ? t('liked') : t('like'))}
      </button>
      <button class="act" data-act="toggle-comments">💬 ${esc(t('comment'))}</button>
      <button class="act" data-act="share">🔗 ${esc(t('share'))}</button>
    </div>
    <div class="comments" id="comments-${p.id}" ${openComments.has(p.id) ? '' : 'hidden'}></div>
  </article>`;
}

/* ---------- COMMENTS ---------- */
function subscribeComments(postId){
  if (commentUnsubs.has(postId)) return;
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  const unsub = onSnapshot(q, snap => {
    commentsCache.set(postId, snap.docs.map(d => ({ id: d.id, ...d.data() })));
    renderCommentsFor(postId);
    const box = document.getElementById('comments-' + postId);
    if (box){
      const postEl = box.closest('.post');
      const stats = postEl?.querySelector('.post-stats span:nth-child(2)');
      if (stats) stats.textContent = `💬 ${snap.size} ${t('comments')}`;
    }
  }, err => console.error('comments:', err));
  commentUnsubs.set(postId, unsub);
}

function renderCommentsFor(postId){
  const container = document.getElementById('comments-' + postId);
  if (!container) return;

  const list = commentsCache.get(postId) || [];
  const byParent = new Map();
  list.forEach(c => {
    const k = c.parentId || 'root';
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k).push(c);
  });

  const buildTree = key => {
    const kids = byParent.get(key) || [];
    if (!kids.length) return '';
    return `<div class="c-children">${kids.map(c => renderComment(c, byParent)).join('')}</div>`;
  };

  container.innerHTML = `
    <div class="comment-form">
      <textarea class="comment-input" data-key="${postId}:root" rows="1"
        placeholder="${esc(t('writeComment'))}"></textarea>
      <button class="btn small primary" data-act="add-comment">${esc(t('send'))}</button>
    </div>
    ${buildTree('root') || `<p class="muted small" style="margin:0">${esc(t('noComments'))}</p>`}`;

  container.querySelectorAll('.comment-input').forEach(tx => {
    const v = drafts.get(tx.dataset.key);
    if (v) tx.value = v;
  });
}

function renderComment(c, byParent){
  const mine = c.uid === currentUser?.uid;
  const name = c.anonymous ? t('guest') : (c.authorName || t('guest'));
  const photo = c.anonymous ? '' : (c.authorPhoto || '');
  const displayName = c.anonymous ? t('anon') : name;
  const kids = byParent.get(c.id) || [];

  return `
  <div class="comment" data-comment-id="${c.id}">
    <div class="c-head">
      ${avatarHTML(c.anonymous ? '?' : name, photo, 'sm')}
      <span class="c-name">${esc(displayName)}</span>
      <span class="c-time">${timeAgo(c.createdAt)}${c.editedAt ? ' · ' + esc(t('edited')) : ''}</span>
    </div>
    <div class="c-body">${esc(c.text)}</div>
    <div class="c-actions">
      <button data-act="reply-comment">${esc(t('reply'))}</button>
      ${mine ? `<button data-act="edit-comment">${esc(t('edit'))}</button>
                <button data-act="delete-comment">${esc(t('delete'))}</button>` : ''}
    </div>
    <div class="c-reply hidden" data-open="0"></div>
    ${kids.length ? `<div class="c-children">${kids.map(k => renderComment(k, byParent)).join('')}</div>` : ''}
  </div>`;
}

/* ---------- ATOMIC operations ---------- */
async function toggleLike(postId){
  if (!currentUser) return;
  const ref = doc(db, 'posts', postId);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const likes = snap.data().likes || [];
      const uid = currentUser.uid;
      const idx = likes.indexOf(uid);
      const newLikes = idx >= 0
        ? likes.filter(x => x !== uid)
        : [...likes, uid];
      tx.update(ref, { likes: newLikes, likeCount: newLikes.length });
    });
  } catch (e){
    console.error('toggleLike:', e);
    toast(t('updateError'));
  }
}

async function addCommentAtomic(postId, parentId, text){
  if (!currentUser) return;
  const anon = anonToggle.checked;
  const postRef = doc(db, 'posts', postId);
  const commentRef = doc(collection(db, 'posts', postId, 'comments'));
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(postRef);
      if (!snap.exists()) throw new Error('post gone');
      const count = snap.data().commentCount || 0;
      tx.set(commentRef, {
        uid: currentUser.uid,
        authorName: anon ? 'Anonymous' : myProfile.name,
        authorPhoto: anon ? '' : myProfile.photo,
        anonymous: anon,
        text,
        parentId: parentId || null,
        createdAt: serverTimestamp(),
        editedAt: null
      });
      tx.update(postRef, { commentCount: count + 1 });
    });
  } catch (e){
    console.error('addComment:', e);
    toast(t('postError'));
  }
}

async function deleteCommentTreeAtomic(postId, rootId){
  const postRef = doc(db, 'posts', postId);
  const commentsCol = collection(db, 'posts', postId, 'comments');
  try {
    const snap = await getDocs(commentsCol);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const toDelete = new Set([rootId]);
    let changed = true;
    while (changed){
      changed = false;
      all.forEach(c => {
        if (c.parentId && toDelete.has(c.parentId) && !toDelete.has(c.id)){
          toDelete.add(c.id);
          changed = true;
        }
      });
    }
    await runTransaction(db, async (tx) => {
      const postSnap = await tx.get(postRef);
      if (!postSnap.exists()) return;
      const count = postSnap.data().commentCount || 0;
      toDelete.forEach(id => tx.delete(doc(db, 'posts', postId, 'comments', id)));
      tx.update(postRef, { commentCount: Math.max(0, count - toDelete.size) });
    });
    toast(t('deleted'));
  } catch (e){
    console.error('deleteComment:', e);
    toast(t('deleteError'));
  }
}

/* ---------- COMPOSER ---------- */
imageInput.addEventListener('change', () => {
  const f = imageInput.files[0];
  if (!f) return;
  if (f.size > 8*1024*1024){ toast(t('imageTooBig')); imageInput.value = ''; return; }
  selectedFile = f;
  previewImg.src = URL.createObjectURL(f);
  previewWrap.classList.remove('hidden');
});
$('removeImg').addEventListener('click', () => {
  selectedFile = null; imageInput.value = ''; previewImg.src = '';
  previewWrap.classList.add('hidden');
});
anonToggle.addEventListener('change', () => {
  if (anonToggle.checked){ profileToggle.checked = false; profileToggle.disabled = true; }
  else profileToggle.disabled = false;
});

postBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  const text = wishText.value.trim();
  if (!text && !selectedFile){ toast(t('wishRequired')); return; }

  postBtn.disabled = true; postBtn.textContent = t('posting');
  try {
    let imageUrl = '';
    if (selectedFile){
      imageUrl = await compressImage(selectedFile, 1100, 0.72);
      if (imageUrl.length > 950000){
        toast(t('imageTooBig'));
        return;
      }
    }
    const anon = anonToggle.checked;
    await addDoc(collection(db, 'posts'), {
      uid: currentUser.uid,
      authorName: anon ? 'Anonymous' : myProfile.name,
      authorPhoto: anon ? '' : myProfile.photo,
      anonymous: anon,
      showProfile: anon ? false : profileToggle.checked,
      text, imageUrl,
      likes: [], likeCount: 0, commentCount: 0,
      createdAt: serverTimestamp(), editedAt: null
    });
    wishText.value = ''; selectedFile = null; imageInput.value = '';
    previewImg.src = ''; previewWrap.classList.add('hidden');
    anonToggle.checked = false; profileToggle.checked = false; profileToggle.disabled = false;
    toast(t('postSuccess'));
  } catch (e){
    console.error('post error:', e);
    toast(t('postError'));
  } finally {
    postBtn.disabled = false; postBtn.textContent = t('postWish');
  }
});

/* ---------- FEED interactions ---------- */
feed.addEventListener('input', e => {
  if (e.target.classList.contains('comment-input')){
    drafts.set(e.target.dataset.key, e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
  }
});

feed.addEventListener('click', async e => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  const postEl = btn.closest('.post');
  if (!postEl) return;
  const postId = postEl.dataset.id;
  const post = allPosts.find(p => p.id === postId);
  if (!post) return;

  if (act === 'like'){ await toggleLike(postId); return; }

  if (act === 'share'){
    const url = `${location.origin}${location.pathname}?post=${postId}`;
    try { await navigator.clipboard.writeText(url); toast(t('linkCopied')); }
    catch { prompt(t('copyPrompt'), url); }
    return;
  }

  if (act === 'toggle-comments'){
    const box = document.getElementById('comments-' + postId);
    if (openComments.has(postId)){
      openComments.delete(postId);
      box.hidden = true;
    } else {
      openComments.add(postId);
      box.hidden = false;
      subscribeComments(postId);
      renderCommentsFor(postId);
    }
    return;
  }

  if (act === 'edit-post'){
    if (postEl.querySelector('.edit-box')) return;
    const bodyEl = postEl.querySelector('.post-body');
    const box = document.createElement('div');
    box.className = 'edit-box';
    box.innerHTML = `
      <textarea rows="3" maxlength="1000"></textarea>
      <div class="row end">
        <button class="btn small ghost" data-act="cancel-edit">${esc(t('cancel'))}</button>
        <button class="btn small primary" data-act="save-post">${esc(t('save'))}</button>
      </div>`;
    box.querySelector('textarea').value = post.text || '';
    if (bodyEl) bodyEl.replaceWith(box);
    else postEl.querySelector('.post-head').after(box);
    box.querySelector('textarea').focus();
    return;
  }

  if (act === 'save-post'){
    const val = postEl.querySelector('.edit-box textarea').value.trim();
    if (!val){ toast(t('wishRequired')); return; }
    try {
      await updateDoc(doc(db, 'posts', postId), { text: val, editedAt: serverTimestamp() });
      toast(t('updated'));
    } catch (err){ console.error(err); toast(t('updateError')); }
    return;
  }

  if (act === 'cancel-edit'){ renderedSigs.delete(postId); renderFeed(); return; }

  if (act === 'delete-post'){
    if (!confirm(t('confirmDeletePost'))) return;
    try {
      const cs = await getDocs(collection(db, 'posts', postId, 'comments'));
      await Promise.all(cs.docs.map(d => deleteDoc(d.ref)));
      await deleteDoc(doc(db, 'posts', postId));
      if (commentUnsubs.has(postId)){
        commentUnsubs.get(postId)(); commentUnsubs.delete(postId); commentsCache.delete(postId);
      }
      openComments.delete(postId); renderedSigs.delete(postId);
      toast(t('deleted'));
    } catch (err){ console.error(err); toast(t('deleteError')); }
    return;
  }

  if (act === 'add-comment'){
    const ta = postEl.querySelector('.comment-form .comment-input');
    const val = ta.value.trim();
    if (!val){ toast(t('commentRequired')); return; }
    ta.value = '';
    drafts.delete(`${postId}:root`);
    await addCommentAtomic(postId, null, val);
    return;
  }

  if (act === 'reply-comment'){
    const cEl = btn.closest('.comment');
    const box = cEl.querySelector(':scope > .c-reply');
    if (box.dataset.open === '1'){
      box.classList.add('hidden'); box.dataset.open = '0'; return;
    }
    box.dataset.open = '1'; box.classList.remove('hidden');
    const cid = cEl.dataset.commentId;
    box.innerHTML = `
      <textarea class="comment-input" data-key="${postId}:${cid}" data-reply="1" rows="2"
        placeholder="${esc(t('writeReply'))}"></textarea>
      <div class="row end">
        <button class="btn small ghost" data-act="cancel-reply">${esc(t('cancel'))}</button>
        <button class="btn small primary" data-act="send-reply" data-parent="${cid}">${esc(t('send'))}</button>
      </div>`;
    const ta = box.querySelector('textarea');
    ta.value = drafts.get(`${postId}:${cid}`) || '';
    ta.focus();
    return;
  }

  if (act === 'cancel-reply'){
    const cEl = btn.closest('.comment');
    const box = cEl.querySelector(':scope > .c-reply');
    box.classList.add('hidden'); box.dataset.open = '0'; box.innerHTML = '';
    return;
  }

  if (act === 'send-reply'){
    const parentId = btn.dataset.parent;
    const cEl = btn.closest('.comment');
    const ta = cEl.querySelector(':scope > .c-reply textarea');
    const val = ta.value.trim();
    if (!val){ toast(t('replyRequired')); return; }
    ta.value = ''; drafts.delete(`${postId}:${parentId}`);
    await addCommentAtomic(postId, parentId, val);
    return;
  }

  if (act === 'edit-comment'){
    const cEl = btn.closest('.comment');
    const body = cEl.querySelector(':scope > .c-body');
    if (cEl.querySelector(':scope > .c-edit')) return;
    const box = document.createElement('div');
    box.className = 'c-edit';
    box.style.margin = '6px 0 0 34px';
    box.innerHTML = `
      <textarea class="comment-input" rows="2"></textarea>
      <div class="row end">
        <button class="btn small ghost" data-act="cancel-comment-edit">${esc(t('cancel'))}</button>
        <button class="btn small primary" data-act="save-comment">${esc(t('save'))}</button>
      </div>`;
    box.querySelector('textarea').value = body.textContent;
    body.replaceWith(box);
    box.querySelector('textarea').focus();
    return;
  }

  if (act === 'save-comment'){
    const cEl = btn.closest('.comment');
    const cid = cEl.dataset.commentId;
    const val = cEl.querySelector('.c-edit textarea').value.trim();
    if (!val){ toast(t('commentRequired')); return; }
    try {
      await updateDoc(doc(db, 'posts', postId, 'comments', cid),
        { text: val, editedAt: serverTimestamp() });
      toast(t('updated'));
    } catch (err){ console.error(err); toast(t('updateError')); }
    return;
  }

  if (act === 'cancel-comment-edit'){ renderCommentsFor(postId); return; }

  if (act === 'delete-comment'){
    if (!confirm(t('confirmDeleteComment'))) return;
    const cid = btn.closest('.comment').dataset.commentId;
    await deleteCommentTreeAtomic(postId, cid);
    return;
  }
});

/* ---------- Boot ---------- */
applyI18n();