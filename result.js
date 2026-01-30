document.addEventListener('DOMContentLoaded', () => {
    const dialCanvas = document.getElementById('odometer');
    const dialPointer = document.getElementById('dialPointer');
    const scoreBadge = document.getElementById('scoreBadge');
    const resultMessage = document.getElementById('resultMessage');
    const homeBtn = document.getElementById('homeBtn');
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');

    const saved = JSON.parse(localStorage.getItem('mentalHealthScore') || '{}');
    const scoreRaw = saved.score || 0;
    const maxScore = 198;
    const scorePct = Math.min(100, Math.round((scoreRaw / maxScore) * 100));

    const palette = ['#22d3ee', '#a855f7', '#f97316', '#22c55e', '#38bdf8'];
    const bgRings = Array.from({ length: 18 }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 10 + Math.random() * 40,
        speed: 0.3 + Math.random() * 0.6,
        color: palette[Math.floor(Math.random() * palette.length)]
    }));

    function resizeBackground() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    function drawBackground() {
        bgCtx.fillStyle = 'rgba(11, 18, 32, 0.18)';
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgRings.forEach(ring => {
            bgCtx.beginPath();
            bgCtx.strokeStyle = ring.color + '66';
            bgCtx.lineWidth = 2;
            bgCtx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            bgCtx.stroke();
            ring.y -= ring.speed;
            if (ring.y + ring.radius < 0) {
                ring.y = bgCanvas.height + Math.random() * 80;
                ring.x = Math.random() * bgCanvas.width;
            }
        });
        requestAnimationFrame(drawBackground);
    }

    function drawOdometerDial() {
        const ctx = dialCanvas.getContext('2d');
        const width = dialCanvas.width;
        const height = dialCanvas.height;
        const centerX = width / 2;
        const centerY = height - 8;
        const radius = Math.min(width, height) / 1.08;
        const startAngle = -Math.PI / 2;
        const endAngle = Math.PI / 2;

        const valueToAngle = (value) => startAngle + (value / 100) * (endAngle - startAngle);

        ctx.clearRect(0, 0, width, height);

        const plate = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
        plate.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
        plate.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
        ctx.fillStyle = plate;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, startAngle, endAngle, false);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();

        const segments = [
            { start: 0, end: 40, color: '#22c55e' },
            { start: 40, end: 70, color: '#eab308' },
            { start: 70, end: 100, color: '#ef4444' }
        ];

        segments.forEach(segment => {
            ctx.beginPath();
            ctx.strokeStyle = segment.color;
            ctx.lineWidth = 16;
            ctx.arc(centerX, centerY, radius, valueToAngle(segment.start), valueToAngle(segment.end));
            ctx.stroke();
        });

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 10; i += 1) {
            const angle = valueToAngle(i * 10);
            const inner = radius - 22;
            const outer = radius - 6;
            const x1 = centerX + Math.cos(angle) * inner;
            const y1 = centerY + Math.sin(angle) * inner;
            const x2 = centerX + Math.cos(angle) * outer;
            const y2 = centerY + Math.sin(angle) * outer;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('0', centerX - radius + 20, centerY - 6);
        ctx.fillText('50', centerX, centerY - radius + 22);
        ctx.fillText('100', centerX + radius - 20, centerY - 6);
    }

    function animatePointer() {
        const angle = -90 + (scorePct / 100) * 180;
        requestAnimationFrame(() => {
            dialPointer.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        });
    }

    function messageForScore() {
        if (scorePct >= 67) {
            return 'Your score suggests high stress and emotional strain. Please reach out for support soon. Helpline: 1800-599-0019. You are not alone, and help is available.';
        }
        if (scorePct >= 34) {
            return 'You are in the moderate range. Try small habits: consistent sleep, short walks, journaling, and talking to someone you trust. These can help you move toward green.';
        }
        return 'You are doing well! Keep nurturing your routines. Remember: hydration is self-care, and your brain deserves snacks and naps. Keep shining! ✨';
    }

    scoreBadge.textContent = `Score: ${scorePct}/100`;
    resultMessage.textContent = messageForScore();

    homeBtn.addEventListener('click', () => {
        localStorage.removeItem('mentalHealthScore');
        window.location.href = 'index.html';
    });

    resizeBackground();
    drawBackground();
    drawOdometerDial();
    setTimeout(animatePointer, 400);

    window.addEventListener('resize', () => {
        resizeBackground();
        drawOdometerDial();
    });
});