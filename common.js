/**
 * Zero-G Drum Lab - Common JavaScript
 * Handles background animation and shared UI logic
 */

class FloatingBackground {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.blobs = [];
        this.count = 15;
        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            this.blobs.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 100 + 50,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: i % 2 === 0 ? 'rgba(0, 242, 255, 0.03)' : 'rgba(255, 0, 255, 0.03)'
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.blobs.forEach(blob => {
            blob.x += blob.vx;
            blob.y += blob.vy;

            if (blob.x < -blob.radius) blob.x = this.canvas.width + blob.radius;
            if (blob.x > this.canvas.width + blob.radius) blob.x = -blob.radius;
            if (blob.y < -blob.radius) blob.y = this.canvas.height + blob.radius;
            if (blob.y > this.canvas.height + blob.radius) blob.y = -blob.radius;

            this.ctx.beginPath();
            const gradient = this.ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
            gradient.addColorStop(0, blob.color);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Mobile Menu Control
class MobileMenu {
    constructor() {
        this.toggle = document.querySelector('.nav-toggle');
        this.navLinks = document.querySelector('.nav-links');
        if (!this.toggle || !this.navLinks) return;

        this.toggle.addEventListener('click', () => this.toggleMenu());

        // Close menu when a link is clicked
        this.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close on escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMenu();
        });
    }

    toggleMenu() {
        this.toggle.classList.toggle('active');
        this.navLinks.classList.toggle('active');
        document.body.style.overflow = this.navLinks.classList.contains('active') ? 'hidden' : '';
    }

    closeMenu() {
        this.toggle.classList.remove('active');
        this.navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Global UI Initialization
document.addEventListener('DOMContentLoaded', () => {
    new FloatingBackground();
    new MobileMenu();

    // Active link highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

// Sound Helper (Simple wrapper for basic feedback before Tone.js complex logic)
function playTone(freq = 440, type = 'sine', duration = 0.1) {
    if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = window.audioCtx.createOscillator();
    const gain = window.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, window.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.1, window.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, window.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(window.audioCtx.destination);

    osc.start();
    osc.stop(window.audioCtx.currentTime + duration);
}
