const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    // The hero section's height is around 60vh
    canvas.height = window.innerHeight * 0.6;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Particle class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        // Soft orange colors and transparent whites
        const colors = ['rgba(255, 183, 77, 0.4)', 'rgba(245, 124, 0, 0.3)', 'rgba(255, 238, 204, 0.5)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        this.radius = Math.random() * 3 + 1;

        // Movement speeds
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off the edges
        if (this.x < 0 || this.x > canvas.width) {
            this.vx *= -1;
        }
        if (this.y < 0 || this.y > canvas.height) {
            this.vy *= -1;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Create particles
const particles = [];
for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
}

// Animation loop
function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                // Opacity based on distance
                const opacity = 1 - (distance / 120);
                ctx.strokeStyle = `rgba(255, 183, 77, ${opacity * 0.3})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    // Update and draw particles
    for (const p of particles) {
        p.update();
        p.draw();
    }

    window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
