// AI Assistant Application JavaScript

class AIAssistant {
    constructor() {
        this.currentTheme = 'light';
        this.currentTab = 'chat';
        this.isTyping = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupChart();
        this.addWelcomeAnimation();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.nav-tab').dataset.tab);
            });
        });

        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Chat functionality
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(action => {
            action.addEventListener('click', (e) => {
                const prompt = e.target.closest('.quick-action').dataset.prompt;
                this.insertQuickPrompt(prompt);
            });
        });

        // Tool cards
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolName = e.target.closest('.tool-card').querySelector('h3').textContent;
                this.launchTool(toolName);
            });
        });

        // New chat button
        document.querySelector('.new-chat-btn').addEventListener('click', () => {
            this.startNewChat();
        });

        // Conversation items
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchConversation(e.target.closest('.conversation-item'));
            });
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Add entrance animation
        const activeContent = document.getElementById(tabName);
        activeContent.style.opacity = '0';
        activeContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            activeContent.style.transition = 'all 0.3s ease';
            activeContent.style.opacity = '1';
            activeContent.style.transform = 'translateY(0)';
        }, 50);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        const themeIcon = document.querySelector('.theme-toggle i');
        themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Add a subtle animation
        themeIcon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeIcon.style.transform = 'rotate(0deg)';
        }, 300);
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTyping();

        // Simulate AI response
        setTimeout(() => {
            this.hideTyping();
            const response = this.generateAIResponse(message);
            this.addMessage(response, 'ai');
        }, Math.random() * 2000 + 1000);
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${sender === 'ai' ? 'fa-robot' : 'fa-user'}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(text)}</div>
                <div class="message-time">${currentTime}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add entrance animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(0)';
        }, 50);
    }

    formatMessage(text) {
        // Basic markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTyping() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add typing dots animation
        const style = document.createElement('style');
        style.textContent = `
            .typing-dots {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            .typing-dots span {
                width: 8px;
                height: 8px;
                background: var(--text-muted);
                border-radius: 50%;
                animation: typing 1.4s infinite ease-in-out;
            }
            .typing-dots span:nth-child(1) { animation-delay: 0s; }
            .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                30% { transform: translateY(-10px); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    hideTyping() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateAIResponse(userMessage) {
        const responses = {
            greeting: [
                "Hello! I'm here to help you with anything you need. What would you like to work on today?",
                "Hi there! I'm ready to assist you. How can I help?",
                "Greetings! I'm your AI assistant. What can I do for you?"
            ],
            code: [
                "I'd be happy to help you with coding! What programming language are you working with?",
                "Great! Let's dive into some code. What specific problem are you trying to solve?",
                "Coding assistance coming right up! Please share more details about what you're building."
            ],
            explain: [
                "I'd love to explain that for you! What specific concept would you like me to break down?",
                "Explanation mode activated! What topic should we explore together?",
                "Let me help clarify that. What would you like me to explain in detail?"
            ],
            creative: [
                "Time to get creative! I'm excited to help you brainstorm. What's your project about?",
                "Creativity is my specialty! What kind of ideas are you looking for?",
                "Let's unleash some creativity! Tell me more about what you're envisioning."
            ],
            default: [
                "That's an interesting question! Let me think about that for a moment. Based on what you've asked, I'd suggest we approach this systematically.",
                "I understand what you're looking for. Here's how I would recommend tackling this challenge...",
                "Great question! This is definitely something I can help with. Let me break this down for you step by step.",
                "I see what you're getting at. This is actually a fascinating topic that touches on several important concepts.",
                "Excellent point! I've helped many people with similar questions. Here's what I've learned works best..."
            ]
        };

        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
        } else if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('script')) {
            return responses.code[Math.floor(Math.random() * responses.code.length)];
        } else if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how does')) {
            return responses.explain[Math.floor(Math.random() * responses.explain.length)];
        } else if (lowerMessage.includes('creative') || lowerMessage.includes('idea') || lowerMessage.includes('brainstorm')) {
            return responses.creative[Math.floor(Math.random() * responses.creative.length)];
        } else {
            return responses.default[Math.floor(Math.random() * responses.default.length)];
        }
    }

    insertQuickPrompt(prompt) {
        const input = document.getElementById('chatInput');
        input.value = prompt;
        input.focus();
        
        // Add a subtle flash animation
        input.style.borderColor = 'var(--primary-color)';
        input.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        setTimeout(() => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }, 500);
    }

    launchTool(toolName) {
        this.showLoading();
        
        setTimeout(() => {
            this.hideLoading();
            this.addMessage(`🚀 Launching ${toolName}... This feature is coming soon! I'm currently in demonstration mode, but I'm designed to integrate with various AI tools and services.`, 'ai');
            
            // Switch to chat tab to show the message
            if (this.currentTab !== 'chat') {
                this.switchTab('chat');
            }
        }, 1500);
    }

    startNewChat() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        Hello! I'm your AI assistant. I can help you with various tasks including:
                        <ul>
                            <li>Answering questions and providing information</li>
                            <li>Code generation and review</li>
                            <li>Creative writing and brainstorming</li>
                            <li>Data analysis and visualization</li>
                            <li>And much more!</li>
                        </ul>
                        What would you like to work on today?
                    </div>
                    <div class="message-time">Just now</div>
                </div>
            </div>
        `;
        
        // Update conversation items
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('.conversation-item').classList.add('active');
    }

    switchConversation(item) {
        document.querySelectorAll('.conversation-item').forEach(conv => {
            conv.classList.remove('active');
        });
        item.classList.add('active');
        
        // Simulate loading different conversation
        this.startNewChat();
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    setupChart() {
        const ctx = document.getElementById('usageChart');
        if (!ctx) return;

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Conversations',
                    data: [65, 89, 120, 151, 187, 225, 247],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'AI Tools Used',
                    data: [12, 19, 25, 31, 42, 55, 63],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        }
                    },
                    x: {
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        }
                    }
                }
            }
        });

        // Update chart colors when theme changes
        const originalToggleTheme = this.toggleTheme.bind(this);
        this.toggleTheme = function() {
            originalToggleTheme();
            setTimeout(() => {
                chart.options.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
                chart.options.scales.y.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
                chart.options.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
                chart.options.scales.x.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
                chart.options.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
                chart.update();
            }, 100);
        };
    }

    addWelcomeAnimation() {
        // Add a subtle entrance animation to all main elements
        const animateElements = document.querySelectorAll('.header, .main-content');
        animateElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200 + 100);
        });

        // Add floating animation to tool cards
        setTimeout(() => {
            document.querySelectorAll('.tool-card').forEach((card, index) => {
                setTimeout(() => {
                    card.style.animation = `float 3s ease-in-out infinite ${index * 0.5}s`;
                }, index * 100);
            });
        }, 1000);

        // Add float animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIAssistant();
    
    // Add some sample interactions after a delay
    setTimeout(() => {
        const assistant = window.aiAssistant || new AIAssistant();
        
        // Simulate some initial activity
        const stats = document.querySelectorAll('.stat-card h3');
        stats.forEach((stat, index) => {
            const finalValue = stat.textContent;
            stat.textContent = '0';
            
            setTimeout(() => {
                animateNumber(stat, finalValue);
            }, index * 200 + 500);
        });
    }, 1000);
});

// Utility function to animate numbers
function animateNumber(element, finalValue) {
    const isPercentage = finalValue.includes('%');
    const isTime = finalValue.includes('h');
    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
    
    let current = 0;
    const increment = numericValue / 30;
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current).toString();
        if (isPercentage) displayValue += '%';
        if (isTime) displayValue += 'h';
        if (finalValue.includes(',')) {
            displayValue = displayValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        element.textContent = displayValue;
    }, 50);
}

// Add some interactive hover effects
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.tool-card, .stat-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            card.style.transform = `perspective(1000px) rotateX(${deltaY * -5}deg) rotateY(${deltaX * 5}deg) translateZ(10px)`;
        } else {
            card.style.transform = '';
        }
    });
});