/**
 * Zero-G Drum Lab - Physics Engine Logic
 * Matter.js + Tone.js Integration
 */

const { Engine, Render, Runner, Bodies, Composite, Events, Vector, Body } = Matter;

class AntigravitySequencer {
    constructor() {
        this.container = document.getElementById('sequencer-container');
        this.engine = Engine.create();
        this.world = this.engine.world;

        // Zero Gravity Configuration
        this.world.gravity.y = 0;
        this.world.gravity.x = 0;

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.render = Render.create({
            element: this.container,
            engine: this.engine,
            options: {
                width: this.width,
                height: this.height,
                wireframes: false,
                background: 'transparent'
            }
        });

        this.initAudio();
        this.initPhysics();
        this.initEvents();

        Render.run(this.render);
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);
    }

    initAudio() {
        // High quality drum synths
        this.synths = {
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 10,
                oscillator: { type: 'sine' }
            }).toDestination(),
            snare: new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
            }).toDestination(),
            hihat: new Tone.MetalSynth({
                frequency: 200,
                envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5
            }).toDestination()
        };

        this.audioStarted = false;
    }

    initPhysics() {
        const wallOptions = {
            isStatic: true,
            restitution: 1, // Perfect bounce
            friction: 0,
            render: { fillStyle: 'rgba(255,255,255,0.1)' }
        };

        const thickness = 60;

        // Walls labeled for sound mapping
        this.walls = {
            top: Bodies.rectangle(this.width / 2, -thickness / 2, this.width, thickness, { ...wallOptions, label: 'kick' }),
            bottom: Bodies.rectangle(this.width / 2, this.height + thickness / 2, this.width, thickness, { ...wallOptions, label: 'kick' }),
            left: Bodies.rectangle(-thickness / 2, this.height / 2, thickness, this.height, { ...wallOptions, label: 'snare' }),
            right: Bodies.rectangle(this.width + thickness / 2, this.height / 2, thickness, this.height, { ...wallOptions, label: 'hihat' })
        };

        Composite.add(this.world, Object.values(this.walls));
    }

    initEvents() {
        // Collision detection to trigger sounds
        Events.on(this.engine, 'collisionStart', (event) => {
            if (!this.audioStarted) return;

            event.pairs.forEach((pair) => {
                const labels = [pair.bodyA.label, pair.bodyB.label];

                if (labels.includes('kick')) {
                    this.synths.kick.triggerAttackRelease("C1", "8n");
                } else if (labels.includes('snare')) {
                    this.synths.snare.triggerAttackRelease("16n");
                } else if (labels.includes('hihat')) {
                    this.synths.hihat.triggerAttackRelease("32n");
                }
            });
        });

        // Click to spawn balls
        this.container.addEventListener('mousedown', (e) => {
            if (!this.audioStarted) return;

            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.spawnBall(x, y);
        });
    }

    spawnBall(x, y) {
        const speed = parseFloat(document.getElementById('speed-slider').value);
        const angle = Math.random() * Math.PI * 2;

        const ball = Bodies.circle(x, y, 15, {
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            inertia: Infinity, // Perpetual motion
            render: {
                fillStyle: `hsl(${Math.random() * 360}, 70%, 60%)`,
                strokeStyle: '#fff',
                lineWidth: 2
            }
        });

        Body.setVelocity(ball, {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        });

        Composite.add(this.world, ball);
    }

    clear() {
        const bodies = Composite.allBodies(this.world);
        bodies.forEach(body => {
            if (!body.isStatic) {
                Composite.remove(this.world, body);
            }
        });
    }

    async start() {
        await Tone.start();
        this.audioStarted = true;
        console.log('Audio engine started');
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const sequencer = new AntigravitySequencer();

    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        sequencer.start();
        startBtn.innerText = "引擎運行中 ✅";
        startBtn.disabled = true;
        startBtn.style.background = "#00c853";
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
        sequencer.clear();
    });
});
