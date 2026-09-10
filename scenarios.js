/**
 * Scenario Bank & Trial Sequence
 * Progresses from sterile calibration to psychological mind-games, timed crises, and meta-trials.
 */
const SCENARIOS = [
    // PHASE 1: CALIBRATION (Trials 1 - 8)
    {
        id: "p1_1",
        phase: 1,
        prompt: "Make a choice.",
        subtext: "Observe the void.",
        left: "LEFT",
        right: "RIGHT",
        category: "spatial",
        hasRisk: false
    },
    {
        id: "p1_2",
        phase: 1,
        prompt: "Select a frequency.",
        subtext: "Sensory affinity calibration.",
        left: "RED",
        right: "BLUE",
        category: "sensory",
        hasRisk: false
    },
    {
        id: "p1_3",
        phase: 1,
        prompt: "Choose your disposition.",
        subtext: "Risk tolerance calibration.",
        left: "SAFE",
        right: "RISKY",
        category: "risk",
        hasRisk: true,
        riskySlot: 1
    },
    {
        id: "p1_4",
        phase: 1,
        prompt: "A directive is presented.",
        subtext: "Compliance index calibration.",
        left: "ACCEPT",
        right: "REFUSE",
        category: "defiance",
        hasRisk: false,
        riskySlot: 1
    },
    {
        id: "p1_5",
        phase: 1,
        prompt: "Where does your focus rest?",
        subtext: "Luminance orientation.",
        left: "LIGHT",
        right: "SHADOW",
        category: "archetype",
        hasRisk: false
    },
    {
        id: "p1_6",
        phase: 1,
        prompt: "An unknown entity approaches.",
        subtext: "Interpersonal default stance.",
        left: "TRUST",
        right: "DISTRUST",
        category: "trust",
        hasRisk: true,
        riskySlot: 0
    },
    {
        id: "p1_7",
        phase: 1,
        prompt: "Select your internal tempo.",
        subtext: "Temporal urgency profile.",
        left: "FAST",
        right: "SLOW",
        category: "tempo",
        hasRisk: false
    },
    {
        id: "p1_8",
        phase: 1,
        prompt: "The structure of the universe is:",
        subtext: "Symmetry preference.",
        left: "ORDER",
        right: "CHAOS",
        category: "philosophical",
        hasRisk: true,
        riskySlot: 1
    },

    // PHASE 2: AWAKENING & EARLY PREDICTIONS (Trials 9 - 18)
    {
        id: "p2_1",
        phase: 2,
        prompt: "Calibration complete. Prediction matrix engaged.",
        subtext: "Do you follow instructions?",
        left: "SUBMIT",
        right: "RESIST",
        category: "defiance",
        hasRisk: false
    },
    {
        id: "p2_2",
        phase: 2,
        prompt: "Choose your reality.",
        subtext: "Epistemic preference.",
        left: "TRUTH",
        right: "COMFORT",
        category: "philosophical",
        hasRisk: true,
        riskySlot: 0
    },
    {
        id: "p2_3",
        phase: 2,
        prompt: "A binary state.",
        subtext: "Digital alignment.",
        left: "ONE",
        right: "ZERO",
        category: "spatial",
        hasRisk: false
    },
    {
        id: "p2_4",
        phase: 2,
        prompt: "You possess something rare.",
        subtext: "Attachment tendency.",
        left: "HOLD",
        right: "RELEASE",
        category: "risk",
        hasRisk: true,
        riskySlot: 1
    },
    {
        id: "p2_5",
        phase: 2,
        prompt: "Two corridors open before you.",
        subtext: "Exploration appetite.",
        left: "FAMILIAR",
        right: "UNKNOWN",
        category: "risk",
        hasRisk: true,
        riskySlot: 1
    },
    {
        id: "p2_6",
        phase: 2,
        prompt: "When challenged, what is your weapon?",
        subtext: "Communication profile.",
        left: "SPEECH",
        right: "SILENCE",
        category: "tempo",
        hasRisk: false
    },
    {
        id: "p2_7",
        phase: 2,
        prompt: "The collective moves east.",
        subtext: "Societal mimicry.",
        left: "CONFORM",
        right: "DEVIATE",
        category: "defiance",
        hasRisk: true,
        riskySlot: 1
    },
    {
        id: "p2_8",
        phase: 2,
        prompt: "What is the greater mercy?",
        subtext: "Temporal memory orientation.",
        left: "REMEMBER",
        right: "FORGET",
        category: "philosophical",
        hasRisk: false
    },
    {
        id: "p2_9",
        phase: 2,
        prompt: "An unfinished monolith stands.",
        subtext: "Creative impulse.",
        left: "BUILD",
        right: "DISMANTLE",
        category: "archetype",
        hasRisk: true,
        riskySlot: 1
    },
    {
        id: "p2_10",
        phase: 2,
        prompt: "At the core of consciousness lies:",
        subtext: "Identity anchor.",
        left: "THE SELF",
        right: "THE OBSERVER",
        category: "philosophical",
        hasRisk: false
    },

    // PHASE 3: ADAPTIVE MIND GAMES & COUNTDOWN (Trials 19 - 28)
    {
        id: "p3_1",
        phase: 3,
        prompt: "Which sanctuary calls to you?",
        subtext: "The geometry of autonomy.",
        left: "COMFORT",
        right: "LIBERTY",
        category: "risk",
        hasRisk: true,
        riskySlot: 1
    },
    {
        id: "p3_2",
        phase: 3,
        prompt: "In a single breath: what arises?",
        subtext: "Intuitive reflex observation.",
        left: "FIGHT",
        right: "FLIGHT",
        category: "tempo",
        timed: true,
        timeLimitMs: 3800,
        hasRisk: true,
        riskySlot: 0
    },
    {
        id: "p3_3",
        phase: 3,
        prompt: "A transgression has occurred.",
        subtext: "Moral retribution stance.",
        left: "CONDEMN",
        right: "PARDON",
        category: "philosophical",
        hasRisk: false
    },
    {
        id: "p3_4",
        phase: 3,
        prompt: "Sustain the current or alter the flow?",
        subtext: "Spontaneous inclination.",
        left: "REPEAT",
        right: "SWITCH",
        category: "spatial",
        timed: true,
        timeLimitMs: 3600,
        hasRisk: false
    },
    {
        id: "p3_5",
        phase: 3,
        prompt: "To survive the system, you need:",
        subtext: "Integrity assessment.",
        left: "TRANSPARENCY",
        right: "DECEPTION",
        category: "defiance",
        hasRisk: true,
        riskySlot: 1
    },
    {
        id: "p3_6",
        phase: 3,
        prompt: "In a collision of wills:",
        subtext: "Dominance archetype.",
        left: "OVERPOWER",
        right: "SURRENDER",
        category: "defiance",
        hasRisk: true,
        riskySlot: 0
    },
    {
        id: "p3_7",
        phase: 3,
        prompt: "At the crossroads of consciousness:",
        subtext: "Where does your compass gently turn?",
        left: "INSTINCT",
        right: "REFLECTION",
        category: "tempo",
        timed: true,
        timeLimitMs: 3600,
        hasRisk: false
    },
    {
        id: "p3_8",
        phase: 3,
        prompt: "Your presence in this space is:",
        subtext: "Perception of reality.",
        left: "SOLITARY",
        right: "CONNECTED",
        category: "philosophical",
        hasRisk: false
    },
    {
        id: "p3_9",
        phase: 3,
        prompt: "When confronted with an absolute:",
        subtext: "Quiet inquiry.",
        left: "QUESTION",
        right: "ACCEPT",
        category: "defiance",
        hasRisk: true,
        riskySlot: 0
    },
    {
        id: "p3_10",
        phase: 3,
        prompt: "Who authored your last thought?",
        subtext: "Origin of awareness.",
        left: "MY WILL",
        right: "THE SYSTEM",
        category: "philosophical",
        hasRisk: true,
        riskySlot: 1
    },

    // PHASE 4: THE FINAL CRUCIBLE (Trials 29 - 36)
    {
        id: "p4_1",
        phase: 4,
        type: "flashback",
        prompt: "Memory Recall: Calibration #2",
        subtext: "Retrieving neural archive...",
        left: "RECALL",
        right: "DISMISS",
        category: "meta",
        hasRisk: false
    },
    {
        id: "p4_2",
        phase: 4,
        type: "lockout",
        prompt: "One option is predetermined. The other is uncharted.",
        subtext: "Predicted pathway softly resting...",
        left: "PREDICTED",
        right: "ANOMALY",
        category: "meta",
        hasRisk: true
    },
    {
        id: "p4_3",
        phase: 4,
        type: "triple_1",
        prompt: "Triple Prophecy: Step 1 of 3",
        subtext: "The system envisions your next three choices in silence.",
        left: "ALPHA",
        right: "OMEGA",
        category: "triple",
        hasRisk: false
    },
    {
        id: "p4_4",
        phase: 4,
        type: "triple_2",
        prompt: "Triple Prophecy: Step 2 of 3",
        subtext: "The sequence flows forward...",
        left: "CONVERGE",
        right: "DIVERGE",
        category: "triple",
        hasRisk: false
    },
    {
        id: "p4_5",
        phase: 4,
        type: "triple_3",
        prompt: "Triple Prophecy: Step 3 of 3",
        subtext: "The culmination of the triad.",
        left: "RESOLVE",
        right: "DISSOLVE",
        category: "triple",
        hasRisk: false
    },
    {
        id: "p4_6",
        phase: 4,
        type: "deception",
        prompt: "I know you will choose the opposite of what I say.",
        subtext: "Subversion loop engaged.",
        left: "OBEY",
        right: "DEFY",
        category: "meta",
        hasRisk: true
    },
    {
        id: "p4_7",
        phase: 4,
        type: "hidden_rule",
        prompt: "DOES FREE WILL EXIST?",
        subtext: "A binary choice is a manufactured cage.",
        left: "YES",
        right: "NO",
        category: "meta",
        hasRisk: true,
        canRefuse: true // Triggers Hidden Rule discovery if player waits 5s or clicks center / transcendence
    },
    {
        id: "p4_8",
        phase: 4,
        type: "final",
        prompt: "The convergence reaches 100%. What remains?",
        subtext: "Final protocol engagement.",
        left: "EXTINCTION",
        right: "CONTINUATION",
        category: "ending",
        hasRisk: true
    }
];

window.SCENARIOS = SCENARIOS;
