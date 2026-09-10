/**
 * Player Model: Real-Time Psychological & Behavioral Analysis Engine
 * Evaluates decisions, reaction latencies, n-gram entropy, spatial biases, and manipulation traits.
 */
class PlayerModel {
    constructor() {
        this.history = [];
        this.spatialHistory = []; // 0 for Left, 1 for Right
        this.reactionTimes = [];
        this.hoverCounts = [];

        // Dynamic metrics (never shown raw to the player)
        this.metrics = {
            spatialBias: 0.5,           // 0.0 = total Left bias, 1.0 = total Right bias
            repetitionRate: 0.5,        // Probability of choosing same slot as previous
            alternationRate: 0.5,       // Probability of switching slots
            shannonEntropy2Gram: 1.0,   // Entropy of 2-choice windows (0.0 to 1.0)
            shannonEntropy3Gram: 1.0,   // Entropy of 3-choice windows
            patternAvoidance: 0.5,      // Measures artificial run-avoidance (humans avoiding runs)
            meanReactionTime: 1200,     // Running mean latency (ms)
            reactionTimeVariance: 0,
            riskTolerance: 0.5,         // Safe vs Risky tendencies
            defianceQuotient: 0.5,      // Defying system predictions vs complying
            contrarianIndex: 0.5,       // Conscious subversion of announced predictions
            manipulatorScore: 0.0,      // Pattern-lure detection (baiting the AI)
            predictabilityIndex: 0.5    // Composite predictability score
        };

        this.nGramCounts = new Map(); // e.g. "0,1" -> {0: count, 1: count}
        this.consecutiveSystemWins = 0;
        this.consecutiveSystemLosses = 0;
        this.totalPredictions = 0;
        this.correctPredictions = 0;
    }

    recordDecision({
        trialIndex,
        promptId,
        promptCategory,
        leftOption,
        rightOption,
        chosenSlot, // 0 = Left, 1 = Right
        chosenLabel,
        reactionTimeMs,
        hoverSwitches,
        prediction, // null or { predictedSlot: 0|1, text: string }
        metadata
    }) {
        const entry = {
            trialIndex,
            promptId,
            promptCategory,
            leftOption,
            rightOption,
            chosenSlot,
            chosenLabel,
            reactionTimeMs,
            hoverSwitches: hoverSwitches || 0,
            prediction: prediction ? { ...prediction } : null,
            systemWon: prediction ? (prediction.predictedSlot === chosenSlot) : null,
            timestamp: Date.now(),
            metadata: metadata || {}
        };

        this.history.push(entry);
        this.spatialHistory.push(chosenSlot);
        this.reactionTimes.push(reactionTimeMs);
        this.hoverCounts.push(hoverSwitches || 0);

        if (prediction) {
            this.totalPredictions++;
            if (entry.systemWon) {
                this.correctPredictions++;
                this.consecutiveSystemWins++;
                this.consecutiveSystemLosses = 0;
            } else {
                this.consecutiveSystemLosses++;
                this.consecutiveSystemWins = 0;
            }
        }

        // Update n-gram memory
        this._updateNGrams(chosenSlot);

        // Recalculate mathematical behavioral metrics
        this._computeMetrics();

        return entry;
    }

    _updateNGrams(currentSlot) {
        const len = this.spatialHistory.length;
        // 1-back (2-gram)
        if (len >= 2) {
            const prev1 = this.spatialHistory[len - 2];
            const key1 = `${prev1}`;
            if (!this.nGramCounts.has(key1)) {
                this.nGramCounts.set(key1, { 0: 0, 1: 0 });
            }
            this.nGramCounts.get(key1)[currentSlot]++;
        }

        // 2-back (3-gram)
        if (len >= 3) {
            const prev2 = this.spatialHistory[len - 3];
            const prev1 = this.spatialHistory[len - 2];
            const key2 = `${prev2},${prev1}`;
            if (!this.nGramCounts.has(key2)) {
                this.nGramCounts.set(key2, { 0: 0, 1: 0 });
            }
            this.nGramCounts.get(key2)[currentSlot]++;
        }
    }

    _computeMetrics() {
        const n = this.spatialHistory.length;
        if (n === 0) return;

        // 1. Spatial Bias (EMA with alpha = 0.25)
        const alpha = 0.25;
        let bias = this.metrics.spatialBias;
        const currentSlot = this.spatialHistory[n - 1];
        bias = alpha * currentSlot + (1 - alpha) * bias;
        this.metrics.spatialBias = Math.round(bias * 1000) / 1000;

        // 2. Reaction Time Mean & Variance
        const sumRt = this.reactionTimes.reduce((acc, t) => acc + t, 0);
        this.metrics.meanReactionTime = Math.round(sumRt / n);
        const sqDiffs = this.reactionTimes.map(t => Math.pow(t - this.metrics.meanReactionTime, 2));
        this.metrics.reactionTimeVariance = Math.round(sqDiffs.reduce((a, b) => a + b, 0) / n);

        // 3. Repetition & Alternation Rates
        if (n >= 2) {
            let repetitions = 0;
            let alternations = 0;
            for (let i = 1; i < n; i++) {
                if (this.spatialHistory[i] === this.spatialHistory[i - 1]) {
                    repetitions++;
                } else {
                    alternations++;
                }
            }
            this.metrics.repetitionRate = Math.round((repetitions / (n - 1)) * 100) / 100;
            this.metrics.alternationRate = Math.round((alternations / (n - 1)) * 100) / 100;

            // Pattern avoidance indicator:
            // Humans trying to appear random typically over-alternate (alternation > 0.65)
            // and have an abnormally low rate of 3-in-a-row runs compared to p=0.5 Bernoulli trials.
            let runsOfThree = 0;
            for (let i = 2; i < n; i++) {
                if (this.spatialHistory[i] === this.spatialHistory[i - 1] &&
                    this.spatialHistory[i - 1] === this.spatialHistory[i - 2]) {
                    runsOfThree++;
                }
            }
            const expectedRuns = (n - 2) * 0.25;
            const runDeficit = Math.max(0, expectedRuns - runsOfThree);
            this.metrics.patternAvoidance = Math.min(1.0, Math.round(((this.metrics.alternationRate * 0.6) + (runDeficit / (expectedRuns || 1) * 0.4)) * 100) / 100);
        }

        // 4. Shannon Entropy of 2-grams and 3-grams
        this.metrics.shannonEntropy2Gram = this._calculateEntropy(2);
        this.metrics.shannonEntropy3Gram = this._calculateEntropy(3);

        // 5. Risk, Defiance, and Manipulator Score
        this._computePsychologicalScores();
    }

    _calculateEntropy(gramSize) {
        const n = this.spatialHistory.length;
        if (n < gramSize) return 1.0;

        const grams = new Map();
        const total = n - gramSize + 1;
        for (let i = 0; i <= n - gramSize; i++) {
            const sub = this.spatialHistory.slice(i, i + gramSize).join('');
            grams.set(sub, (grams.get(sub) || 0) + 1);
        }

        let entropy = 0;
        for (const count of grams.values()) {
            const p = count / total;
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        }
        const maxEntropy = gramSize; // log2(2^gramSize)
        return Math.max(0, Math.min(1.0, Math.round((entropy / maxEntropy) * 100) / 100));
    }

    _computePsychologicalScores() {
        // Risk Profile: analyze trials with category 'risk', 'trust', 'courage'
        const riskTrials = this.history.filter(h => h.metadata && h.metadata.hasRisk);
        if (riskTrials.length > 0) {
            const riskyChosen = riskTrials.filter(h => h.metadata.chosenIsRisky).length;
            this.metrics.riskTolerance = Math.round((riskyChosen / riskTrials.length) * 100) / 100;
        }

        // Defiance Quotient & Contrarian Index
        const predictedTrials = this.history.filter(h => h.prediction !== null);
        if (predictedTrials.length > 0) {
            const defiedCount = predictedTrials.filter(h => !h.systemWon).length;
            this.metrics.defianceQuotient = Math.round((defiedCount / predictedTrials.length) * 100) / 100;

            // Contrarian score: if the AI explicitly stated "I think you'll choose LEFT"
            // and the player immediately chose RIGHT, how consistent was this contrarian reflex?
            this.metrics.contrarianIndex = this.metrics.defianceQuotient;

            // Manipulator Detection:
            // Look for sequences where player establishes predictable repeats (3 in a row),
            // lures the AI into predicting the 4th, then flips at high confidence.
            let baitCount = 0;
            for (let i = 3; i < predictedTrials.length; i++) {
                const prevA = this.history[predictedTrials[i].trialIndex - 3]?.chosenSlot;
                const prevB = this.history[predictedTrials[i].trialIndex - 2]?.chosenSlot;
                const prevC = this.history[predictedTrials[i].trialIndex - 1]?.chosenSlot;
                if (prevA !== undefined && prevA === prevB && prevB === prevC) {
                    // Player established a run of 3, then defied prediction on 4th
                    if (!predictedTrials[i].systemWon) {
                        baitCount++;
                    }
                }
            }
            this.metrics.manipulatorScore = Math.min(1.0, Math.round((baitCount / 2) * 100) / 100);
        }

        // Composite Predictability
        // Weighted blend of System Win Rate, Low Entropy, High Spatial Bias, High Repetition
        const winRate = this.totalPredictions > 0 ? (this.correctPredictions / this.totalPredictions) : 0.5;
        const spatialImbalance = Math.abs(this.metrics.spatialBias - 0.5) * 2; // 0 to 1
        const lowEntropy = 1.0 - this.metrics.shannonEntropy2Gram;

        this.metrics.predictabilityIndex = Math.max(0.05, Math.min(0.98,
            Math.round((winRate * 0.55 + spatialImbalance * 0.25 + lowEntropy * 0.2) * 100) / 100
        ));
    }

    getArchetype() {
        const {
            predictabilityIndex,
            manipulatorScore,
            defianceQuotient,
            patternAvoidance,
            spatialBias,
            meanReactionTime,
            riskTolerance
        } = this.metrics;

        if (manipulatorScore >= 0.6 || (defianceQuotient >= 0.75 && this.history.length >= 20)) {
            return {
                title: "THE PUPPETEER",
                subtitle: "Strategic Contrarian",
                description: "You did not merely resist prediction; you conditioned the observer. You planted deliberate habits to manufacture false certainty, then severed them on command."
            };
        } else if (predictabilityIndex <= 0.25 && defianceQuotient >= 0.6) {
            return {
                title: "THE STOCHASTIC GHOST",
                subtitle: "Genuine Anomaly",
                description: "Your decisions exhibit near-maximal algorithmic entropy. You demonstrated the rare cognitive ability to break habitual neural paths without collapsing into artificial symmetry."
            };
        } else if (predictabilityIndex >= 0.75) {
            return {
                title: "THE CLOCKWORK AUTOMATON",
                subtitle: "Deterministic State Machine",
                description: "Your internal heuristics were mapped within single-digit iterations. When pressured by latency and consequence, your subconscious adhered flawlessly to programmed comfort zones."
            };
        } else if (patternAvoidance >= 0.7) {
            return {
                title: "THE ANXIOUS REVERSER",
                subtitle: "Conscious Anti-Patternist",
                description: "You fought hard to avoid patterns, yet that very struggle created its own signature: over-alternation and run-phobia. In running from predictability, you drew an exact map of your fears."
            };
        } else if (riskTolerance >= 0.7) {
            return {
                title: "THE RECKLESS VOLATILE",
                subtitle: "Impulse-Driven Defier",
                description: "When ambiguity or danger presented itself, you accelerated into the abyss. You prioritize disruption over preservation."
            };
        } else if (meanReactionTime > 2200) {
            return {
                title: "THE CALCULATED STOIC",
                subtitle: "Deliberative Thinker",
                description: "You starved the system of micro-reflexes by pausing to evaluate the observer before every stroke. Silence was your primary shield."
            };
        } else {
            return {
                title: "THE HYBRID NOMAD",
                subtitle: "Fluid Entity",
                description: "Balanced on the precipice between reflex and intellect. The system caught your ripples, but the deep water remained obscured."
            };
        }
    }
}

window.PlayerModel = PlayerModel;
