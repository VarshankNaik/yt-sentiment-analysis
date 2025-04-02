document.addEventListener("DOMContentLoaded", async function () {
    // DOM Elements
    const videoTitle = document.getElementById("video-title");
    const commentsAnalyzed = document.getElementById("comments-analyzed");
    const videoDetails = document.getElementById("video-details");

    // Sentiment Elements
    const posPercent = document.getElementById("positive");
    const neuPercent = document.getElementById("neutral");
    const negPercent = document.getElementById("negative");
    const positiveBar = document.getElementById("positive-bar");
    const neutralBar = document.getElementById("neutral-bar");
    const negativeBar = document.getElementById("negative-bar");

    // Feature Score Elements
    const cameraScore = document.getElementById("camera-score");
    const batteryScore = document.getElementById("battery-score");
    const performanceScore = document.getElementById("performance-score");
    const displayScore = document.getElementById("display-score");

    // Feature Meter Elements
    const cameraMeter = document.getElementById("camera-meter");
    const batteryMeter = document.getElementById("battery-meter");
    const performanceMeter = document.getElementById("performance-meter");
    const displayMeter = document.getElementById("display-meter");

    // Comment List Elements
    const positiveCommentsList = document.getElementById("positive-comments-list");
    const neutralCommentsList = document.getElementById("neutral-comments-list");
    const negativeCommentsList = document.getElementById("negative-comments-list");

    // Chart Contexts
    const sentimentChartCtx = document.getElementById("sentimentChart").getContext("2d");
    const barChartCtx = document.getElementById("barChart").getContext("2d");
    const radarChartCtx = document.getElementById("radarChart").getContext("2d");

    // Charts container
    let charts = {
        sentimentChart: null,
        barChart: null,
        radarChart: null
    };

    // Enhanced color palette
    const chartColors = {
        positive: {
            main: '#4ade80',
            light: 'rgba(74, 222, 128, 0.8)',
            background: 'rgba(74, 222, 128, 0.2)'
        },
        neutral: {
            main: '#94a3b8',
            light: 'rgba(148, 163, 184, 0.8)',
            background: 'rgba(148, 163, 184, 0.2)'
        },
        negative: {
            main: '#f87171',
            light: 'rgba(248, 113, 113, 0.8)',
            background: 'rgba(248, 113, 113, 0.2)'
        },
        features: {
            camera: '#22d3ee',     // Cyan
            battery: '#818cf8',    // Indigo
            performance: '#fb923c', // Orange
            display: '#a78bfa'     // Purple
        },
        border: 'rgba(255, 255, 255, 0.2)',
        text: '#ffffff',
        background: '#16213e',
        gradient: {
            start: 'rgba(233, 69, 96, 0.8)',
            end: 'rgba(233, 69, 96, 0.1)'
        }
    };

    // Tab functionality
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            // Add active class to clicked button and corresponding content
            button.classList.add("active");
            const tabId = button.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // Show loading state
    commentsAnalyzed.textContent = "Analyzing comments...";
    showLoadingState();

    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        const videoUrl = tabs[0].url;

        // Check if this is a YouTube video URL
        if (!videoUrl.includes("youtube.com/watch")) {
            showError("Please open a YouTube video page");
            loadDummyData(); // Load sample data for UI demonstration
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: videoUrl })
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                showError(data.error);
                loadDummyData(); // Load sample data for UI demonstration
                return;
            }

            // Update UI with fetched data
            updateUI(data);

        } catch (error) {
            console.error("Error fetching data:", error);
            showError("Failed to connect to the server. Is the Flask server running?");
            loadDummyData(); // Load sample data for UI demonstration
        }
    });

    function showLoadingState() {
        // Show loading animation or placeholder
        charts.sentimentChart = createPlaceholderChart(sentimentChartCtx);
        charts.barChart = createPlaceholderChart(barChartCtx);
        charts.radarChart = createPlaceholderChart(radarChartCtx);
    }

    function createPlaceholderChart(ctx) {
        // Create gradient for placeholder
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(233, 69, 96, 0.5)');
        gradient.addColorStop(1, 'rgba(233, 69, 96, 0.1)');

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [1],
                    backgroundColor: [gradient],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                cutout: '80%'
            }
        });
    }

    function showError(message) {
        commentsAnalyzed.textContent = `Error: ${message}`;
        commentsAnalyzed.style.color = chartColors.negative.main;

        // Add a retry button
        const header = document.querySelector('header');
        if (!document.getElementById('retry-button')) {
            const retryButton = document.createElement('button');
            retryButton.id = 'retry-button';
            retryButton.className = 'retry-button';
            retryButton.textContent = 'Retry Connection';
            retryButton.addEventListener('click', () => {
                window.location.reload();
            });
            header.appendChild(retryButton);
        }
    }

    function loadDummyData() {
        // Sample data for demonstration when server is unavailable
        const dummyData = {
            video_details: {
                title: "Sample Video - Server Connection Demo",
                views: "10000",
                likes: "1000"
            },
            total_comments: 50,
            sentiment_summary: {
                Positive: 25,
                Neutral: 15,
                Negative: 10
            },
            feature_analysis: {
                camera: 8,
                battery: -3,
                performance: 5,
                display: 12
            },
            comments: [
                { comment: "This is a sample positive comment to demonstrate the UI.", sentiment: "Positive" },
                { comment: "Another positive comment about the features.", sentiment: "Positive" },
                { comment: "Neutral comment for demonstration purposes.", sentiment: "Neutral" },
                { comment: "Sample negative comment to show how negative feedback appears.", sentiment: "Negative" }
            ]
        };

        // Add demo indicator
        const footer = document.querySelector('footer');
        const demoNote = document.createElement('div');
        demoNote.className = 'demo-note';
        demoNote.textContent = 'DEMO MODE - Showing sample data due to server connection issue';
        demoNote.style.color = chartColors.negative.main;
        demoNote.style.fontWeight = 'bold';
        demoNote.style.padding = '5px';
        demoNote.style.marginTop = '10px';
        footer.appendChild(demoNote);

        // Update UI with dummy data
        updateUI(dummyData);
    }

    function updateUI(data) {
        // Update Video Information
        const videoInfo = data.video_details || {};

        videoTitle.textContent = videoInfo.title || "YouTube Sentiment Analysis";
        const views = parseInt(videoInfo.views || 0).toLocaleString();
        const likes = parseInt(videoInfo.likes || 0).toLocaleString();
        videoDetails.textContent = `Views: ${views} | Likes: ${likes}`;

        // Update Comment Count
        const totalComments = data.total_comments || 0;
        commentsAnalyzed.textContent = `Comments Analyzed: ${totalComments}`;
        commentsAnalyzed.style.color = ''; // Reset error color

        // Extract Sentiment Data
        const sentimentSummary = data.sentiment_summary || {};
        const positive = sentimentSummary.Positive || 0;
        const neutral = sentimentSummary.Neutral || 0;
        const negative = sentimentSummary.Negative || 0;
        const total = positive + neutral + negative;

        // Calculate Percentages
        const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;
        const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0;
        const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0;

        // Update Sentiment Text & Bars
        posPercent.textContent = `${positivePercent}%`;
        neuPercent.textContent = `${neutralPercent}%`;
        negPercent.textContent = `${negativePercent}%`;

        positiveBar.style.width = `${positivePercent}%`;
        neutralBar.style.width = `${neutralPercent}%`;
        negativeBar.style.width = `${negativePercent}%`;

        // Extract Feature Analysis
        const featureAnalysis = data.feature_analysis || {};
        const cameraVal = featureAnalysis.camera || 0;
        const batteryVal = featureAnalysis.battery || 0;
        const performanceVal = featureAnalysis.performance || 0;
        const displayVal = featureAnalysis.display || 0;

        // Get max absolute value for scaling
        const maxAbsValue = Math.max(
            Math.abs(cameraVal),
            Math.abs(batteryVal),
            Math.abs(performanceVal),
            Math.abs(displayVal),
            1 // Prevent division by zero
        );

        // Update Feature Scores & Meters
        updateFeatureCard('camera', cameraVal, maxAbsValue);
        updateFeatureCard('battery', batteryVal, maxAbsValue);
        updateFeatureCard('performance', performanceVal, maxAbsValue);
        updateFeatureCard('display', displayVal, maxAbsValue);

        // Populate Comments
        populateComments(data.comments || []);

        // Destroy existing charts to prevent duplicates
        destroyCharts();

        // Create/Update Charts
        charts.sentimentChart = createSentimentChart(sentimentChartCtx, positive, neutral, negative);
        charts.barChart = createFeatureBarChart(barChartCtx, featureAnalysis);
        charts.radarChart = createRadarChart(radarChartCtx, featureAnalysis, maxAbsValue);
    }

    function destroyCharts() {
        // Destroy existing charts to prevent duplicates
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }

    function updateFeatureCard(feature, value, maxValue) {
        const scoreElement = document.getElementById(`${feature}-score`);
        const meterElement = document.getElementById(`${feature}-meter`);
        const cardElement = document.getElementById(`${feature}-card`);

        // Update score text
        scoreElement.textContent = value;

        // Calculate percentage (0-100) based on value and maxValue
        const absValue = Math.abs(value);
        const percentage = (absValue / maxValue) * 100;

        // Update meter width
        meterElement.style.width = `${percentage}%`;

        // Update meter color based on positive/negative value
        if (value > 0) {
            meterElement.style.backgroundColor = chartColors.positive.main;
            cardElement.style.borderLeft = `3px solid ${chartColors.features[feature]}`;
        } else if (value < 0) {
            meterElement.style.backgroundColor = chartColors.negative.main;
            cardElement.style.borderLeft = `3px solid ${chartColors.features[feature]}`;
        } else {
            meterElement.style.backgroundColor = chartColors.neutral.main;
            cardElement.style.borderLeft = `3px solid ${chartColors.features[feature]}`;
        }
    }

    function populateComments(comments) {
        // Clear existing comments
        positiveCommentsList.innerHTML = '';
        neutralCommentsList.innerHTML = '';
        negativeCommentsList.innerHTML = '';

        // Count to track how many comments of each type we've added
        const commentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
        const MAX_COMMENTS = 5; // Maximum comments to show per category

        // Sort comments by sentiment
        comments.forEach(comment => {
            const sentiment = comment.sentiment;

            // Skip if we've already added enough of this sentiment type
            if (commentCounts[sentiment] >= MAX_COMMENTS) return;

            // Create comment element
            const commentElement = document.createElement('div');
            commentElement.className = `comment-item ${sentiment.toLowerCase()}`;

            // Truncate long comments
            let commentText = comment.comment;
            if (commentText.length > 100) {
                commentText = commentText.substring(0, 100) + '...';
            }

            // Remove HTML tags from comment text
            commentText = commentText.replace(/<[^>]*>/g, '');

            commentElement.textContent = commentText;

            // Add to appropriate list
            if (sentiment === 'Positive') {
                positiveCommentsList.appendChild(commentElement);
            } else if (sentiment === 'Neutral') {
                neutralCommentsList.appendChild(commentElement);
            } else if (sentiment === 'Negative') {
                negativeCommentsList.appendChild(commentElement);
            }

            commentCounts[sentiment]++;
        });

        // Show message if no comments for a category
        ['Positive', 'Neutral', 'Negative'].forEach(sentiment => {
            const listElement = document.getElementById(`${sentiment.toLowerCase()}-comments-list`);
            if (listElement.children.length === 0) {
                const noComments = document.createElement('div');
                noComments.className = 'no-comments';
                noComments.textContent = `No ${sentiment.toLowerCase()} comments found.`;
                listElement.appendChild(noComments);
            }
        });
    }

    function createSentimentChart(ctx, positive, neutral, negative) {
        // Create gradient backgrounds for sentiment chart
        const positiveGradient = ctx.createLinearGradient(0, 0, 0, 200);
        positiveGradient.addColorStop(0, chartColors.positive.main);
        positiveGradient.addColorStop(1, chartColors.positive.background);

        const neutralGradient = ctx.createLinearGradient(0, 0, 0, 200);
        neutralGradient.addColorStop(0, chartColors.neutral.main);
        neutralGradient.addColorStop(1, chartColors.neutral.background);

        const negativeGradient = ctx.createLinearGradient(0, 0, 0, 200);
        negativeGradient.addColorStop(0, chartColors.negative.main);
        negativeGradient.addColorStop(1, chartColors.negative.background);

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [positive, neutral, negative],
                    backgroundColor: [
                        positiveGradient,
                        neutralGradient,
                        negativeGradient
                    ],
                    borderWidth: 2,
                    borderColor: chartColors.border
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: chartColors.text,
                            font: {
                                size: 12
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: chartColors.text,
                        bodyColor: chartColors.text,
                        borderColor: chartColors.border,
                        borderWidth: 1,
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    function createFeatureBarChart(ctx, featureAnalysis) {
        const features = ['camera', 'battery', 'performance', 'display'];
        const values = features.map(feature => featureAnalysis[feature] || 0);

        // Create gradient backgrounds for each feature bar
        const featureColors = features.map(feature => {
            const gradient = ctx.createLinearGradient(0, 0, 200, 0);
            const baseColor = chartColors.features[feature];
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, baseColor + '80'); // Add transparency
            return gradient;
        });

        // Create border colors (slightly darker than main colors)
        const borderColors = features.map(feature => chartColors.features[feature]);

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Camera', 'Battery', 'Performance', 'Display'],
                datasets: [{
                    label: 'Sentiment Score',
                    data: values,
                    backgroundColor: featureColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: chartColors.text,
                        bodyColor: chartColors.text,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        displayColors: true,
                        caretSize: 6,
                        callbacks: {
                            title: function (tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function (context) {
                                const value = context.raw;
                                const sign = value >= 0 ? '+' : '';
                                return `Sentiment: ${sign}${value}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: chartColors.text,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: chartColors.text,
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }

    function createRadarChart(ctx, featureAnalysis, maxValue) {
        // Normalize values to 0-100 scale
        const normalizeValue = (value) => {
            // Convert negative values to 0-50 range, positive to 50-100
            if (value >= 0) {
                return 50 + (value / maxValue) * 50;
            } else {
                return 50 - (Math.abs(value) / maxValue) * 50;
            }
        };

        const features = ['camera', 'battery', 'performance', 'display'];
        const normalizedData = features.map(feature => normalizeValue(featureAnalysis[feature] || 0));

        // Create a gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, chartColors.gradient.start);
        gradient.addColorStop(1, chartColors.gradient.end);

        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Camera', 'Battery', 'Performance', 'Display'],
                datasets: [{
                    data: normalizedData,
                    backgroundColor: gradient,
                    borderColor: chartColors.text,
                    borderWidth: 2,
                    pointBackgroundColor: features.map(feature => chartColors.features[feature]),
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: chartColors.text,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: chartColors.text,
                        bodyColor: chartColors.text,
                        callbacks: {
                            title: function (tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function (context) {
                                let value = context.raw;
                                // Convert normalized value back to original scale
                                if (value > 50) {
                                    value = ((value - 50) / 50) * maxValue;
                                    return `Score: +${value.toFixed(1)}`;
                                } else if (value < 50) {
                                    value = ((50 - value) / 50) * maxValue;
                                    return `Score: -${value.toFixed(1)}`;
                                } else {
                                    return 'Score: 0';
                                }
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        pointLabels: {
                            color: features.map(feature => chartColors.features[feature]),
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            display: false,
                            stepSize: 25
                        },
                        min: 0,
                        max: 100,
                        beginAtZero: true
                    }
                }
            }
        });
    }
});