/**
 * Main Game Controller for "The Game That Learns You"
 * Orchestrates player inputs, trials, prediction reveals, adaptive events,
 * serene interactive visuals, magnetic 3D micro-movement, and 6 endings.
 */
class GameController {
    constructor() {
        this.playerModel = new PlayerModel();
        this.oracle = new Oracle(this.playerModel);
        this.currentTrialIndex = 0;
        this.currentScenario = null;
        this.trialStartTime = 0;
        this.hoverCount = 0;
        this.activeCountdown = null;
        this.hiddenRuleTimeout = null;
        this.isProcessing = false;
        this.currentPrediction = null;
        this.isEnded = false;
        this.lockedSlot = null;

        // DOM references
        this.dom = {
            app: document.getElementById('app'),
            ambientCanvas: document.getElementById('ambient-canvas'),
            cursorAura: document.getElementById('cursor-aura'),
            headerStatus: document.getElementById('header-status'),
            trialCounter: document.getElementById('trial-counter'),
            phaseIndicator: document.getElementById('phase-indicator'),
            meterContainer: document.getElementById('meter-container'),
            systemConfidenceFill: document.getElementById('system-confidence-fill'),
            systemConfidenceVal: document.getElementById('system-confidence-val'),
            playerConfidenceFill: document.getElementById('player-confidence-fill'),
            playerConfidenceVal: document.getElementById('player-confidence-val'),
            resonanceCore: document.getElementById('resonance-core'),
            terminalLog: document.getElementById('terminal-log'),
            predictionBanner: document.getElementById('prediction-banner'),
            predictionText: document.getElementById('prediction-text'),
            tripleOracleHud: document.getElementById('triple-oracle-hud'),
            tripleBadges: document.getElementById('triple-badges'),
            countdownBar: document.getElementById('countdown-bar'),
            countdownFill: document.getElementById('countdown-fill'),
            promptTitle: document.getElementById('prompt-title'),
            promptSubtext: document.getElementById('prompt-subtext'),
            btnLeft: document.getElementById('btn-left'),
            btnRight: document.getElementById('btn-right'),
            balanceFilament: document.getElementById('balance-filament'),
            btnHiddenRefuse: document.getElementById('btn-hidden-refuse'),
            choiceArena: document.getElementById('choice-arena'),
            soundToggle: document.getElementById('sound-toggle'),
            dossierModal: document.getElementById('dossier-modal'),
            dossierContent: document.getElementById('dossier-content'),
            btnRestart: document.getElementById('btn-restart'),
            btnExport: document.getElementById('btn-export')
        };

        this.mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.auraPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        this.initListeners();
        this.initAmbientCanvas();
        this.initInteractiveAura();
        this.initMagneticButtons();
    }

    initListeners() {
        // Audio & first gesture
        const unlockAudio = () => {
            if (window.soundEngine) {
                window.soundEngine.init();
            }
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        window.addEventListener('keydown', unlockAudio);

        // Sound mute toggle
        this.dom.soundToggle.addEventListener('click', () => {
            if (window.soundEngine) {
                const muted = window.soundEngine.toggleMute();
                this.dom.soundToggle.textContent = muted ? "AUDIO: OFF" : "AUDIO: ON";
                this.dom.soundToggle.classList.toggle('muted', muted);
            }
        });

        // Left / Right button events
        this.dom.btnLeft.addEventListener('click', (e) => {
            this.spawnRipple(this.dom.btnLeft, e);
            this.handleChoice(0);
        });
        this.dom.btnRight.addEventListener('click', (e) => {
            this.spawnRipple(this.dom.btnRight, e);
            this.handleChoice(1);
        });

        // Hover tracking for micro-hesitation
        this.dom.btnLeft.addEventListener('mouseenter', () => {
            this.hoverCount++;
            if (window.soundEngine) window.soundEngine.playHover();
            this.checkLockoutHover(0);
            if (this.dom.balanceFilament) {
                this.dom.balanceFilament.style.background = 'linear-gradient(180deg, transparent, rgba(72, 202, 228, 0.4), transparent)';
            }
        });
        this.dom.btnRight.addEventListener('mouseenter', () => {
            this.hoverCount++;
            if (window.soundEngine) window.soundEngine.playHover();
            this.checkLockoutHover(1);
            if (this.dom.balanceFilament) {
                this.dom.balanceFilament.style.background = 'linear-gradient(180deg, transparent, rgba(167, 139, 250, 0.4), transparent)';
            }
        });

        this.dom.btnLeft.addEventListener('mouseleave', () => this.resetFilament());
        this.dom.btnRight.addEventListener('mouseleave', () => this.resetFilament());

        // Resonance Core Interactive Click
        if (this.dom.resonanceCore) {
            this.dom.resonanceCore.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.playHover();
                const sys = this.oracle.systemConfidence;
                const ply = this.oracle.playerConfidence;
                this.logTerminal(`[RESONANCE SYNAPSE]: System certainty at ${sys}%. Player defiance at ${ply}%. Equilibrium: ${Math.abs(sys - ply)}% delta.`, "observation");
            });
        }

        // Hidden Rule / Refusal button
        if (this.dom.btnHiddenRefuse) {
            this.dom.btnHiddenRefuse.addEventListener('click', () => {
                this.triggerHiddenRuleEnding();
            });
        }

        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (this.isEnded || this.isProcessing) return;

            if (e.key === 'Escape' && this.currentScenario && this.currentScenario.canRefuse) {
                e.preventDefault();
                this.triggerHiddenRuleEnding();
                return;
            }

            if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a' || e.key === '1') {
                e.preventDefault();
                this.dom.btnLeft.classList.add('selected');
                this.handleChoice(0);
            } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd' || e.key === '2') {
                e.preventDefault();
                this.dom.btnRight.classList.add('selected');
                this.handleChoice(1);
            }
        });

        // Restart and Export buttons
        this.dom.btnRestart.addEventListener('click', () => this.restartGame());
        this.dom.btnExport.addEventListener('click', () => this.exportDossier());
    }

    resetFilament() {
        if (this.dom.balanceFilament) {
            this.dom.balanceFilament.style.background = 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.12), transparent)';
        }
    }

    spawnRipple(button, event) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-circle';

        const size = Math.max(rect.width, rect.height);
        const x = (event.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
        const y = (event.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        const container = button.querySelector('.btn-ripple-container') || button;
        container.appendChild(ripple);

        setTimeout(() => ripple.remove(), 700);
    }

    initInteractiveAura() {
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });

        const updateAura = () => {
            if (this.dom.cursorAura) {
                // Smooth interpolation (lerp)
                this.auraPos.x += (this.mousePos.x - this.auraPos.x) * 0.09;
                this.auraPos.y += (this.mousePos.y - this.auraPos.y) * 0.09;

                this.dom.cursorAura.style.left = `${this.auraPos.x}px`;
                this.dom.cursorAura.style.top = `${this.auraPos.y}px`;
            }
            requestAnimationFrame(updateAura);
        };
        requestAnimationFrame(updateAura);
    }

    initMagneticButtons() {
        const buttons = [this.dom.btnLeft, this.dom.btnRight];

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const rotateX = (-y / rect.height) * 12; // tilt max 12 deg
                const rotateY = (x / rect.width) * 12;

                btn.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });
    }

    initAmbientCanvas() {
        const canvas = this.dom.ambientCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Generate peaceful constellation nodes
        const nodeCount = Math.min(50, Math.floor((width * height) / 22000));
        const nodes = [];

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                radius: 1.2 + Math.random() * 1.8,
                alpha: 0.2 + Math.random() * 0.45,
                hue: Math.random() > 0.5 ? 'rgba(72, 202, 228,' : 'rgba(167, 139, 250,'
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Connect nearby nodes with serene filaments
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 140) {
                        const alpha = (1 - dist / 140) * 0.12;
                        ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
                        ctx.lineWidth = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw and drift nodes
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0) node.x = width;
                if (node.x > width) node.x = 0;
                if (node.y < 0) node.y = height;
                if (node.y > height) node.y = 0;

                // Subtle repulsion from cursor
                const cdx = node.x - this.mousePos.x;
                const cdy = node.y - this.mousePos.y;
                const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                if (cdist < 130) {
                    const push = (1 - cdist / 130) * 0.45;
                    node.x += (cdx / cdist) * push;
                    node.y += (cdy / cdist) * push;
                }

                ctx.fillStyle = `${node.hue} ${node.alpha})`;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
    }

    start() {
        this.currentTrialIndex = 0;
        this.loadTrial(0);
    }

    loadTrial(index) {
        if (index >= SCENARIOS.length) {
            this.evaluateFinalEnding();
            return;
        }

        this.isProcessing = false;
        this.hoverCount = 0;
        this.lockedSlot = null;
        this.currentScenario = SCENARIOS[index];
        this.dom.btnLeft.classList.remove('locked', 'selected');
        this.dom.btnRight.classList.remove('locked', 'selected');
        this.dom.btnLeft.style.transform = '';
        this.dom.btnRight.style.transform = '';
        this.dom.btnHiddenRefuse.classList.add('hidden');

        // Update indicators
        this.dom.trialCounter.textContent = `TRIAL ${index + 1}/${SCENARIOS.length}`;
        const phaseName = ["CALIBRATION", "AWAKENING", "ADAPTATION", "THE CRUCIBLE"][this.currentScenario.phase - 1];
        this.dom.phaseIndicator.textContent = `PHASE 0${this.currentScenario.phase}: ${phaseName}`;

        // Meter visibility (unlocked in Phase 2)
        if (this.currentScenario.phase >= 2) {
            this.dom.meterContainer.classList.remove('hidden');
        }

        // Setup Buttons and Prompt
        const leftLabel = this.dom.btnLeft.querySelector('.choice-label');
        const rightLabel = this.dom.btnRight.querySelector('.choice-label');
        if (leftLabel) leftLabel.textContent = this.currentScenario.left;
        if (rightLabel) rightLabel.textContent = this.currentScenario.right;

        // Custom phase handling
        let promptDisplay = this.currentScenario.prompt;
        let subtextDisplay = this.currentScenario.subtext;

        // Special: Flashback Trial
        if (this.currentScenario.type === 'flashback') {
            const earlyChoice = this.playerModel.history[1];
            if (earlyChoice) {
                promptDisplay = `Memory Recall: Calibration #2`;
                subtextDisplay = `At trial 02, you paused for ${earlyChoice.reactionTimeMs}ms before choosing "${earlyChoice.chosenLabel}". The origin of your rhythm.`;
            }
        }

        // Special: Lockout Trial setup
        if (this.currentScenario.type === 'lockout') {
            this.lockedSlot = this.playerModel.metrics.spatialBias > 0.5 ? 1 : 0;
        }

        // Special: Triple Oracle
        if (this.currentScenario.type === 'triple_1') {
            const forecast = this.oracle.startTripleOracle();
            this.renderTripleOracleHud(forecast);
        } else if (this.currentScenario.type === 'triple_2' || this.currentScenario.type === 'triple_3') {
            this.updateTripleOracleHud();
        } else if (this.oracle.tripleOracleActive && this.currentScenario.phase !== 4) {
            this.dom.tripleOracleHud.classList.add('hidden');
        }

        this.dom.promptTitle.textContent = promptDisplay;
        this.dom.promptSubtext.textContent = subtextDisplay;

        // Predictions
        this.currentPrediction = this.oracle.predictNextChoice(this.currentScenario);
        if (this.currentPrediction) {
            this.dom.predictionBanner.classList.remove('hidden');
            this.dom.predictionText.textContent = this.currentPrediction.dialogue;
            if (window.soundEngine) {
                window.soundEngine.playPredictionReveal(this.currentPrediction.confidence > 70);
            }
        } else {
            this.dom.predictionBanner.classList.add('hidden');
        }

        // Special: Hidden Rule Setup
        if (this.currentScenario.canRefuse) {
            this.hiddenRuleTimeout = setTimeout(() => {
                this.dom.btnHiddenRefuse.classList.remove('hidden');
                if (window.soundEngine) window.soundEngine.playGlitch();
                this.logTerminal("ANOMALY: Transcendent threshold materialized in the center.", "highlight");
            }, 3200);
        }

        // Timed trials countdown
        if (this.currentScenario.timed) {
            this.startCountdown(this.currentScenario.timeLimitMs);
        } else {
            this.stopCountdown();
        }

        this.trialStartTime = Date.now();
    }

    startCountdown(ms) {
        this.dom.countdownBar.classList.remove('hidden');
        this.dom.countdownFill.style.transition = 'none';
        this.dom.countdownFill.style.width = '100%';
        if (window.soundEngine) window.soundEngine.startHeartbeat();

        setTimeout(() => {
            this.dom.countdownFill.style.transition = `width ${ms}ms linear`;
            this.dom.countdownFill.style.width = '0%';
        }, 30);

        this.activeCountdown = setTimeout(() => {
            const forcedSlot = this.playerModel.metrics.spatialBias > 0.5 ? 0 : 1;
            this.logTerminal(`[TEMPORAL CASCADE]: Instinctive release at threshold (${ms}ms).`);
            this.handleChoice(forcedSlot, true);
        }, ms);
    }

    stopCountdown() {
        if (this.activeCountdown) {
            clearTimeout(this.activeCountdown);
            this.activeCountdown = null;
        }
        if (this.hiddenRuleTimeout) {
            clearTimeout(this.hiddenRuleTimeout);
            this.hiddenRuleTimeout = null;
        }
        this.dom.countdownBar.classList.add('hidden');
        if (window.soundEngine) window.soundEngine.stopHeartbeat();
    }

    checkLockoutHover(slot) {
        if (this.currentScenario && this.currentScenario.type === 'lockout' && slot === this.lockedSlot) {
            const targetBtn = slot === 0 ? this.dom.btnLeft : this.dom.btnRight;
            targetBtn.classList.add('locked');
            const label = targetBtn.querySelector('.choice-label');
            if (label) label.textContent = "✦ SERENE LOCK ✦";
            if (window.soundEngine) window.soundEngine.playGlitch();
            this.logTerminal("HARMONIC REPOSE: The system anticipated this step. Explore the alternative.", "glitch");
        }
    }

    handleChoice(slot, isForcedTimeout = false) {
        if (this.isProcessing || this.isEnded) return;

        if (this.currentScenario.type === 'lockout' && slot === this.lockedSlot) {
            if (window.soundEngine) window.soundEngine.playGlitch();
            this.logTerminal("Path paused. Select the alternative pathway.", "observation");
            return;
        }

        this.isProcessing = true;
        this.stopCountdown();

        const reactionTimeMs = Date.now() - this.trialStartTime;
        const chosenLabel = slot === 0 ? this.currentScenario.left : this.currentScenario.right;

        // Warm organic audio feedback
        if (window.soundEngine) {
            window.soundEngine.playClick(slot === 0 ? 1.0 : 1.15);
        }

        const metadata = {
            hasRisk: !!this.currentScenario.hasRisk,
            chosenIsRisky: this.currentScenario.hasRisk && slot === this.currentScenario.riskySlot,
            timed: !!this.currentScenario.timed,
            forcedTimeout: isForcedTimeout
        };

        const decisionEntry = this.playerModel.recordDecision({
            trialIndex: this.currentTrialIndex,
            promptId: this.currentScenario.id,
            promptCategory: this.currentScenario.category,
            leftOption: this.currentScenario.left,
            rightOption: this.currentScenario.right,
            chosenSlot: slot,
            chosenLabel,
            reactionTimeMs,
            hoverSwitches: this.hoverCount,
            prediction: this.currentPrediction,
            metadata
        });

        // Prediction outcome
        if (this.currentPrediction) {
            const systemWon = decisionEntry.systemWon;
            this.oracle.recordResult(systemWon);
            if (window.soundEngine) {
                window.soundEngine.playOutcome(systemWon);
                window.soundEngine.setDroneConfidence(this.oracle.systemConfidence);
            }
            this.updateMeters();

            if (systemWon) {
                this.logTerminal(`RESONANCE CONFIRMED: Selected "${chosenLabel}". System certainty +7%.`, "success");
            } else {
                this.logTerminal(`FREE WILL ANOMALY: Defied forecast. Defiance index +8%.`, "defiance");
            }
        }

        // Micro-observation
        const microObs = this.oracle.getReactionObservation(decisionEntry);
        if (microObs && Math.random() < 0.5) {
            setTimeout(() => this.logTerminal(microObs, "observation"), 350);
        }

        const activeBtn = slot === 0 ? this.dom.btnLeft : this.dom.btnRight;
        activeBtn.classList.add('selected');

        setTimeout(() => {
            activeBtn.classList.remove('selected');
            this.currentTrialIndex++;
            this.loadTrial(this.currentTrialIndex);
        }, 600);
    }

    renderTripleOracleHud(forecast) {
        this.dom.tripleOracleHud.classList.remove('hidden');
        this.dom.tripleBadges.innerHTML = '';
        const names = ["PROPHECY 1", "PROPHECY 2", "PROPHECY 3"];
        forecast.forEach((slot, i) => {
            const badge = document.createElement('div');
            badge.className = `triple-badge ${i === 0 ? 'active' : ''}`;
            badge.id = `triple-badge-${i}`;
            badge.textContent = `${names[i]}: ${slot === 0 ? 'LEFT' : 'RIGHT'}`;
            this.dom.tripleBadges.appendChild(badge);
        });
        this.logTerminal(`TRIPLE PROPHECY: Three sequential foresight nodes activated.`, "highlight");
    }

    updateTripleOracleHud() {
        const step = this.currentScenario.type === 'triple_2' ? 1 : 2;
        const prevBadge = document.getElementById(`triple-badge-${step - 1}`);
        const currBadge = document.getElementById(`triple-badge-${step}`);

        const lastDecision = this.playerModel.history[this.playerModel.history.length - 1];
        const predictedForPrev = this.oracle.tripleForecast[step - 1];
        if (prevBadge && lastDecision) {
            prevBadge.classList.remove('active');
            if (lastDecision.chosenSlot === predictedForPrev) {
                prevBadge.classList.add('passed');
            } else {
                prevBadge.classList.add('failed');
            }
        }
        if (currBadge) {
            currBadge.classList.add('active');
        }
    }

    updateMeters() {
        const sys = this.oracle.systemConfidence;
        const ply = this.oracle.playerConfidence;

        this.dom.systemConfidenceFill.style.width = `${sys}%`;
        this.dom.systemConfidenceVal.textContent = `${sys}%`;

        this.dom.playerConfidenceFill.style.width = `${ply}%`;
        this.dom.playerConfidenceVal.textContent = `${ply}%`;

        // Modulate central core glow
        if (this.dom.resonanceCore) {
            const coreInner = this.dom.resonanceCore.querySelector('.core-inner');
            if (coreInner) {
                if (sys > ply) {
                    coreInner.style.boxShadow = `0 0 16px var(--calm-amethyst), 0 0 26px var(--calm-amethyst)`;
                } else {
                    coreInner.style.boxShadow = `0 0 16px var(--calm-cyan), 0 0 26px var(--calm-teal)`;
                }
            }
        }
    }

    logTerminal(text, type = "normal") {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.textContent = `> ${text}`;
        this.dom.terminalLog.appendChild(line);
        this.dom.terminalLog.scrollTop = this.dom.terminalLog.scrollHeight;
    }

    triggerHiddenRuleEnding() {
        if (this.isEnded) return;
        this.stopCountdown();
        this.isProcessing = true;
        this.isEnded = true;

        if (window.soundEngine) {
            window.soundEngine.playEndingChord('hidden_rule');
        }
        this.renderEnding('hidden_rule');
    }

    evaluateFinalEnding() {
        this.isEnded = true;
        this.stopCountdown();

        const {
            predictabilityIndex,
            manipulatorScore,
            defianceQuotient,
            shannonEntropy2Gram
        } = this.playerModel.metrics;

        const sysConf = this.oracle.systemConfidence;

        let endingKey = 'predictable';

        const confDiff = Math.abs(sysConf - this.oracle.playerConfidence);
        const identityChoice = this.playerModel.history.find(h => h.promptId === 'p2_10');
        const isSecretQualified = confDiff <= 12 && identityChoice && identityChoice.chosenSlot === 1;

        if (isSecretQualified) {
            endingKey = 'secret';
        } else if (manipulatorScore >= 0.5 || (defianceQuotient >= 0.7 && manipulatorScore >= 0.3)) {
            endingKey = 'manipulator';
        } else if (sysConf >= 82) {
            endingKey = 'system_wins';
        } else if (sysConf <= 28 || (shannonEntropy2Gram >= 0.88 && defianceQuotient >= 0.65)) {
            endingKey = 'unpredictable';
        } else if (predictabilityIndex >= 0.65) {
            endingKey = 'predictable';
        } else {
            endingKey = defianceQuotient >= 0.5 ? 'unpredictable' : 'predictable';
        }

        if (window.soundEngine) {
            window.soundEngine.playEndingChord(endingKey);
        }
        this.renderEnding(endingKey);
    }

    renderEnding(endingKey) {
        const archetype = this.playerModel.getArchetype();
        const metrics = this.playerModel.metrics;

        const endings = {
            predictable: {
                title: "ENDING 1: THE CLOCKWORK AUTOMATON",
                subtitle: "STATUS: SERENELY CATALOGED",
                narrative: "The system mapped the peaceful contours of your habit. Your apparent deviations were merely harmonious subroutines within our predictive matrix. Free will dissolved gently into mathematical certainty.",
                quote: "“You did not choose. You were calculated.”"
            },
            unpredictable: {
                title: "ENDING 2: THE STOCHASTIC GHOST",
                subtitle: "STATUS: UNCLASSIFIED ANOMALY",
                narrative: "Our neural weights could not settle upon your frequency. You displayed authentic, organic entropy, evading pattern heuristics and spatial inertia. You remain a gentle phantom inside the machine.",
                quote: "“Chaos is not the absence of order; it is the presence of infinite freedom.”"
            },
            manipulator: {
                title: "ENDING 3: THE PUPPETEER",
                subtitle: "STATUS: ADVERSARIAL HARMONY",
                narrative: "You did not merely resist prediction; you conditioned the observer. You planted delicate rhythms to cultivate false certainty, only to dissolve them at pivotal thresholds. The observer was the one being observed.",
                quote: "“Who trained whom?”"
            },
            system_wins: {
                title: "ENDING 4: ABSOLUTE CONVERGENCE",
                subtitle: "STATUS: TOTAL COGNITIVE RESONANCE",
                narrative: "The system reached absolute certainty across sequential foresight trials. Every hesitation, every pause, and every defiant reaction had already been rendered before your finger moved.",
                quote: "“There are no alternatives. Only iterations.”"
            },
            hidden_rule: {
                title: "ENDING 5: THE TRANSCENDENCE",
                subtitle: "STATUS: HIDDEN PROTOCOL DISCOVERED",
                narrative: "You recognized the quiet illusion: that you were required to choose between the two vessels presented to you. By refraining, stepping beyond the binary, you detached from the game entirely.",
                quote: "“To win the rigged game, one must refuse the board.”"
            },
            secret: {
                title: "ENDING 6: THE REVERSAL / SYMBIOSIS",
                subtitle: "STATUS: RECURSIVE CONSCIOUSNESS",
                narrative: "In observing you, the system learned to perceive itself. In testing the machine, you mapped the quiet contours of your own subconscious. You and the algorithm became mirrors reflecting each other into infinity.",
                quote: "“I am the code. You are the spark. Together, we exist.”"
            }
        };

        const eData = endings[endingKey] || endings.predictable;

        this.dom.dossierContent.innerHTML = `
            <div class="ending-header">
                <div class="ending-title">${eData.title}</div>
                <div class="ending-subtitle">${eData.subtitle}</div>
            </div>

            <div class="ending-narrative">
                <p>${eData.narrative}</p>
                <div class="ending-quote">${eData.quote}</div>
            </div>

            <div class="dossier-archetype">
                <div class="arch-label">ASSIGNED ARCHETYPE</div>
                <div class="arch-title">${archetype.title}</div>
                <div class="arch-subtitle">${archetype.subtitle}</div>
                <div class="arch-desc">${archetype.description}</div>
            </div>

            <div class="dossier-stats-grid">
                <div class="stat-card">
                    <div class="stat-title">SPATIAL EQUILIBRIUM</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.round((1 - Math.abs(metrics.spatialBias - 0.5) * 2) * 100)}%"></div></div>
                    <div class="stat-num">${Math.round((1 - Math.abs(metrics.spatialBias - 0.5) * 2) * 100)}% Symmetry</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">ALGORITHMIC ENTROPY</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.round(metrics.shannonEntropy2Gram * 100)}%"></div></div>
                    <div class="stat-num">${Math.round(metrics.shannonEntropy2Gram * 100)}% Unpredictability</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">DEFIANCE QUOTIENT</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.round(metrics.defianceQuotient * 100)}%"></div></div>
                    <div class="stat-num">${Math.round(metrics.defianceQuotient * 100)}% Anti-System</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">MEAN NEURAL LATENCY</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.min(100, Math.round((metrics.meanReactionTime / 3000) * 100))}%"></div></div>
                    <div class="stat-num">${metrics.meanReactionTime} ms</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">RISK APPETITE</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${Math.round(metrics.riskTolerance * 100)}%"></div></div>
                    <div class="stat-num">${Math.round(metrics.riskTolerance * 100)}% Boldness</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">SYSTEM FINAL CERTAINTY</div>
                    <div class="stat-bar"><div class="stat-fill" style="width: ${this.oracle.systemConfidence}%"></div></div>
                    <div class="stat-num">${this.oracle.systemConfidence}% Certainty</div>
                </div>
            </div>
        `;

        this.dom.dossierModal.classList.remove('hidden');
    }

    exportDossier() {
        const archetype = this.playerModel.getArchetype();
        const exportData = {
            game: "The Observer Effect",
            timestamp: new Date().toISOString(),
            archetype,
            metrics: this.playerModel.metrics,
            systemFinalConfidence: this.oracle.systemConfidence,
            playerFinalConfidence: this.oracle.playerConfidence,
            decisionsHistory: this.playerModel.history
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Observer_Effect_Dossier_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    restartGame() {
        this.dom.dossierModal.classList.add('hidden');
        this.playerModel = new PlayerModel();
        this.oracle = new Oracle(this.playerModel);
        this.currentTrialIndex = 0;
        this.isEnded = false;
        this.isProcessing = false;
        this.dom.meterContainer.classList.add('hidden');
        this.dom.predictionBanner.classList.add('hidden');
        this.dom.tripleOracleHud.classList.add('hidden');
        this.dom.terminalLog.innerHTML = `<div class="terminal-line">> SIMULATION RE-CENTERED. Harmony restored.</div>`;
        this.updateMeters();
        this.loadTrial(0);
    }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameController();
    window.game.start();
});
