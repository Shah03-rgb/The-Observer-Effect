/**
 * Oracle: Machine Prediction & Psychological Commentary Engine
 * Synthesizes Markov state transitions, n-gram pattern trees, reaction-time heuristics,
 * and dynamic psychological reverse psychology.
 */
class Oracle {
    constructor(playerModel) {
        this.model = playerModel;
        this.systemConfidence = 52; // Starting baseline confidence (0 - 100)
        this.playerConfidence = 48; // Player defiance / confidence
        this.tripleOracleActive = false;
        this.tripleForecast = []; // [slot0, slot1, slot2]
        this.tripleStep = 0;
        this.isDeceptionTrial = false;
    }

    /**
     * Calculates the predicted slot (0 = Left, 1 = Right), estimated probability,
     * and generates an atmospheric dialogue string.
     */
    predictNextChoice(scenario) {
        const history = this.model.spatialHistory;
        const n = history.length;

        // If very early (phase 1 calibration), no verbal predictions
        if (n < 8) {
            return null;
        }

        let pRight = 0.5; // Probability player picks Right (1)
        let reasoning = "Baseline heuristic.";

        const lastSlot = history[n - 1];
        const prevSlot = n >= 2 ? history[n - 2] : null;

        // 1. N-Gram Tree matching
        if (prevSlot !== null) {
            const key2 = `${prevSlot},${lastSlot}`;
            const stats2 = this.model.nGramCounts.get(key2);
            if (stats2 && (stats2[0] + stats2[1] >= 2)) {
                const total = stats2[0] + stats2[1];
                pRight = stats2[1] / total;
                reasoning = "2nd-order pattern memory.";
            } else {
                // Fallback to 1st order Markov
                const key1 = `${lastSlot}`;
                const stats1 = this.model.nGramCounts.get(key1);
                if (stats1 && (stats1[0] + stats1[1] >= 2)) {
                    pRight = stats1[1] / (stats1[0] + stats1[1]);
                    reasoning = "1st-order transition matrix.";
                }
            }
        }

        // 2. Spatial Bias Weighting (EMA)
        const bias = this.model.metrics.spatialBias;
        pRight = pRight * 0.65 + bias * 0.35;

        // 3. Pattern Avoidance adjustments:
        // If player has high alternation rate (> 0.65), they are very likely to switch
        if (this.model.metrics.alternationRate > 0.62) {
            const expectedSwitch = lastSlot === 0 ? 1 : 0;
            pRight = pRight * 0.4 + expectedSwitch * 0.6;
        }

        // 4. Contrarian & Reverse Psychology Detection:
        // If player has defied predictions >= 70% of the time,
        // and this is a mid-late trial, the Oracle decides whether to play straightforward or deceptive
        this.isDeceptionTrial = false;
        let intendedPrediction = pRight >= 0.5 ? 1 : 0;

        if (this.model.metrics.contrarianIndex > 0.65 && n >= 18 && Math.random() < 0.45) {
            // Deception trial: Announce the opposite of what the raw model expects,
            // because the player will reflexively pick the opposite of what we say!
            this.isDeceptionTrial = true;
            intendedPrediction = intendedPrediction === 1 ? 0 : 1;
        }

        // Confidence calculation
        const margin = Math.abs(pRight - 0.5) * 2; // 0.0 to 1.0
        const sampleBonus = Math.min(25, n * 0.8);
        const calcConfidence = Math.round(50 + margin * 35 + sampleBonus * (this.systemConfidence / 100));
        const finalConfidence = Math.max(55, Math.min(96, calcConfidence));

        const predictedSlot = intendedPrediction;
        const predictedLabel = predictedSlot === 0 ? scenario.left : scenario.right;

        // Generate tailored psychological dialogue
        const dialogue = this._generateDialogue(predictedSlot, predictedLabel, scenario, finalConfidence);

        return {
            predictedSlot,
            predictedLabel,
            confidence: finalConfidence,
            dialogue,
            isDeceptive: this.isDeceptionTrial
        };
    }

    _generateDialogue(predictedSlot, predictedLabel, scenario, confidence) {
        const { metrics } = this.model;
        const slotName = predictedSlot === 0 ? "LEFT" : "RIGHT";

        const templates = [
            `I calculate an ${confidence}% probability you will select ${predictedLabel.toUpperCase()}.`,
            `Your neural cadence suggests ${predictedLabel.toUpperCase()}. Do not fight the baseline.`,
            `A predictable path. You will choose ${slotName}.`,
            `The data converges: ${predictedLabel.toUpperCase()} is your inevitable state.`
        ];

        // Contextual flavor based on player quirks
        if (metrics.alternationRate > 0.7) {
            return `You alternate rhythmically to manufacture chaos. You will choose ${predictedLabel.toUpperCase()}.`;
        }
        if (metrics.spatialBias < 0.35 && predictedSlot === 0) {
            return `Your physical bias draws you toward the LEFT. You will choose ${predictedLabel.toUpperCase()}.`;
        }
        if (metrics.spatialBias > 0.65 && predictedSlot === 1) {
            return `The right channel is your refuge. You will select ${predictedLabel.toUpperCase()}.`;
        }
        if (metrics.meanReactionTime < 600) {
            return `Impulsive micro-responses yield pure determinism. You will select ${slotName}.`;
        }
        if (metrics.meanReactionTime > 2500) {
            return `Deliberation does not confer free will. In the end, you choose ${predictedLabel.toUpperCase()}.`;
        }
        if (this.isDeceptionTrial) {
            return `I foresee your rebellion. You are compelled to select ${predictedLabel.toUpperCase()}.`;
        }

        return templates[Math.floor(Math.random() * templates.length)];
    }

    startTripleOracle() {
        this.tripleOracleActive = true;
        this.tripleStep = 0;
        // Generate 3 sequential predictions based on current n-gram and alternation habits
        const last = this.model.spatialHistory[this.model.spatialHistory.length - 1] || 0;
        const alt = this.model.metrics.alternationRate > 0.55;

        const s1 = alt ? (1 - last) : last;
        const s2 = alt ? (1 - s1) : (Math.random() < 0.5 ? s1 : 1 - s1);
        const s3 = alt ? (1 - s2) : (1 - s1);

        this.tripleForecast = [s1, s2, s3];
        return this.tripleForecast;
    }

    recordResult(systemWon) {
        if (systemWon) {
            this.systemConfidence = Math.min(99, this.systemConfidence + 7);
            this.playerConfidence = Math.max(1, this.playerConfidence - 7);
        } else {
            this.systemConfidence = Math.max(1, this.systemConfidence - 8);
            this.playerConfidence = Math.min(99, this.playerConfidence + 8);
        }
    }

    getReactionObservation(lastDecision) {
        if (!lastDecision) return null;
        const { reactionTimeMs, hoverSwitches, chosenSlot, chosenLabel } = lastDecision;

        if (hoverSwitches >= 2) {
            return `You hovered across the threshold ${hoverSwitches} times. Hesitation is the signature of conflict.`;
        }
        if (reactionTimeMs < 400) {
            return `${reactionTimeMs}ms. Subconscious reflex. The brain decided before your consciousness registered the query.`;
        }
        if (reactionTimeMs > 3500) {
            return `${(reactionTimeMs / 1000).toFixed(1)}s of contemplation. Did you believe time would change your nature?`;
        }
        return null;
    }
}

window.Oracle = Oracle;
