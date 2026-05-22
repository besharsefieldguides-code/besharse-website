const Engine = {
    // 1. Persistence Layer
    saveData: { keys: 0, level: 1, inventory: [], loadout: { primary: 'M4' } },

    init() {
        const saved = localStorage.getItem('gameSave');
        if (saved) this.saveData = JSON.parse(saved);
        this.updateUI();
    },

    save() {
        localStorage.setItem('gameSave', JSON.stringify(this.saveData));
    },

    // 2. State Machine
    setState(state) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(`${state}-screen`).classList.remove('hidden');
        if (state === 'combat') this.startRound();
    },

    // 3. Economy & Progression
    addKey() {
        this.saveData.keys++;
        this.updateUI();
        this.save();
    },

    // 4. Combat Logic
    startRound() {
        let round = 1;
        let aiCount = 1;
        document.getElementById('round-val').innerText = round;
        document.getElementById('ai-count').innerText = aiCount;

        // Mock Game Loop
        const interval = setInterval(() => {
            // Simplified logic: simulate killing AI
            console.log("AI engaged...");
            aiCount++;
            document.getElementById('ai-count').innerText = aiCount;
            
            if (aiCount > 10) { // Round complete condition
                this.addKey();
                clearInterval(interval);
            }
        }, 2000);
    },

    updateUI() {
        document.getElementById('key-count').innerText = this.saveData.keys;
        document.getElementById('level-count').innerText = this.saveData.level;
    }
};

Engine.init();
