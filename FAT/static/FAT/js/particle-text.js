
class Particle {
    constructor() {
        this.pos = { x: 0, y: 0 };
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };

        this.closeEnoughTarget = 100;
        this.maxSpeed = 1.0;
        this.maxForce = 0.1;
        this.particleSize = 10;
        this.isKilled = false;

        this.startColor = { r: 0, g: 0, b: 0 };
        this.targetColor = { r: 0, g: 0, b: 0 };
        this.colorWeight = 0;
        this.colorBlendRate = 0.01;
    }

    move() {
        // Check if particle is close enough to its target to slow down
        let proximityMult = 1;
        const distance = Math.sqrt(Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2));

        if (distance < this.closeEnoughTarget) {
            proximityMult = distance / this.closeEnoughTarget;
        }

        // Add force towards target
        const towardsTarget = {
            x: this.target.x - this.pos.x,
            y: this.target.y - this.pos.y,
        };

        const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y);
        if (magnitude > 0) {
            towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult;
            towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult;
        }

        const steer = {
            x: towardsTarget.x - this.vel.x,
            y: towardsTarget.y - this.vel.y,
        };

        const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
        if (steerMagnitude > 0) {
            steer.x = (steer.x / steerMagnitude) * this.maxForce;
            steer.y = (steer.y / steerMagnitude) * this.maxForce;
        }

        this.acc.x += steer.x;
        this.acc.y += steer.y;

        // Move particle
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.acc.x = 0;
        this.acc.y = 0;
    }

    draw(ctx, drawAsPoints) {
        // Blend towards target color
        if (this.colorWeight < 1.0) {
            this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
        }

        // Calculate current color
        const currentColor = {
            r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
            g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
            b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
        };

        if (drawAsPoints) {
            ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
            ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
        } else {
            ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    kill(width, height) {
        if (!this.isKilled) {
            // Set target outside the scene
            // Set target outside the scene
            const randomPos = generateRandomPos(width / 2, height / 2, (width + height) / 2, width, height);
            this.target.x = randomPos.x;
            this.target.y = randomPos.y;

            // Begin blending color to black
            this.startColor = {
                r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
                g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
                b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
            };
            this.targetColor = { r: 0, g: 0, b: 0 };
            this.colorWeight = 0;

            this.isKilled = true;
        }
    }
}

function generateRandomPos(x, y, mag, width, height) {
    const randomX = Math.random() * width;
    const randomY = Math.random() * height;

    const direction = {
        x: randomX - x,
        y: randomY - y,
    };

    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (magnitude > 0) {
        direction.x = (direction.x / magnitude) * mag;
        direction.y = (direction.y / magnitude) * mag;
    }

    return {
        x: x + direction.x,
        y: y + direction.y,
    };
}

const DEFAULT_WORDS = ["DATA", "VISUALIZATION", "BY", "ADOUNIA"];

class ParticleTextEffect {
    constructor(canvasId, words = DEFAULT_WORDS) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
          console.error(`Canvas with id ${canvasId} not found`);
          return;
        }
        this.ctx = this.canvas.getContext("2d");
        this.words = words;
        this.particles = [];
        this.frameCount = 0;
        this.wordIndex = 0;
        this.animationId = null;
        this.mouse = { x: 0, y: 0, isPressed: false, isRightClick: false };

        this.pixelSteps = 6;
        this.drawAsPoints = true;

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());

        this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
        this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
        this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
        this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

        this.nextWord(this.words[0]);
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleMouseDown(e) {
        this.mouse.isPressed = true;
        this.mouse.isRightClick = e.button === 2;
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    handleMouseUp() {
        this.mouse.isPressed = false;
        this.mouse.isRightClick = false;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    nextWord(word) {
        // Create off-screen canvas for text rendering
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = this.canvas.width;
        offscreenCanvas.height = this.canvas.height;
        const offscreenCtx = offscreenCanvas.getContext("2d");

        // Draw text
        offscreenCtx.fillStyle = "white";
        // Calculate font size based on canvas width and word length
        // 0.15 * width is the baseline
        // (width * 0.9) / (word.length * 0.7) estimates the max font size to fit the word width-wise
        const fontSize = Math.min(this.canvas.width * 0.18, (this.canvas.width * 0.9) / (word.length * 0.6), 150);
        offscreenCtx.font = `bold ${fontSize}px Arial`;
        offscreenCtx.textAlign = "center";
        offscreenCtx.textBaseline = "middle";
        offscreenCtx.fillText(word, this.canvas.width / 2, this.canvas.height / 2);

        const imageData = offscreenCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;

        // Generate new color
        const newColor = {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255,
        };

        let particleIndex = 0;

        // Collect coordinates
        const coordsIndexes = [];
        for (let i = 0; i < pixels.length; i += this.pixelSteps * 4) {
            coordsIndexes.push(i);
        }

        // Shuffle coordinates for fluid motion
        for (let i = coordsIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]];
        }

        for (const coordIndex of coordsIndexes) {
            const pixelIndex = coordIndex;
            const alpha = pixels[pixelIndex + 3];

            if (alpha > 0) {
                const x = (pixelIndex / 4) % this.canvas.width;
                const y = Math.floor(pixelIndex / 4 / this.canvas.width);

                let particle;

                if (particleIndex < this.particles.length) {
                    particle = this.particles[particleIndex];
                    particle.isKilled = false;
                    particleIndex++;
                } else {
                    particle = new Particle();

                    const randomPos = generateRandomPos(this.canvas.width / 2, this.canvas.height / 2, (this.canvas.width + this.canvas.height) / 2, this.canvas.width, this.canvas.height);
                    particle.pos.x = randomPos.x;
                    particle.pos.y = randomPos.y;

                    particle.maxSpeed = Math.random() * 6 + 4;
                    particle.maxForce = particle.maxSpeed * 0.05;
                    particle.particleSize = Math.random() * 6 + 6;
                    particle.colorBlendRate = Math.random() * 0.0275 + 0.0025;

                    this.particles.push(particle);
                }

                // Set color transition
                particle.startColor = {
                    r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
                    g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
                    b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
                };
                particle.targetColor = newColor;
                particle.colorWeight = 0;

                particle.target.x = x;
                particle.target.y = y;
            }
        }

        // Kill remaining particles
        for (let i = particleIndex; i < this.particles.length; i++) {
            this.particles[i].kill(this.canvas.width, this.canvas.height);
        }
    }

    animate() {
        // Background with motion blur
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.move();
            particle.draw(this.ctx, this.drawAsPoints);

            // Remove dead particles that are out of bounds
            if (particle.isKilled) {
                if (
                    particle.pos.x < 0 ||
                    particle.pos.x > this.canvas.width ||
                    particle.pos.y < 0 ||
                    particle.pos.y > this.canvas.height
                ) {
                    this.particles.splice(i, 1);
                }
            }
        }

        // Handle mouse interaction
        if (this.mouse.isPressed && this.mouse.isRightClick) {
            this.particles.forEach((particle) => {
                const distance = Math.sqrt(
                    Math.pow(particle.pos.x - this.mouse.x, 2) + Math.pow(particle.pos.y - this.mouse.y, 2),
                );
                if (distance < 50) {
                    particle.kill(this.canvas.width, this.canvas.height);
                }
            });
        }

        // Auto-advance words
        this.frameCount++;
        if (this.frameCount % 240 === 0) {
            this.wordIndex = (this.wordIndex + 1) % this.words.length;
            this.nextWord(this.words[this.wordIndex]);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize on load
console.log("Particle script loaded");
document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing ParticleTextEffect");
    new ParticleTextEffect("particle-canvas");
});
