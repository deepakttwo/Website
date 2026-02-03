document.addEventListener('DOMContentLoaded', () => {
    const questionTitle = document.getElementById('questionTitle');
    const optionGrid = document.getElementById('optionGrid');
    const progressText = document.getElementById('progressText');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');

    const questions = [
        {
            id: 'age',
            text: 'Age',
            type: 'single',
            options: ['Under 16', '16–18', '18–21', '21–25', 'Above 25']
        },
        {
            id: 'gender',
            text: 'Gender',
            type: 'single',
            options: ['Male', 'Female', 'Prefer not to say', 'Other']
        },
        {
            id: 'study',
            text: 'Level of Study',
            type: 'single',
            options: ['School', 'Undergraduate', 'Postgraduate', 'Engineering', 'Medical', 'PhD (Engineering)']
        },
        {
            id: 'academic-stress',
            text: 'How frequently do you experience stress related to academics?',
            type: 'single',
            options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
            id: 'stress-sources',
            text: 'What are the primary sources of your stress? (Select all that apply)',
            type: 'multi',
            options: [
                'Exams or grades',
                'Career or future uncertainty',
                'Family expectations',
                'Relationships or friendships',
                'Social media pressure',
                'Health-related issues'
            ]
        },
        {
            id: 'emotional-state',
            text: 'Over the past two weeks, how would you describe your emotional state?',
            type: 'single',
            options: ['Mostly positive', 'Generally neutral', 'Occasionally low', 'Frequently low']
        },
        {
            id: 'anxiety',
            text: 'Do you feel worried or anxious on most days?',
            type: 'single',
            options: ['Yes', 'No', 'Sometimes']
        },
        {
            id: 'sleep-pattern',
            text: 'Have you noticed any recent changes in your sleep pattern?',
            type: 'single',
            options: ['No change – sleeping normally', 'Sleeping less than usual', 'Sleeping more than usual', 'Irregular sleep cycle']
        },
        {
            id: 'eating-habits',
            text: 'Have your eating habits changed recently?',
            type: 'single',
            options: ['No change', 'Eating less', 'Eating more', 'Skipping meals']
        },
        {
            id: 'concentration',
            text: 'Do you find it difficult to concentrate during classes or while studying?',
            type: 'single',
            options: ['Never', 'Sometimes', 'Often']
        },
        {
            id: 'mental-exhaustion',
            text: 'Do you feel mentally exhausted even without significant physical activity?',
            type: 'single',
            options: ['Yes', 'No', 'Sometimes']
        },
        {
            id: 'support',
            text: 'When you feel stressed, who do you usually turn to?',
            type: 'single',
            options: ['Friends', 'Family', 'Teachers', 'Counsellor or mentor', 'No one']
        },
        {
            id: 'coping',
            text: 'How do you typically cope with stress? (Select all that apply)',
            type: 'multi',
            options: [
                'Listening to music',
                'Sleeping',
                'Physical activity or yoga',
                'Social media',
                'Meditation or relaxation',
                'Avoiding the problem',
                'Talking to someone'
            ]
        },
        {
            id: 'sharing',
            text: 'Do you feel comfortable sharing emotional or mental health concerns with others?',
            type: 'single',
            options: ['Yes', 'No', 'Sometimes']
        },
        {
            id: 'support-services',
            text: 'Are you aware of any mental health support services available in your school or college?',
            type: 'single',
            options: ['Yes', 'No']
        },
        {
            id: 'consider-using',
            text: 'If counselling or support services were easily accessible, would you consider using them?',
            type: 'single',
            options: ['Yes', 'No', 'Maybe']
        },
        {
            id: 'preferred-support',
            text: 'What type of mental health support would you prefer?',
            type: 'single',
            options: ['One-to-one counselling', 'Peer support groups', 'Online or anonymous support', 'Workshops and awareness sessions']
        },
        {
            id: 'education',
            text: 'Do you believe mental health education should be included in school and college curricula?',
            type: 'single',
            options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree']
        }
    ];

    const answers = {};
    let currentIndex = 0;

    const palette = ['#22d3ee', '#a855f7', '#f97316', '#22c55e', '#38bdf8'];
    const bgDots = Array.from({ length: 26 }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 3 + Math.random() * 8,
        speed: 0.2 + Math.random() * 0.8,
        color: palette[Math.floor(Math.random() * palette.length)]
    }));

    const scoringMap = {
        'academic-stress': { 'Never': 20, 'Rarely': 15, 'Sometimes': 10, 'Often': 5, 'Always': 0 },
        'emotional-state': { 'Mostly positive': 18, 'Generally neutral': 12, 'Occasionally low': 6, 'Frequently low': 0 },
        'anxiety': { 'No': 16, 'Sometimes': 8, 'Yes': 0 },
        'sleep-pattern': { 'No change – sleeping normally': 14, 'Sleeping less than usual': 4, 'Sleeping more than usual': 8, 'Irregular sleep cycle': 0 },
        'eating-habits': { 'No change': 12, 'Eating less': 4, 'Eating more': 6, 'Skipping meals': 0 },
        'concentration': { 'Never': 14, 'Sometimes': 6, 'Often': 0 },
        'mental-exhaustion': { 'No': 14, 'Sometimes': 6, 'Yes': 0 },
        'support': { 'Friends': 8, 'Family': 9, 'Teachers': 10, 'Counsellor or mentor': 10, 'No one': 0 },
        'sharing': { 'Yes': 12, 'Sometimes': 6, 'No': 0 },
        'support-services': { 'Yes': 8, 'No': 0 },
        'consider-using': { 'Yes': 10, 'Maybe': 6, 'No': 0 },
        'preferred-support': { 'One-to-one counselling': 4, 'Peer support groups': 2, 'Online or anonymous support': 2, 'Workshops and awareness sessions': 0 },
        'education': { 'Strongly agree': 10, 'Agree': 8, 'Neutral': 6, 'Disagree': 2, 'Strongly disagree': 0 }
    };

    function resizeBackground() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    function goNext() {
        const question = questions[currentIndex];
        if (!answers[question.id] || (Array.isArray(answers[question.id]) && answers[question.id].length === 0)) {
            optionGrid.classList.add('fade-exit');
            setTimeout(() => optionGrid.classList.remove('fade-exit'), 350);
            return;
        }

        if (currentIndex < questions.length - 1) {
            currentIndex += 1;
            renderQuestion();
        } else {
            const score = computeScore();
            localStorage.setItem('mentalHealthScore', JSON.stringify({
                score,
                answers,
                timestamp: Date.now()
            }));
            window.location.href = 'result.html';
        }
    }

    function goPrev() {
        if (currentIndex > 0) {
            currentIndex -= 1;
            renderQuestion();
        }
    }

    function drawBackground() {
        bgCtx.fillStyle = 'rgba(11, 18, 32, 0.18)';
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgDots.forEach(dot => {
            bgCtx.beginPath();
            bgCtx.fillStyle = dot.color + '88';
            bgCtx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            bgCtx.fill();
            dot.y -= dot.speed;
            if (dot.y + dot.radius < 0) {
                dot.y = bgCanvas.height + Math.random() * 80;
                dot.x = Math.random() * bgCanvas.width;
            }
        });
        requestAnimationFrame(drawBackground);
    }

    function renderQuestion() {
        const question = questions[currentIndex];
        progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
        questionTitle.textContent = question.text;
        optionGrid.innerHTML = '';
        const selected = answers[question.id] || (question.type === 'multi' ? [] : '');

        question.options.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'option-btn';
            button.textContent = option;

            if (question.type === 'multi') {
                if (Array.isArray(selected) && selected.includes(option)) {
                    button.classList.add('selected');
                }
                button.addEventListener('click', () => {
                    const currentSelections = answers[question.id] || [];
                    if (currentSelections.includes(option)) {
                        answers[question.id] = currentSelections.filter(item => item !== option);
                        button.classList.remove('selected');
                    } else {
                        answers[question.id] = [...currentSelections, option];
                        button.classList.add('selected');
                    }
                    if (currentIndex < questions.length - 1 && answers[question.id].length > 0) {
                        setTimeout(goNext, 150);
                    }
                });
            } else {
                if (selected === option) {
                    button.classList.add('selected');
                }
                button.addEventListener('click', () => {
                    answers[question.id] = option;
                    [...optionGrid.children].forEach(child => child.classList.remove('selected'));
                    button.classList.add('selected');
                    console.log('Single option clicked:', option, 'CurrentIndex:', currentIndex, 'Total questions:', questions.length);
                    if (currentIndex < questions.length - 1) {
                        console.log('Auto-advancing to next question');
                        setTimeout(goNext, 150);
                    }
                });
            }

            optionGrid.appendChild(button);
        });

        prevBtn.style.opacity = currentIndex === 0 ? '0.35' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        const isLastQuestion = currentIndex === questions.length - 1;
        nextBtn.textContent = isLastQuestion ? 'Submit' : 'Next';
        nextBtn.style.display = isLastQuestion ? 'inline-flex' : 'none';
        optionGrid.classList.add('fade-enter');
        setTimeout(() => optionGrid.classList.remove('fade-enter'), 450);
    }

    function computeScore() {
        let score = 0;

        Object.keys(scoringMap).forEach(key => {
            const answer = answers[key];
            if (answer && typeof answer === 'string') {
                score += scoringMap[key][answer] || 0;
            }
        });

        const stressSources = answers['stress-sources'] || [];
        score += Math.max(0, 18 - stressSources.length * 3);

        const coping = answers['coping'] || [];
        let copingScore = 0;
        coping.forEach(item => {
            if (item === 'Social media') copingScore -= 4;
            if (item === 'Avoiding the problem') copingScore -= 6;
            if (item === 'Sleeping') copingScore -= 4;
            if (item === 'Listening to music') copingScore -= 2;
            if (item === 'Physical activity or yoga') copingScore += 4;
            if (item === 'Meditation or relaxation') copingScore += 3;
            if (item === 'Talking to someone') copingScore += 3;
        });
        score += Math.max(0, Math.min(copingScore + 16, 16));

        return score;
    }

    nextBtn.addEventListener('click', goNext);
    prevBtn.addEventListener('click', goPrev);

    resizeBackground();
    drawBackground();
    renderQuestion();

    window.addEventListener('resize', () => {
        resizeBackground();
    });
});
