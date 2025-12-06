// Insights Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let activeSections = new Set();
    let importedData = null;
    let currentActiveSection = null;
    
    // Check for data from main dashboard
    checkForImportedData();
    
    // Initialize event listeners
    initInsightsEventListeners();
    
    // Update status display
    updateStatusDisplay();
    
    // Add CSS for power button animation
    addPowerButtonCSS();
});

// Check if data was imported in the main dashboard
function checkForImportedData() {
    // Try to get data from localStorage (shared between pages)
    const storedData = localStorage.getItem('dashboardData');
    const dataStatusIndicator = document.getElementById('data-status-indicator');
    const dataStatusText = document.getElementById('data-status-text');
    const dataStatus = document.getElementById('data-status');
    
    if (storedData) {
        try {
            importedData = JSON.parse(storedData);
            console.log('Loaded imported data from main dashboard:', importedData);
            
            // Update UI to show data is loaded
            dataStatusIndicator.classList.remove('fa-circle');
            dataStatusIndicator.classList.add('fa-check-circle', 'loaded');
            dataStatusText.textContent = 'Data loaded from main dashboard';
            dataStatus.textContent = 'Loaded';
            dataStatus.classList.add('loaded');
            
            // Enable all buttons
            enableInsightButtons();
            
        } catch (error) {
            console.error('Error parsing stored data:', error);
            showDataNotLoadedState();
        }
    } else {
        showDataNotLoadedState();
    }
}

function showDataNotLoadedState() {
    const dataStatusIndicator = document.getElementById('data-status-indicator');
    const dataStatusText = document.getElementById('data-status-text');
    const dataStatus = document.getElementById('data-status');
    
    dataStatusIndicator.classList.add('fa-circle');
    dataStatusText.textContent = 'No data found. Please import data in main dashboard first.';
    dataStatus.textContent = 'Not Loaded';
    dataStatus.classList.remove('loaded');
}

function enableInsightButtons() {
    const insightButtons = document.querySelectorAll('.insight-btn');
    insightButtons.forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    });
}

function initInsightsEventListeners() {
    // Home button - navigate back to main dashboard
    document.getElementById('home-button').addEventListener('click', function() {
        // Navigate back to main dashboard
        window.location.href = 'index.html';
    });
    
    // Insight buttons click events
    document.querySelectorAll('.insight-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (this.disabled) return;
            
            const section = this.getAttribute('data-section');
            toggleInsightSection(section, this);
        });
    });
}

function toggleInsightSection(section, buttonElement) {
    const btnStatus = buttonElement.querySelector('.btn-status i');
    const isActive = buttonElement.classList.contains('active');
    
    // If clicking the active section, deactivate it
    if (isActive) {
        buttonElement.classList.remove('active');
        btnStatus.classList.remove('on');
        btnStatus.classList.add('off');
        activeSections.delete(section);
        
        // If no sections are active, show welcome screen
        if (activeSections.size === 0) {
            showWelcomeScreen();
            currentActiveSection = null;
        } else {
            // If this was the current active section, show another active one
            if (currentActiveSection === section) {
                // Find another active section to show
                const firstActive = document.querySelector('.insight-btn.active');
                if (firstActive) {
                    const newSection = firstActive.getAttribute('data-section');
                    showAnalyticsForSection(newSection);
                }
            }
        }
    } else {
        // Activate the section
        buttonElement.classList.add('active');
        btnStatus.classList.remove('off');
        btnStatus.classList.add('on');
        activeSections.add(section);
        currentActiveSection = section;
        
        // Hide welcome screen
        hideWelcomeScreen();
        
        // Show analytics for this section
        showAnalyticsForSection(section);
    }
    
    // Update status display
    updateStatusDisplay();
    
    // Animate power button
    animatePowerButton(btnStatus);
}

function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const analyticsContent = document.getElementById('analytics-content');
    
    welcomeScreen.classList.add('active');
    analyticsContent.classList.remove('active');
}

function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const analyticsContent = document.getElementById('analytics-content');
    
    welcomeScreen.classList.remove('active');
    analyticsContent.classList.add('active');
}

function showAnalyticsForSection(section) {
    const analyticsContent = document.getElementById('analytics-content');
    
    // Clear previous content
    analyticsContent.innerHTML = '';
    
    // Check if data is loaded
    if (!importedData) {
        analyticsContent.innerHTML = `
            <div class="chart-container">
                <h2><i class="fas fa-exclamation-triangle"></i> No Data Available</h2>
                <p>Please import data in the main dashboard first.</p>
            </div>
        `;
        return;
    }
    
    // Get section name mapping
    const sectionNames = {
        'analytical': 'Analytical Indicators',
        'capital': 'Capital investments',
        'demographics': 'District demographics',
        'economic': 'Economic context',
        'amenities': 'Public amenities',
        'facilities': 'School facilities',
        'status': 'School status'
    };
    
    const sheetName = sectionNames[section];
    const data = importedData[sheetName];
    
    if (!data) {
        analyticsContent.innerHTML = `
            <div class="chart-container">
                <h2><i class="fas fa-chart-${getSectionIcon(section)}"></i> ${getSectionDisplayName(section)}</h2>
                <p>No data available for this section.</p>
            </div>
        `;
        return;
    }
    
    // Generate analytics based on section type
    let analyticsHTML = '';
    
    switch(section) {
        case 'analytical':
            analyticsHTML = generateAnalyticalIndicatorsAnalytics(data, section);
            break;
        case 'capital':
            analyticsHTML = generateCapitalInvestmentsAnalytics(data, section);
            break;
        case 'demographics':
            analyticsHTML = generateDemographicsAnalytics(data, section);
            break;
        case 'economic':
            analyticsHTML = generateEconomicAnalytics(data, section);
            break;
        case 'amenities':
            analyticsHTML = generateAmenitiesAnalytics(data, section);
            break;
        case 'facilities':
            analyticsHTML = generateSchoolFacilitiesAnalytics(data, section);
            break;
        case 'status':
            analyticsHTML = generateSchoolStatusAnalytics(data, section);
            break;
        default:
            analyticsHTML = generateDefaultAnalytics(data, section);
    }
    
    analyticsContent.innerHTML = analyticsHTML;
    
    // Initialize any charts if needed
    if (typeof generateCharts === 'function') {
        generateCharts(section, data);
    }
}

function getSectionIcon(section) {
    const icons = {
        'analytical': 'line',
        'capital': 'building',
        'demographics': 'users',
        'economic': 'pie',
        'amenities': 'parking',
        'facilities': 'school',
        'status': 'clipboard-check'
    };
    return icons[section] || 'chart-bar';
}

function getSectionDisplayName(section) {
    const names = {
        'analytical': 'Analytical Indicators',
        'capital': 'Capital Investments',
        'demographics': 'District Demographics',
        'economic': 'Economic Context',
        'amenities': 'Public Amenities',
        'facilities': 'School Facilities',
        'status': 'School Status'
    };
    return names[section] || section;
}

function generateAnalyticalIndicatorsAnalytics(data, section) {
    return `
        <div class="chart-container">
            <h2><i class="fas fa-chart-line"></i> ${getSectionDisplayName(section)} Analysis</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3><i class="fas fa-database"></i> Data Summary</h3>
                    <div class="stat-value">${data.rowCount || 'N/A'}</div>
                    <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-columns"></i> Data Dimensions</h3>
                    <div class="stat-value">${data.columnCount || 'N/A'}</div>
                    <div class="stat-label">Metrics Tracked</div>
                </div>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Description</th>
                            <th>Data Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateDataPreview(data)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateCapitalInvestmentsAnalytics(data, section) {
    return `
        <div class="chart-container">
            <h2><i class="fas fa-building"></i> ${getSectionDisplayName(section)} Analysis</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3><i class="fas fa-money-bill-wave"></i> Total Investment</h3>
                    <div class="stat-value">$${calculateTotalInvestment(data) || 'N/A'}</div>
                    <div class="stat-label">Across All Districts</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-map-marked-alt"></i> Coverage</h3>
                    <div class="stat-value">10/10</div>
                    <div class="stat-label">Districts Covered</div>
                </div>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Year</th>
                            <th>Investment Amount</th>
                            <th>Project Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateInvestmentPreview(data)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateDemographicsAnalytics(data, section) {
    return `
        <div class="chart-container">
            <h2><i class="fas fa-users"></i> ${getSectionDisplayName(section)} Analysis</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3><i class="fas fa-user-friends"></i> Population</h3>
                    <div class="stat-value">${calculateTotalPopulation(data) || 'N/A'}</div>
                    <div class="stat-label">Total Residents</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-chart-bar"></i> Data Points</h3>
                    <div class="stat-value">${data.rowCount || 'N/A'}</div>
                    <div class="stat-label">Demographic Records</div>
                </div>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Year</th>
                            <th>Population</th>
                            <th>Demographic Metric</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateDemographicsPreview(data)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateEconomicAnalytics(data, section) {
    return `
        <div class="chart-container">
            <h2><i class="fas fa-chart-pie"></i> ${getSectionDisplayName(section)} Analysis</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3><i class="fas fa-chart-line"></i> Economic Metrics</h3>
                    <div class="stat-value">${data.columnCount - 1 || 'N/A'}</div>
                    <div class="stat-label">Indicators Tracked</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-map-pin"></i> Coverage</h3>
                    <div class="stat-value">10/10</div>
                    <div class="stat-label">Districts Analyzed</div>
                </div>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Year</th>
                            <th>Economic Indicator</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateEconomicPreview(data)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateAmenitiesAnalytics(data, section) {
    return `
        <div class="chart-container">
            <h2><i class="fas fa-parking"></i> ${getSectionDisplayName(section)} Analysis</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3><i class="fas fa-map-marked"></i> Amenity Count</h3>
                    <div class="stat-value">${data.rowCount || 'N/A'}</div>
                    <div class="stat-label">Public Amenities</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-location-dot"></i> Distribution</h3>
                    <div class="stat-value">10/10</div>
                    <div class="stat-label">Districts Served</div>
                </div>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Amenity Type</th>
                            <th>Location</th>
                            <th>Capacity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateAmenitiesPreview(data)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateSchoolFacilitiesAnalytics(data, section) {
    return `
        <div class="chart-container">
            <h2><i class="fas fa-school"></i> ${getSectionDisplayName(section)} Analysis</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3><i class="fas fa-school"></i> School Count</h3>
                    <div class="stat-value">${data.rowCount || 'N/A'}</div>
                    <div class="stat-label">Total Schools</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-map-marker-alt"></i> Coverage</h3>
                    <div class="stat-value">10/10</div>
                    <div class="stat-label">Districts Covered</div>
                </div>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>School Name</th>
                            <th>Facility Type</th>
                            <th>Condition</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateSchoolFacilitiesPreview(data)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateSchoolStatusAnalytics(data, section) {
    return `
        <div class="chart-container">
            <h2><i class="fas fa-clipboard-check"></i> ${getSectionDisplayName(section)} Analysis</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3><i class="fas fa-graduation-cap"></i> Schools Tracked</h3>
                    <div class="stat-value">${data.rowCount || 'N/A'}</div>
                    <div class="stat-label">School Status Records</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-chart-bar"></i> Performance</h3>
                    <div class="stat-value">${calculateAveragePerformance(data) || 'N/A'}</div>
                    <div class="stat-label">Average Score</div>
                </div>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>School Name</th>
                            <th>Status</th>
                            <th>Performance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateSchoolStatusPreview(data)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateDefaultAnalytics(data, section) {
    return `
        <div class="chart-container">
            <h2><i class="fas fa-chart-bar"></i> ${getSectionDisplayName(section)} Analysis</h2>
            <p>Detailed analytics for ${getSectionDisplayName(section)} will be displayed here.</p>
            <div class="stats-container">
                <div class="stat-card">
                    <h3><i class="fas fa-database"></i> Data Volume</h3>
                    <div class="stat-value">${data.rowCount || 'N/A'}</div>
                    <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-columns"></i> Data Points</h3>
                    <div class="stat-value">${data.columnCount || 'N/A'}</div>
                    <div class="stat-label">Metrics Tracked</div>
                </div>
            </div>
        </div>
    `;
}

// Helper functions for data calculations
function calculateTotalInvestment(data) {
    if (!data || !data.data) return 'N/A';
    
    let total = 0;
    const amountIndex = data.headers.findIndex(h => 
        h.toLowerCase().includes('amount') || 
        h.toLowerCase().includes('investment') ||
        h.toLowerCase().includes('value')
    );
    
    if (amountIndex === -1) return 'N/A';
    
    data.data.forEach(row => {
        const value = parseFloat(row[amountIndex]) || 0;
        total += value;
    });
    
    return total.toLocaleString();
}

function calculateTotalPopulation(data) {
    if (!data || !data.data) return 'N/A';
    
    let total = 0;
    const popIndex = data.headers.findIndex(h => 
        h.toLowerCase().includes('population') || 
        h.toLowerCase().includes('residents') ||
        h.toLowerCase().includes('people')
    );
    
    if (popIndex === -1) return 'N/A';
    
    data.data.forEach(row => {
        const value = parseFloat(row[popIndex]) || 0;
        total += value;
    });
    
    return total.toLocaleString();
}

function calculateAveragePerformance(data) {
    if (!data || !data.data) return 'N/A';
    
    let total = 0;
    let count = 0;
    const perfIndex = data.headers.findIndex(h => 
        h.toLowerCase().includes('score') || 
        h.toLowerCase().includes('performance') ||
        h.toLowerCase().includes('rating') ||
        h.toLowerCase().includes('grade')
    );
    
    if (perfIndex === -1) return 'N/A';
    
    data.data.forEach(row => {
        const value = parseFloat(row[perfIndex]);
        if (!isNaN(value)) {
            total += value;
            count++;
        }
    });
    
    return count > 0 ? (total / count).toFixed(1) : 'N/A';
}

function generateDataPreview(data) {
    if (!data || !data.headers) return '<tr><td colspan="3">No data available</td></tr>';
    
    let html = '';
    const maxRows = 10;
    
    // Show first few metrics
    data.headers.slice(0, maxRows).forEach((header, index) => {
        if (header.toLowerCase() !== 'district' && header.toLowerCase() !== 'year') {
            html += `
                <tr>
                    <td><strong>${header}</strong></td>
                    <td>Analytical indicator for district performance</td>
                    <td>Numeric/Percentage</td>
                </tr>
            `;
        }
    });
    
    return html || '<tr><td colspan="3">No metrics found</td></tr>';
}

function generateInvestmentPreview(data) {
    if (!data || !data.data) return '<tr><td colspan="4">No data available</td></tr>';
    
    let html = '';
    const maxRows = 8;
    const headers = data.headers;
    
    const districtIndex = headers.indexOf('District');
    const yearIndex = headers.findIndex(h => h.toLowerCase().includes('year'));
    const amountIndex = headers.findIndex(h => 
        h.toLowerCase().includes('amount') || 
        h.toLowerCase().includes('investment')
    );
    const typeIndex = headers.findIndex(h => 
        h.toLowerCase().includes('type') || 
        h.toLowerCase().includes('project')
    );
    
    for (let i = 0; i < Math.min(data.data.length, maxRows); i++) {
        const row = data.data[i];
        html += `
            <tr>
                <td>${districtIndex !== -1 ? row[districtIndex] : 'N/A'}</td>
                <td>${yearIndex !== -1 ? row[yearIndex] : 'N/A'}</td>
                <td>$${amountIndex !== -1 ? formatNumber(row[amountIndex]) : 'N/A'}</td>
                <td>${typeIndex !== -1 ? row[typeIndex] : 'Infrastructure'}</td>
            </tr>
        `;
    }
    
    return html;
}

function generateDemographicsPreview(data) {
    if (!data || !data.data) return '<tr><td colspan="4">No data available</td></tr>';
    
    let html = '';
    const maxRows = 8;
    const headers = data.headers;
    
    const districtIndex = headers.indexOf('District');
    const yearIndex = headers.findIndex(h => h.toLowerCase().includes('year'));
    const popIndex = headers.findIndex(h => h.toLowerCase().includes('population'));
    
    for (let i = 0; i < Math.min(data.data.length, maxRows); i++) {
        const row = data.data[i];
        html += `
            <tr>
                <td>${districtIndex !== -1 ? row[districtIndex] : 'N/A'}</td>
                <td>${yearIndex !== -1 ? row[yearIndex] : 'N/A'}</td>
                <td>${popIndex !== -1 ? formatNumber(row[popIndex]) : 'N/A'}</td>
                <td>Demographic data</td>
            </tr>
        `;
    }
    
    return html;
}

function generateEconomicPreview(data) {
    if (!data || !data.data) return '<tr><td colspan="4">No data available</td></tr>';
    
    let html = '';
    const maxRows = 8;
    const headers = data.headers;
    
    const districtIndex = headers.indexOf('District');
    const yearIndex = headers.findIndex(h => h.toLowerCase().includes('year'));
    
    // Find first non-district, non-year column for value
    let valueIndex = -1;
    for (let i = 0; i < headers.length; i++) {
        if (i !== districtIndex && i !== yearIndex) {
            valueIndex = i;
            break;
        }
    }
    
    for (let i = 0; i < Math.min(data.data.length, maxRows); i++) {
        const row = data.data[i];
        html += `
            <tr>
                <td>${districtIndex !== -1 ? row[districtIndex] : 'N/A'}</td>
                <td>${yearIndex !== -1 ? row[yearIndex] : 'N/A'}</td>
                <td>${valueIndex !== -1 ? headers[valueIndex] : 'Economic Metric'}</td>
                <td>${valueIndex !== -1 ? formatNumber(row[valueIndex]) : 'N/A'}</td>
            </tr>
        `;
    }
    
    return html;
}

function generateAmenitiesPreview(data) {
    if (!data || !data.data) return '<tr><td colspan="4">No data available</td></tr>';
    
    let html = '';
    const maxRows = 8;
    const headers = data.headers;
    
    const districtIndex = headers.indexOf('District');
    const typeIndex = headers.findIndex(h => h.toLowerCase().includes('type') || h.toLowerCase().includes('amenity'));
    
    for (let i = 0; i < Math.min(data.data.length, maxRows); i++) {
        const row = data.data[i];
        html += `
            <tr>
                <td>${districtIndex !== -1 ? row[districtIndex] : 'N/A'}</td>
                <td>${typeIndex !== -1 ? row[typeIndex] : 'Public Amenity'}</td>
                <td>District ${districtIndex !== -1 ? row[districtIndex] : 'N/A'}</td>
                <td>Available</td>
            </tr>
        `;
    }
    
    return html;
}

function generateSchoolFacilitiesPreview(data) {
    if (!data || !data.data) return '<tr><td colspan="4">No data available</td></tr>';
    
    let html = '';
    const maxRows = 8;
    const headers = data.headers;
    
    const districtIndex = headers.indexOf('District');
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('school') || h.toLowerCase().includes('name'));
    
    for (let i = 0; i < Math.min(data.data.length, maxRows); i++) {
        const row = data.data[i];
        html += `
            <tr>
                <td>${districtIndex !== -1 ? row[districtIndex] : 'N/A'}</td>
                <td>${nameIndex !== -1 ? row[nameIndex] : `School ${i+1}`}</td>
                <td>Educational Facility</td>
                <td>Good</td>
            </tr>
        `;
    }
    
    return html;
}

function generateSchoolStatusPreview(data) {
    if (!data || !data.data) return '<tr><td colspan="4">No data available</td></tr>';
    
    let html = '';
    const maxRows = 8;
    const headers = data.headers;
    
    const districtIndex = headers.indexOf('District');
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('school') || h.toLowerCase().includes('name'));
    const statusIndex = headers.findIndex(h => h.toLowerCase().includes('status'));
    
    for (let i = 0; i < Math.min(data.data.length, maxRows); i++) {
        const row = data.data[i];
        html += `
            <tr>
                <td>${districtIndex !== -1 ? row[districtIndex] : 'N/A'}</td>
                <td>${nameIndex !== -1 ? row[nameIndex] : `School ${i+1}`}</td>
                <td>${statusIndex !== -1 ? row[statusIndex] : 'Active'}</td>
                <td>Good</td>
            </tr>
        `;
    }
    
    return html;
}

function formatNumber(value) {
    if (value === null || value === undefined) return 'N/A';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString();
}

function updateStatusDisplay() {
    const activeSectionsElement = document.getElementById('active-sections');
    activeSectionsElement.textContent = `${activeSections.size}/7`;
}

function animatePowerButton(button) {
    button.style.transform = 'scale(1.3)';
    button.style.transition = 'transform 0.2s';
    
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

function addPowerButtonCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .btn-status i {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-status i.on {
            animation: powerOn 0.5s ease;
        }
        
        .btn-status i.off {
            animation: powerOff 0.5s ease;
        }
        
        @keyframes powerOn {
            0% {
                transform: scale(1);
                opacity: 0.5;
            }
            50% {
                transform: scale(1.5);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        @keyframes powerOff {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(0.8);
                opacity: 0.5;
            }
            100% {
                transform: scale(1);
                opacity: 0.5;
            }
        }
    `;
    document.head.appendChild(style);
}

// Store data from main dashboard when navigating to insights
if (window.location.href.includes('insights.html')) {
    // This will be called from main dashboard when navigating
    window.storeDashboardData = function(data) {
        localStorage.setItem('dashboardData', JSON.stringify(data));
    };
}