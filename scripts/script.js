// Переменные
const heart = document.getElementById('heart');
const container = document.querySelector('.heart-container');
const message = document.getElementById('message');
const toggle = document.getElementById('themeToggle');
const music1 = document.getElementById('music1');
const music2 = document.getElementById('music2');

let emojiInterval;
let activeMusic = music1;
let audioContext;
let gainNode;

// Инициализация при загрузке страницы
function init() {
    setupAudio();
    restoreState();
    setupEventListeners();
}

// Настройка аудио системы
function setupAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    
    // Подключаем оба аудио элемента
    [music1, music2].forEach(music => {
        const source = audioContext.createMediaElementSource(music);
        source.connect(gainNode);
    });
    
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0;
}

// Восстановление сохраненного состояния
function restoreState() {
    // Восстанавливаем тему
    const isDark = localStorage.getItem('theme') === 'dark';
    toggle.checked = isDark;
    updateTheme(isDark);
    
    // Восстанавливаем состояние сердца
    const heartOpen = localStorage.getItem('heartOpen') === 'true';
    if (heartOpen) {
        container.classList.add('open');
        createFlowers();
        emojiInterval = setInterval(createEmojis, 200);
    }
    
    // Восстанавливаем музыку
    const currentMusic = isDark ? music2 : music1;
    switchMusic(currentMusic, false);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчик первого клика для активации аудио
    document.body.addEventListener('click', initAudio, { once: true });
    
    // Основные обработчики
    heart.addEventListener('click', handleHeartClick);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    toggle.addEventListener('change', handleThemeChange);
}

// Активация аудио по первому клику
function initAudio() {
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            if (container.classList.contains('open') && activeMusic.paused) {
                activeMusic.play().catch(console.error);
            }
        });
    }
}

// Обработчики событий
function handleHeartClick(e) {
    e.stopPropagation();
    openHeart();
}

function handleDocumentClick(e) {
    if (container.classList.contains('open') && 
        !heart.contains(e.target) && 
        !message.contains(e.target)) {
        closeHeart();
    }
}

function handleKeyDown(e) {
    if (e.key === 'Escape') closeHeart();
}

function handleThemeChange(e) {
    const isDark = e.target.checked;
    updateTheme(isDark);
    switchMusic(isDark ? music2 : music1);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Управление темой
function updateTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    heart.classList.toggle('dark', isDark);
    
    // Обновляем цвет эмодзи
    document.querySelectorAll('.emoji').forEach(emoji => {
        emoji.style.color = isDark ? '#990000' : '#ff5b5b';
    });
}

// Управление сердцем
function openHeart() {
    if (container.classList.contains('open')) return;
    
    container.classList.add('open');
    localStorage.setItem('heartOpen', 'true');
    
    createFlowers();
    emojiInterval = setInterval(createEmojis, 200);
    
    // Плавный запуск музыки
    audioContext.resume().then(() => {
        activeMusic.play().catch(console.error);
        gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 1);
    });
}

function closeHeart() {
    if (!container.classList.contains('open')) return;
    
    container.classList.remove('open');
    localStorage.setItem('heartOpen', 'false');
    clearInterval(emojiInterval);
    
    // Плавная остановка музыки
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
    setTimeout(() => {
        activeMusic.pause();
        activeMusic.currentTime = 0;
    }, 1000);
}

// Управление музыкой
function switchMusic(newMusic, withTransition = true) {
    if (activeMusic === newMusic) return;
    
    const wasPlaying = !activeMusic.paused;
    
    if (withTransition) {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        
        setTimeout(() => {
            performMusicSwitch(newMusic, wasPlaying);
        }, 1000);
    } else {
        performMusicSwitch(newMusic, wasPlaying);
    }
}

function performMusicSwitch(newMusic, wasPlaying) {
    activeMusic.pause();
    activeMusic.currentTime = 0;
    activeMusic = newMusic;
    
    if (wasPlaying || container.classList.contains('open')) {
        audioContext.resume().then(() => {
            activeMusic.play().catch(console.error);
            gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 1);
        });
    }
}

// Анимации
function createEmojis() {
    const emoji = document.createElement('div');
    emoji.className = 'emoji';
    emoji.textContent = getRandomEmoji();
    emoji.style.left = `${Math.random() * 100}vw`;
    emoji.style.animationDuration = `${Math.random() * 3 + 2}s`;
    emoji.style.fontSize = `${Math.random() * 2 + 1}rem`;
    emoji.style.color = document.body.classList.contains('dark') ? '#990000' : '#ff5b5b';
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 5000);
}

function getRandomEmoji() {
    const emojis = ['😘', '💋', '❤️', '💕', '💞', '💖', '💘', '💐', '🌷', '🌹', '🌸', '🌺'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

function createFlowers() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const flower = document.createElement('div');
            flower.classList.add('flower');
            flower.style.left = `${Math.random() * 100}vw`;
            flower.style.animationDuration = `${Math.random() * 3 + 2}s`;
            document.body.appendChild(flower);
            setTimeout(() => flower.remove(), 5000);
        }, i * 200);
    }
}

// Запуск приложения
init();