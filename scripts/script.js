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

// Инициализация
function init() {
    setupAudio();
    updateTheme(false);
}

// Настройка аудио
function setupAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    connectAudio(music1);
    connectAudio(music2);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0;
}

function connectAudio(music) {
    const source = audioContext.createMediaElementSource(music);
    source.connect(gainNode);
}

// Обновление темы
function updateTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    heart.classList.toggle('dark', isDark);
    
    // Обновление цвета смайликов
    document.querySelectorAll('.emoji').forEach(emoji => {
        emoji.style.color = isDark ? '#990000' : '#ff5b5b';
    });
}

// Плавное переключение музыки
function switchMusic(newMusic) {
    if (activeMusic === newMusic) return;

    // Плавное выключение старой музыки
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
    setTimeout(() => {
        activeMusic.pause();
        activeMusic.currentTime = 0;
        activeMusic = newMusic;
        
        // Плавное включение новой музыки
        if (container.classList.contains('open')) {
            activeMusic.play();
            gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 1);
        }
    }, 1000);
}

// Открытие сердца
function openHeart() {
    if (!container.classList.contains('open')) {
        container.classList.add('open');
        createFlowers();
        emojiInterval = setInterval(createEmojis, 200);
        
        // Плавный старт музыки
        if (activeMusic.paused) {
            activeMusic.play();
            gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 1);
        }
    }
}

// Закрытие сердца
function closeHeart() {
    if (container.classList.contains('open')) {
        container.classList.remove('open');
        clearInterval(emojiInterval);
        
        // Плавная остановка музыки
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        setTimeout(() => {
            activeMusic.pause();
            activeMusic.currentTime = 0;
        }, 1000);
    }
}

// Создание смайликов
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
    const emojis = ['😘', '💋', '❤️', '💕', '💞', '💖', '💘', '💐', '🌷', '🌹', '🌸', '🌺' ];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// Создание цветов
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

// Обработчики событий
heart.addEventListener('click', (e) => {
    e.stopPropagation();
    openHeart();
});

document.addEventListener('click', (e) => {
    if (container.classList.contains('open') && 
        !heart.contains(e.target) && 
        !message.contains(e.target)) {
        closeHeart();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHeart();
});

toggle.addEventListener('change', (e) => {
    const isDark = e.target.checked;
    updateTheme(isDark);
    switchMusic(isDark ? music2 : music1);
});

// Запуск
init();