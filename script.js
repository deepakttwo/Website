document.addEventListener('DOMContentLoaded', function() {
    // Hamburger Menu Functionality
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sideNav = document.getElementById('sideNav');
    const closeNavBtn = document.getElementById('closeNavBtn');
    const navOverlay = document.getElementById('navOverlay');
    const navLinks = document.querySelectorAll('.nav-menu a');

    function openMenu() {
        hamburgerBtn.classList.add('active');
        sideNav.classList.add('open');
        navOverlay.classList.add('active');
    }

    function closeMenu() {
        hamburgerBtn.classList.remove('active');
        sideNav.classList.remove('open');
        navOverlay.classList.remove('active');
    }

    // Event listeners for menu toggle
    hamburgerBtn.addEventListener('click', () => {
        if (sideNav.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    closeNavBtn.addEventListener('click', closeMenu);
    navOverlay.addEventListener('click', closeMenu);

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sideNav.classList.contains('open')) {
            closeMenu();
        }
    });

    // Modal Management
    const welcomeModal = document.getElementById('welcomeModal');
    const modalClose = welcomeModal ? welcomeModal.querySelector('.modal-close') : null;
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Close modal function
    function closeModal() {
        if (welcomeModal) {
            welcomeModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
    }

    // Event listeners for modal close
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the modal content
    if (welcomeModal) {
        welcomeModal.addEventListener('click', function(event) {
            if (event.target === welcomeModal) {
                closeModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && welcomeModal && !welcomeModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    const ageChart = document.getElementById('ageChart');
    const genderChart = document.getElementById('genderChart');
    const studyChart = document.getElementById('studyChart');
    const stressChart = document.getElementById('stressChart');

    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;

    const chartData = {
        age: [
            { label: '21–25', value: 40.4 },
            { label: '18–21', value: 24.7 },
            { label: '16–18', value: 19.9 },
            { label: 'Above 25', value: 11.6 },
            { label: 'Under 16', value: 3.4 }
        ],
        gender: [
            { label: 'Female', value: 51.4 },
            { label: 'Male', value: 48.6 }
        ],
        study: [
            { label: 'School', value: 28.1 },
            { label: 'Undergrad', value: 26.0 },
            { label: 'Postgrad', value: 26.0 },
            { label: 'Engineering', value: 14.4 },
            { label: 'Medical/PhD', value: 5.5 }
        ],
        stress: [
            { label: 'Sometimes', value: 48.6 },
            { label: 'Often', value: 21.2 },
            { label: 'Always', value: 11.6 },
            { label: 'Rarely/Never', value: 18.6 }
        ]
    };

    const chartColors = ['#22d3ee', '#a855f7', '#f97316', '#22c55e', '#38bdf8'];

    function drawBarChart(canvas, data, hoverIndex = -1) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        const maxValue = Math.max(...data.map(item => item.value));
        const padding = 32;
        const barWidth = (width - padding * 2) / data.length - 10;

        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * (height - padding * 2);
            const x = padding + index * (barWidth + 10);
            const y = height - padding - barHeight;
            const isHover = index === hoverIndex;

            ctx.fillStyle = chartColors[index % chartColors.length];
            ctx.globalAlpha = isHover ? 1 : 0.8;
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.globalAlpha = 1;

            if (isHover) {
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

                ctx.fillStyle = '#0f172a';
                ctx.font = '14px Segoe UI';
                ctx.fillText(`${item.value}%`, x, y - 6);
            }

            ctx.fillStyle = '#334155';
            ctx.font = '12px Segoe UI';
            ctx.fillText(item.label, x, height - 8);
        });
    }

    function drawDonutChart(canvas, data, hoverIndex = -1) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;
        const innerRadius = radius * 0.6;
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let startAngle = -Math.PI / 2;

        ctx.clearRect(0, 0, width, height);
        data.forEach((item, index) => {
            const angle = (item.value / total) * Math.PI * 2;
            const isHover = index === hoverIndex;
            const offset = isHover ? 6 : 0;
            const midAngle = startAngle + angle / 2;
            const offsetX = Math.cos(midAngle) * offset;
            const offsetY = Math.sin(midAngle) * offset;

            ctx.beginPath();
            ctx.moveTo(centerX + offsetX, centerY + offsetY);
            ctx.fillStyle = chartColors[index % chartColors.length];
            ctx.arc(centerX + offsetX, centerY + offsetY, radius, startAngle, startAngle + angle);
            ctx.closePath();
            ctx.fill();

            if (isHover) {
                ctx.fillStyle = '#0f172a';
                ctx.font = '14px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText(`${item.label}: ${item.value}%`, centerX, centerY + radius + 14);
            }

            startAngle += angle;
        });

        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.font = '16px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('Gender', centerX, centerY + 5);
    }

    function attachBarHover(canvas, data, drawFn) {
        let hoverIndex = -1;
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const width = canvas.width;
            const padding = 32;
            const barWidth = (width - padding * 2) / data.length - 10;
            const index = Math.floor((x - padding) / (barWidth + 10));
            hoverIndex = index >= 0 && index < data.length ? index : -1;
            drawFn(canvas, data, hoverIndex);
        });
        canvas.addEventListener('mouseleave', () => {
            hoverIndex = -1;
            drawFn(canvas, data, hoverIndex);
        });
    }

    function attachDonutHover(canvas, data, drawFn) {
        let hoverIndex = -1;
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
            const total = data.reduce((sum, item) => sum + item.value, 0);
            let startAngle = 0;
            let found = -1;
            data.forEach((item, index) => {
                const slice = (item.value / total) * Math.PI * 2;
                if (angle >= startAngle && angle < startAngle + slice) {
                    found = index;
                }
                startAngle += slice;
            });
            hoverIndex = found;
            drawFn(canvas, data, hoverIndex);
        });
        canvas.addEventListener('mouseleave', () => {
            hoverIndex = -1;
            drawFn(canvas, data, hoverIndex);
        });
    }

    function resizeBackground() {
        if (!bgCanvas) {
            return;
        }
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    const bgBars = Array.from({ length: 22 }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        width: 16 + Math.random() * 50,
        height: 40 + Math.random() * 140,
        speed: 0.2 + Math.random() * 0.9,
        color: chartColors[Math.floor(Math.random() * chartColors.length)]
    }));

    function drawBackground() {
        if (!bgCtx || !bgCanvas) {
            return;
        }
        bgCtx.fillStyle = 'rgba(11, 18, 32, 0.2)';
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

        bgBars.forEach(bar => {
            bgCtx.fillStyle = bar.color + '55';
            bgCtx.fillRect(bar.x, bar.y, bar.width, bar.height);
            bar.y -= bar.speed;
            if (bar.y + bar.height < 0) {
                bar.y = bgCanvas.height + Math.random() * 120;
                bar.x = Math.random() * bgCanvas.width;
            }
        });

        bgCtx.beginPath();
        bgCtx.arc(bgCanvas.width - 120, 120, 70, 0, Math.PI * 2);
        bgCtx.strokeStyle = 'rgba(45, 212, 191, 0.5)';
        bgCtx.lineWidth = 6;
        bgCtx.stroke();

        requestAnimationFrame(drawBackground);
    }

    function initCharts() {
        if (!ageChart || !genderChart || !studyChart || !stressChart) {
            return;
        }
        drawBarChart(ageChart, chartData.age);
        drawDonutChart(genderChart, chartData.gender);
        drawBarChart(studyChart, chartData.study);
        drawBarChart(stressChart, chartData.stress);
        attachBarHover(ageChart, chartData.age, drawBarChart);
        attachDonutHover(genderChart, chartData.gender, drawDonutChart);
        attachBarHover(studyChart, chartData.study, drawBarChart);
        attachBarHover(stressChart, chartData.stress, drawBarChart);
    }

    resizeBackground();
    initCharts();
    drawBackground();

    window.addEventListener('resize', function() {
        resizeBackground();
        initCharts();
    });
});