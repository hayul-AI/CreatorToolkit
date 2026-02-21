/**
 * CreatorToolkit Local AI Engine v1.0
 * Pure JS - No External API calls
 */
const aiEngine = {
    dictionaries: {
        power: ['Best', 'Proven', 'Easy', 'Fast', 'Smart', 'Secret', 'Ultimate', 'Step-by-step', 'Official', 'New'],
        emotion: ['Stop', 'Avoid', 'Mistake', 'Truth', 'Warning', 'Don't', 'Finally', 'Actually', 'Life-changing'],
        forbidden: ['guaranteed', 'insane', 'shocking', 'unbelievable', 'magic', 'rich fast'],
        intents: {
            info: ['what', 'why', 'meaning', 'history'],
            tutorial: ['how to', 'step', 'guide', 'beginner', 'setup'],
            comparison: ['vs', 'or', 'better', 'best', 'review'],
            transaction: ['buy', 'price', 'deal', 'cheap']
        }
    },

    normalizeTopic(topic) {
        return topic.trim().replace(/\s+/g, ' ').replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/gi, '');
    },

    extractKeywords(text) {
        const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        return [...new Set(words)].slice(0, 3);
    },

    generateTitles(topic, style, intensity, count = 10) {
        const t = this.normalizeTopic(topic);
        const templates = [
            `How to Master ${t} in 2026`,
            `The Only ${t} Strategy You Need`,
            `7 ${t} Mistakes You Must Avoid`,
            `The Truth About ${t} (Actually Works)`,
            `${t} Explained in 5 Minutes`,
            `Stop Doing ${t} the Wrong Way`,
            `My Secret ${t} Workflow Revealed`,
            `Before You Start ${t}, Watch This`,
            `${t}: From Beginner to Pro Guide`,
            `Why Most People Fail at ${t}`,
            `The ${t} Revolution is Here`,
            `Finally, a Real ${t} Tutorial`,
            `Is ${t} Worth It? My Honest Review`,
            `How I Use ${t} to Grow Fast`,
            `5 ${t} Tips for Better Results`,
            `Advanced ${t} Techniques You Should Know`,
            `What No One Tells You About ${t}`,
            `The Future of ${t}: What's Next?`,
            `I Tried ${t} for 30 Days`,
            `${t} Comparison: Which is Best?`
        ];

        let results = templates.map(tmp => {
            let text = tmp;
            if (intensity === 'aggressive') {
                text = text.replace('Mistakes', 'Fatal Mistakes').replace('Truth', 'Shocking Truth');
            }
            return text;
        });

        return results.sort(() => 0.5 - Math.random()).slice(0, count);
    },

    scoreTitle(title, keyword) {
        let score = 0;
        const lowTitle = title.toLowerCase();
        const lowKw = keyword.toLowerCase();

        if (lowTitle.includes(lowKw) && lowTitle.indexOf(lowKw) < title.length * 0.3) score += 30;
        if (/\d+/.test(title)) score += 15;
        if (title.length >= 45 && title.length <= 60) score += 20;
        if (this.dictionaries.power.some(w => lowTitle.includes(w.toLowerCase()))) score += 15;
        if (this.dictionaries.emotion.some(w => lowTitle.includes(w.toLowerCase()))) score += 10;
        if (this.dictionaries.forbidden.some(w => lowTitle.includes(w.toLowerCase()))) score -= 30;

        return Math.max(0, Math.min(100, score));
    },

    getTips(title, score) {
        const tips = [];
        if (score < 75) {
            if (title.length < 40) tips.push("Title is a bit short. Add more context for SEO.");
            if (!/\d+/.test(title)) tips.push("Numbers in titles can boost CTR by up to 25%.");
            if (!this.dictionaries.power.some(w => title.toLowerCase().includes(w.toLowerCase()))) {
                tips.push("Try adding power words like 'Best' or 'Secret'.");
            }
        } else {
            tips.push("Perfect keyword placement detected.");
            tips.push("Optimal length for YouTube search & mobile.");
            tips.push("Emotional hook is strong and clear.");
        }
        return tips.slice(0, 3);
    }
};
window.aiEngine = aiEngine;
