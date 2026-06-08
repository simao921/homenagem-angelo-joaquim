let ytPlayer = null;
let hasUserEntered = false;
let musicDurationTimeout = null;

// Global callback for YouTube Iframe API
window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player('youtube-player-container', {
    height: '200',
    width: '200',
    videoId: 'tgXlw5tiFR0',
    playerVars: {
      'playsinline': 1,
      'controls': 0,
      'disablekb': 1,
      'fs': 0,
      'rel': 0,
      'start': 56
    },
    events: {
      'onReady': () => {
        const btnEnterSite = document.getElementById('btn-enter-site');
        const spinner = document.getElementById('loading-spinner');
        const btnText = document.getElementById('btn-text');
        if (btnEnterSite) {
          btnEnterSite.disabled = false;
          btnEnterSite.style.opacity = '1';
          btnEnterSite.style.cursor = 'pointer';
          if (spinner) spinner.className = 'fa-solid fa-heart';
          if (btnText) btnText.innerText = 'Entrar e Recordar';
        }
        if (hasUserEntered) startMusic();
      },
      'onError': (e) => {
        console.error("YouTube Player Error", e);
        const btnEnterSite = document.getElementById('btn-enter-site');
        const spinner = document.getElementById('loading-spinner');
        const btnText = document.getElementById('btn-text');
        if (btnEnterSite) {
          btnEnterSite.disabled = false;
          btnEnterSite.style.opacity = '1';
          btnEnterSite.style.cursor = 'pointer';
          if (spinner) spinner.className = 'fa-solid fa-triangle-exclamation';
          if (btnText) btnText.innerText = 'Entrar (Sem Música)';
        }
      }
    }
  });
};

function startMusic() {
  if (ytPlayer && ytPlayer.playVideo) {
    ytPlayer.playVideo();
    
    const visualizer = document.getElementById('visualizer');
    const widgetPlayBtn = document.getElementById('widget-play-btn');
    if (visualizer) visualizer.classList.add('active');
    if (widgetPlayBtn) widgetPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    
    musicDurationTimeout = setTimeout(() => {
      ytPlayer.pauseVideo();
      if (visualizer) visualizer.classList.remove('active');
      if (widgetPlayBtn) widgetPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      showMusicFinishedToast();
    }, 60000);
  }
}

function showMusicFinishedToast() {
  const toast = document.createElement('div');
  toast.className = 'music-toast';
  toast.innerHTML = '<i class="fa-solid fa-circle-info"></i> Música concluída (limite de 1 min)';
  document.body.appendChild(toast);
  
  // Add active class for sliding/fade-in
  setTimeout(() => toast.classList.add('active'), 100);
  
  // Remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Spotify Player Widget Controls & Autoplay Logic
  const spotifyWidget = document.getElementById('spotify-widget');
  const spotifyToggleBtn = document.getElementById('spotify-toggle-btn');
  const closeWidgetBtn = document.getElementById('close-widget-btn');
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const btnEnterSite = document.getElementById('btn-enter-site');



  const widgetPlayBtn = document.getElementById('widget-play-btn');
  if (widgetPlayBtn) {
    widgetPlayBtn.addEventListener('click', () => {
      if (ytPlayer && ytPlayer.getPlayerState) {
        const state = ytPlayer.getPlayerState();
        const visualizer = document.getElementById('visualizer');
        if (state === YT.PlayerState.PLAYING) {
          ytPlayer.pauseVideo();
          widgetPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
          if (visualizer) visualizer.classList.remove('active');
        } else {
          ytPlayer.playVideo();
          widgetPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
          if (visualizer) visualizer.classList.add('active');
        }
      }
    });
  }

  // Handle welcome overlay entry
  if (btnEnterSite && welcomeOverlay) {
    btnEnterSite.addEventListener('click', () => {
      hasUserEntered = true;
      welcomeOverlay.classList.add('fade-out');
      
      setTimeout(() => {
        welcomeOverlay.style.display = 'none';
      }, 800);

      startMusic();
    });
  }

  if (spotifyWidget && spotifyToggleBtn && closeWidgetBtn) {
    // Show/restore widget from header button
    spotifyToggleBtn.addEventListener('click', () => {
      spotifyWidget.classList.toggle('minimized');
      // If it was minimized, bounce/focus it
      if (!spotifyWidget.classList.contains('minimized')) {
        spotifyWidget.style.transform = 'scale(1.05)';
        setTimeout(() => {
          spotifyWidget.style.transform = '';
        }, 200);
      }
    });

    // Minimize widget using the down chevron
    closeWidgetBtn.addEventListener('click', () => {
      spotifyWidget.classList.add('minimized');
    });
  }



  // 3. Supabase Memory Wall / Mural de Lembranças
  const SUPABASE_URL = 'https://wkkpcsdqcibggjxwpmne.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_yJZ3sb38tDvGye8mrIFcKQ_V5RK8PJi';
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const muralWall = document.getElementById('mural-wall');
  const messageForm = document.getElementById('message-form');

  // Create HTML for a single message card
  function createMessageCard(message) {
    const card = document.createElement('div');
    card.className = 'message-card';
    
    // Get user initials for avatar
    const initials = message.name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    card.innerHTML = `
      <div class="message-header">
        <div class="message-author-info">
          <div class="message-avatar">${initials}</div>
          <div>
            <div class="message-author">${escapeHTML(message.name)}</div>
            <div class="message-relationship">${escapeHTML(message.relationship)}</div>
          </div>
        </div>
        <div class="message-date">${message.date}</div>
      </div>
      <p class="message-text">${escapeHTML(message.text)}</p>
    `;
    return card;
  }

  // Helper to escape HTML tags
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Load messages from Supabase
  async function loadMessages() {
    if (!muralWall) return;
    
    muralWall.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> A carregar mensagens...</div>';
    
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
      
    muralWall.innerHTML = '';
    
    if (error) {
      console.error('Error fetching messages:', error);
      muralWall.innerHTML = '<p style="text-align:center; color:red;">Erro ao carregar o mural. Verifique se configurou a base de dados.</p>';
      return;
    }
    
    if (data && data.length > 0) {
      data.forEach(msg => {
        const card = createMessageCard(msg);
        muralWall.appendChild(card);
      });
    } else {
      muralWall.innerHTML = '<p style="text-align:center; opacity:0.7;">Ainda não há mensagens. Seja o primeiro a deixar uma lembrança!</p>';
    }
  }

  // Handle Form Submission
  if (messageForm) {
    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('btn-submit-message');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> &nbsp;A enviar...';
      submitBtn.disabled = true;

      const nameInput = document.getElementById('form-name');
      const relationInput = document.getElementById('form-relationship');
      const messageInput = document.getElementById('form-message');

      if (!nameInput.value.trim() || !messageInput.value.trim()) {
        alert("Por favor, preencha o seu nome e a sua mensagem.");
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
        return;
      }

      const currentDate = new Date();
      const options = { day: '2-digit', month: 'long', year: 'numeric' };
      const formattedDate = currentDate.toLocaleDateString('pt-PT', options);

      const newMessage = {
        name: nameInput.value.trim(),
        relationship: relationInput.value.trim() || "Aluno/Amigo",
        date: formattedDate,
        text: messageInput.value.trim()
      };

      // Save to Supabase
      const { error } = await supabaseClient
        .from('messages')
        .insert([newMessage]);
        
      if (error) {
        console.error('Error inserting message:', error);
        alert('Houve um erro ao guardar a sua mensagem na base de dados. Tente novamente.');
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
        return;
      }
      
      // Render at the top with animation
      const card = createMessageCard(newMessage);
      muralWall.insertBefore(card, muralWall.firstChild);
      
      // Remove empty state message if it exists
      const emptyState = muralWall.querySelector('p');
      if (emptyState && emptyState.textContent.includes('Ainda não há mensagens')) {
          emptyState.remove();
      }
      
      // Scroll to the top of the wall smoothly
      muralWall.scrollTo({ top: 0, behavior: 'smooth' });

      // Reset form
      messageForm.reset();
      
      submitBtn.innerHTML = originalBtnHtml;
      submitBtn.disabled = false;
    });
  }

  // Initial render
  loadMessages();


  // 4. Lightbox Modal
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-title').textContent;
      const desc = item.querySelector('.gallery-desc').textContent;

      lightboxImg.src = img.src;
      lightboxCaption.textContent = `${title} — ${desc}`;
      lightbox.classList.add('active');
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(() => {
      lightboxImg.src = '';
      lightboxCaption.textContent = '';
    }, 300);
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
});
