document.addEventListener('DOMContentLoaded', () => {
    const scoreBadge = document.getElementById('scoreBadge');
    const resultMessage = document.getElementById('resultMessage');
    const homeBtn = document.getElementById('homeBtn');
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');

    // Get score from localStorage
    const saved = JSON.parse(localStorage.getItem('mentalHealthScore') || '{}');
    const scoreRaw = saved.score || 0;
    const maxScore = 198;
    const scorePct = Math.min(100, Math.round((scoreRaw / maxScore) * 100));

    // Background animation setup
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

    /* =========================================================
       AUTOMOTIVE SPEEDOMETER GAUGE
       =========================================================
       
       Design inspired by BMW/Audi instrument clusters.
       
       GEOMETRY:
       - Center: (200, 200) - center of 400x400 viewBox
       - Radius: 140 - for the colored arc
       - Arc Span: 240° (like a real speedometer)
         - Starts at 150° (bottom-left)
         - Ends at -60° or 300° (bottom-right)
       
       ANGLE CONVENTION:
       - 0° = right (3 o'clock)
       - 90° = up (12 o'clock)
       - 180° = left (9 o'clock)
       - 270° = down (6 o'clock)
       
       SCORE TO ANGLE MAPPING:
       - Score 0 → 225° (bottom-left, ~7:30 on clock)
       - Score 100 → -45° or 315° (bottom-right, ~4:30 on clock)
       - This gives a 270° sweep like a real speedometer
       
       Formula: angle = 225° - (score / 100) × 270°
                angle_rad = (225 - score × 2.7) × π / 180
       ========================================================= */

    const CX = 200;           // Center X
    const CY = 200;           // Center Y
    const R = 140;            // Arc radius
    const START_ANGLE = 225;  // Starting angle in degrees (bottom-left)
    const SWEEP = 270;        // Total sweep in degrees

    /**
     * Convert score (0-100) to angle in degrees
     * Score 0 = 225° (bottom-left), Score 100 = -45° (bottom-right)
     */
    function scoreToAngleDeg(score) {
        const clampedScore = Math.max(0, Math.min(100, score));
        return START_ANGLE - (clampedScore / 100) * SWEEP;
    }

    /**
     * Convert degrees to radians
     */
    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    /**
     * Get (x, y) coordinates for a point on the arc at given score
     */
    function pointOnArc(score, radius = R) {
        const angleDeg = scoreToAngleDeg(score);
        const angleRad = degToRad(angleDeg);
        return {
            x: CX + radius * Math.cos(angleRad),
            y: CY - radius * Math.sin(angleRad)
        };
    }

    /**
     * Generate SVG arc path from startScore to endScore
     */
    function createArcPath(startScore, endScore, radius = R) {
        const start = pointOnArc(startScore, radius);
        const end = pointOnArc(endScore, radius);
        
        // Calculate arc span
        const startAngle = scoreToAngleDeg(startScore);
        const endAngle = scoreToAngleDeg(endScore);
        const arcSpan = Math.abs(startAngle - endAngle);
        
        // Large arc flag: 1 if arc > 180°
        const largeArcFlag = arcSpan > 180 ? 1 : 0;
        // Sweep flag: 1 for clockwise (score increases = angle decreases)
        const sweepFlag = 1;
        
        return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
    }

    /**
     * Initialize the speedometer gauge
     */
    function initGauge() {
        // === BACKGROUND TRACK (full sweep) ===
        document.getElementById('arcTrack').setAttribute('d', createArcPath(0, 100));

        // === COLOR ZONE ARCS ===
        // Red = bad (0-33), Yellow = okay (33-66), Green = good (66-100)
        // Low score = needs attention, High score = doing well
        document.getElementById('arcRed').setAttribute('d', createArcPath(0, 33));
        document.getElementById('arcYellow').setAttribute('d', createArcPath(33, 66));
        document.getElementById('arcGreen').setAttribute('d', createArcPath(66, 100));

        // === TICK MARKS ===
        const tickGroup = document.getElementById('tickMarks');
        tickGroup.innerHTML = '';
        
        const majorTickOuter = R + 25;  // Outside the arc
        const majorTickInner = R + 8;
        const minorTickOuter = R + 20;
        const minorTickInner = R + 10;
        
        // Major ticks every 10 units, minor ticks every 5 units
        for (let score = 0; score <= 100; score += 5) {
            const isMajor = score % 10 === 0;
            const angleDeg = scoreToAngleDeg(score);
            const angleRad = degToRad(angleDeg);
            
            const outerR = isMajor ? majorTickOuter : minorTickOuter;
            const innerR = isMajor ? majorTickInner : minorTickInner;
            
            const x1 = CX + innerR * Math.cos(angleRad);
            const y1 = CY - innerR * Math.sin(angleRad);
            const x2 = CX + outerR * Math.cos(angleRad);
            const y2 = CY - outerR * Math.sin(angleRad);
            
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', x1.toFixed(2));
            tick.setAttribute('y1', y1.toFixed(2));
            tick.setAttribute('x2', x2.toFixed(2));
            tick.setAttribute('y2', y2.toFixed(2));
            tick.setAttribute('stroke', isMajor ? '#e2e8f0' : '#64748b');
            tick.setAttribute('stroke-width', isMajor ? '3' : '1.5');
            tick.setAttribute('stroke-linecap', 'round');
            tickGroup.appendChild(tick);
        }

        // === TICK LABELS ===
        const labelGroup = document.getElementById('tickLabels');
        labelGroup.innerHTML = '';
        
        const labelRadius = R + 42;  // Position for labels
        const labelScores = [0, 20, 40, 60, 80, 100];
        
        labelScores.forEach(score => {
            const angleDeg = scoreToAngleDeg(score);
            const angleRad = degToRad(angleDeg);
            
            const x = CX + labelRadius * Math.cos(angleRad);
            const y = CY - labelRadius * Math.sin(angleRad);
            
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x.toFixed(2));
            label.setAttribute('y', (y + 5).toFixed(2));  // +5 for vertical centering
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', '#e2e8f0');
            label.setAttribute('font-size', '16');
            label.setAttribute('font-weight', '600');
            label.setAttribute('font-family', 'Segoe UI, Arial, sans-serif');
            label.textContent = score.toString();
            labelGroup.appendChild(label);
        });

        // === NEEDLE ===
        // Pointed needle shape like a real speedometer
        const needleLength = R + 5;  // Extends slightly past arc
        const needleBaseWidth = 8;
        const needleTipWidth = 2;
        
        // Needle points upward initially (will be rotated)
        // Shape: thin tip at top, wider base, small tail
        const needlePath = document.getElementById('needlePath');
        needlePath.setAttribute('d', `
            M ${CX} ${CY - needleLength}
            L ${CX - needleTipWidth} ${CY - needleLength + 15}
            L ${CX - needleBaseWidth} ${CY - 20}
            L ${CX - needleBaseWidth} ${CY + 15}
            L ${CX + needleBaseWidth} ${CY + 15}
            L ${CX + needleBaseWidth} ${CY - 20}
            L ${CX + needleTipWidth} ${CY - needleLength + 15}
            Z
        `);
    }

    /**
     * Animate needle to target score with smooth easing
     */
    function animateNeedle(score) {
        const needleGroup = document.getElementById('needleGroup');
        
        // Convert score to rotation angle
        // At score 0: needle at 225° → rotation from vertical (90°) = 225 - 90 = 135°
        // At score 100: needle at -45° → rotation from vertical = -45 - 90 = -135°
        // But we need to rotate from the initial "pointing up" position
        // Initial needle points up (toward angle 90°/top)
        // Score 0 should point to 225° → rotation = -(225 - 90) = -135°
        // Score 100 should point to -45° → rotation = -(-45 - 90) = 135°
        
        // Simpler approach: 
        // score 0 → rotation -135° (pointing to bottom-left)
        // score 100 → rotation +135° (pointing to bottom-right)
        const rotation = -135 + (score / 100) * 270;
        
        needleGroup.style.transformOrigin = `${CX}px ${CY}px`;
        needleGroup.style.transition = 'transform 2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        needleGroup.style.transform = `rotate(${rotation}deg)`;
    }

    function messageForScore() {
        if (scorePct <= 33) {
            return 'Your score suggests high stress and emotional strain. Please reach out for support soon. Helpline: 1800-599-0019. You are not alone, and help is available. 💙';
        }
        if (scorePct <= 66) {
            return 'You are in the moderate range. Try small habits: consistent sleep, short walks, journaling, and talking to someone you trust. These can help you move toward green. 🌱';
        }
        return 'You are doing well! Keep nurturing your routines. Remember: hydration is self-care, and your brain deserves rest. Keep shining! ✨';
    }

    // Update UI
    scoreBadge.textContent = `Score: ${scorePct}/100`;
    resultMessage.textContent = messageForScore();

    // Show suggestions popup for moderate score (34-66%)
    if (scorePct > 33 && scorePct <= 66) {
        const suggestionsModal = document.getElementById('suggestionsModal');
        const closeSuggestionsBtn = document.getElementById('closeSuggestionsBtn');
        const modalCloseBtn = suggestionsModal.querySelector('.modal-close');
        
        // Handle images that fail to load - replace with emoji placeholder
        const thumbnailImages = suggestionsModal.querySelectorAll('.thumbnail-card img');
        thumbnailImages.forEach(img => {
            img.onerror = function() {
                const placeholder = document.createElement('div');
                placeholder.className = 'thumbnail-placeholder';
                placeholder.textContent = img.closest('.content-category').querySelector('.category-title').textContent.includes('Shows') ? '📺' : '🎬';
                img.parentNode.replaceChild(placeholder, img);
            };
        });
        
        // Show modal after a short delay
        setTimeout(() => {
            suggestionsModal.classList.remove('hidden');
        }, 2500); // Show after needle animation completes
        
        // Close modal handlers
        function closeModal() {
            suggestionsModal.classList.add('hidden');
        }
        
        closeSuggestionsBtn.addEventListener('click', closeModal);
        modalCloseBtn.addEventListener('click', closeModal);
        
        // Close on clicking outside modal content
        suggestionsModal.addEventListener('click', (e) => {
            if (e.target === suggestionsModal) {
                closeModal();
            }
        });
    }

    homeBtn.addEventListener('click', () => {
        localStorage.removeItem('mentalHealthScore');
        window.location.href = 'index.html';
    });

    // Initialize
    resizeBackground();
    drawBackground();
    initGauge();
    
    // Animate needle after a short delay for dramatic effect
    setTimeout(() => animateNeedle(scorePct), 500);

    window.addEventListener('resize', resizeBackground);
});