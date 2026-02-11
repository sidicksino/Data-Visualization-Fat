class Lightning {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    drawLightning() {
        if (Math.random() > 0.05) return; // Only draw effectively 5% of frames

        const ctx = this.ctx;
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.random(0.1, 0.4)})`;
        ctx.lineWidth = this.random(1, 3);
        
        ctx.beginPath();
        let x = this.random(0, this.canvas.width);
        let y = 0;
        ctx.moveTo(x, y);

        while (y < this.canvas.height) {
            const nextX = x + this.random(-20, 20);
            const nextY = y + this.random(10, 50);
            ctx.lineTo(nextX, nextY);
            x = nextX;
            y = nextY;
        }
        ctx.stroke();
    }

    animate() {
        // Fade out for trails
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawLightning();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('lightning-canvas');
    if (canvas) {
        new Lightning(canvas);
    }
});
