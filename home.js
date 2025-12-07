let selectedScheduleItem = null;

// Display items on home page
function displayItems(itemsToDisplay) {
    const container = document.getElementById('itemsContainer');
    const itemCount = document.getElementById('itemCount');
    
    if (!container || !itemCount) return;
    
    itemCount.textContent = itemsToDisplay.length;
    
    if (itemsToDisplay.length === 0) {
        container.innerHTML = `
            <div class="no-items" style="grid-column: 1 / -1;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; color: #9ca3af;">
                    <path d="m7.5 4.27 9 5.15"></path>
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                    <path d="m3.3 7 8.7 5 8.7-5"></path>
                    <path d="M12 22V12"></path>
                </svg>
                <p>No items found matching your filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = itemsToDisplay.map(item => `
        <div class="item-card">
            ${item.image ? `<img src="${item.image}" class="item-image" alt="${item.title}">` : ''}
            <div class="item-header">
                <span class="item-badge ${item.claimed ? 'badge-claimed' : 'badge-found'}">
                    ${item.claimed ? 'CLAIMED' : 'AVAILABLE'}
                </span>
                <span class="item-category">${item.category}</span>
            </div>
            
            <h4 class="item-title">${item.title}</h4>
            <p class="item-description">${item.description}</p>
            
            <div class="item-details">
                <div class="detail-row">
                    <svg class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0 Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>${item.location}</span>
                </div>
                <div class="detail-row">
                    <svg class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    <span>${item.date}</span>
                </div>
                ${item.claimed ? `
                    <div class="detail-row" style="color: #dc2626;">
                        <svg class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>Claimed by ${item.claimedByName || 'Student'}</span>
                    </div>
                ` : ''}
            </div>
            
            ${!item.claimed ? `
                <button class="schedule-pickup-btn" onclick="openScheduleModal('${item.id}', event)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 0.5rem;">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    Schedule Pickup
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Parse date string (format: YYYY-MM-DD or MM/DD/YYYY)
function parseItemDate(dateString) {
    if (!dateString) return null;
    
    // Try parsing as YYYY-MM-DD
    let parts = dateString.split('-');
    if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    
    // Try parsing as MM/DD/YYYY
    parts = dateString.split('/');
    if (parts.length === 3) {
        return new Date(parts[2], parts[0] - 1, parts[1]);
    }
    
    return null;
}

// Check if item date falls within date filter range
function isWithinDateRange(itemDate, filterValue) {
    if (!filterValue || !itemDate) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const parsedDate = parseItemDate(itemDate);
    if (!parsedDate) return true;
    
    parsedDate.setHours(0, 0, 0, 0);
    
    switch(filterValue) {
        case 'today':
            return parsedDate.getTime() === today.getTime();
        
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return parsedDate >= weekAgo;
        
        case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return parsedDate >= monthAgo;
        
        case '3months':
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return parsedDate >= threeMonthsAgo;
        
        default:
            return true;
    }
}

// Apply all filters
function applyFilters() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const locationFilter = document.getElementById('locationFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const availabilityFilter = document.getElementById('availabilityFilter').value;
    
    let filtered = items.filter(item => {
        // Search filter
        const matchesSearch = !searchQuery || 
            item.title.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery) ||
            item.category.toLowerCase().includes(searchQuery) ||
            item.location.toLowerCase().includes(searchQuery);
        
        // Category filter
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        
        // Location filter
        const matchesLocation = !locationFilter || item.location === locationFilter;
        
        // Date filter
        const matchesDate = isWithinDateRange(item.date, dateFilter);
        
        // Availability filter
        let matchesAvailability = true;
        if (availabilityFilter === 'available') {
            matchesAvailability = !item.claimed;
        } else if (availabilityFilter === 'claimed') {
            matchesAvailability = item.claimed === true;
        }
        
        return matchesSearch && matchesCategory && matchesLocation && matchesDate && matchesAvailability;
    });
    
    // Update filter summary
    updateFilterSummary(searchQuery, categoryFilter, locationFilter, dateFilter, availabilityFilter, filtered.length);
    
    displayItems(filtered);
}

// Update filter summary text
function updateFilterSummary(search, category, location, dateRange, availability, resultCount) {
    const summaryEl = document.getElementById('filterSummary');
    if (!summaryEl) return;
    
    const activeFilters = [];
    
    if (search) activeFilters.push(`Search: "${search}"`);
    if (category) activeFilters.push(`Category: ${category}`);
    if (location) activeFilters.push(`Location: ${location}`);
    if (dateRange) {
        const dateLabels = {
            'today': 'Today',
            'week': 'Past Week',
            'month': 'Past Month',
            '3months': 'Past 3 Months'
        };
        activeFilters.push(`Date: ${dateLabels[dateRange]}`);
    }
    if (availability === 'available') activeFilters.push('Available items only');
    if (availability === 'claimed') activeFilters.push('Claimed items only');
    
    if (activeFilters.length === 0) {
        summaryEl.textContent = `Showing all ${resultCount} items`;
    } else {
        summaryEl.textContent = `${resultCount} items found with filters: ${activeFilters.join(', ')}`;
    }
}

// Clear all filters
function clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('availabilityFilter').value = 'available';
    
    applyFilters();
}

// Open schedule pickup modal
function openScheduleModal(itemId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    selectedScheduleItem = items.find(item => item.id === itemId || item.id == itemId);
    
    if (!selectedScheduleItem) {
        console.error('Item not found:', itemId);
        alert('Error: Could not find selected item');
        return;
    }
    
    // Display selected item info
    const itemInfo = document.getElementById('selectedItemInfo');
    if (itemInfo) {
        itemInfo.innerHTML = `
            <div style="background-color: #eff6ff; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Selected Item:</h4>
                <p style="color: #1e40af; font-weight: 600;">${selectedScheduleItem.title}</p>
                <p style="color: #6b7280; font-size: 0.875rem;">${selectedScheduleItem.category} - ${selectedScheduleItem.location}</p>
            </div>
        `;
    }
    
    // Set minimum date to today
    const dateInput = document.getElementById('scheduleDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        dateInput.value = today;
    }
    
    document.getElementById('scheduleModal').classList.remove('hidden');
}

// Close schedule pickup modal
function closeScheduleModal(event) {
    if (!event || event.target === document.getElementById('scheduleModal')) {
        document.getElementById('scheduleModal').classList.add('hidden');
        
        // Clear form
        document.getElementById('scheduleName').value = '';
        document.getElementById('scheduleEmail').value = '';
        document.getElementById('schedulePhone').value = '';
        document.getElementById('scheduleStudentId').value = '';
        document.getElementById('scheduleDate').value = '';
        document.getElementById('scheduleTime').value = '';
        document.getElementById('scheduleNotes').value = '';
        
        selectedScheduleItem = null;
    }
}

// Submit schedule pickup request
async function submitSchedule() {
    const name = document.getElementById('scheduleName').value.trim();
    const email = document.getElementById('scheduleEmail').value.trim();
    const phone = document.getElementById('schedulePhone').value.trim();
    const studentId = document.getElementById('scheduleStudentId').value.trim();
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const notes = document.getElementById('scheduleNotes').value.trim();
    
    // Validation
    if (!name) {
        alert('Please enter your full name');
        return;
    }
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    if (!phone) {
        alert('Please enter your phone number');
        return;
    }
    
    if (!studentId) {
        alert('Please enter your student ID');
        return;
    }
    
    if (!date) {
        alert('Please select a pickup date');
        return;
    }
    
    if (!time) {
        alert('Please select a pickup time');
        return;
    }
    
    try {
        // Save pickup request to Firestore
        await db.collection('pickupRequests').add({
            itemId: selectedScheduleItem.id,
            itemTitle: selectedScheduleItem.title,
            itemCategory: selectedScheduleItem.category,
            itemLocation: selectedScheduleItem.location,
            studentName: name,
            studentEmail: email,
            studentPhone: phone,
            studentId: studentId,
            pickupDate: date,
            pickupTime: time,
            notes: notes,
            status: 'pending',
            requestedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Send confirmation email using EmailJS    
        function sendEmail() {
            const templateParams = {
                name: document.querySelector("#name).value,
                email: document.querySelector("#email).value,
                subject: document.querySelector("#subject).value,
                message: document.querySelector("#message).value,
        emailjs.send('service_wwhe20q', 'template_c432pia', {
            student_name: name,
            student_email: email,
            item_title: selectedScheduleItem.title,
            item_category: selectedScheduleItem.category,
            item_location: selectedScheduleItem.location,
            pickup_date: date,
            pickup_time: time,
            student_id: studentId,
            to_email: email
        }).then(
            function(response) {
                console.log('Email sent successfully!', response.status, response.text);
            },
            function(error) {
                console.error('Failed to send email:', error);
            }
        );
            
        alert(`Pickup scheduled successfully!\n\nItem: ${selectedScheduleItem.title}\nDate: ${date}\nTime: ${time}`);
            
        closeScheduleModal();
        } catch (error) {
            console.error('Error scheduling pickup:', error);
            alert('Failed to schedule pickup: ' + error.message);
        }
    }

// Initialize home page
window.onload = async function() {
    try {
        await loadItemsFromFirestore();
        
        // Set default availability filter to "available"
        const availabilityFilter = document.getElementById('availabilityFilter');
        if (availabilityFilter) {
            availabilityFilter.value = 'available';
        }
        
        applyFilters();
    } catch (error) {
        console.error('Error loading items:', error);
        const container = document.getElementById('itemsContainer');
        if (container) {
            container.innerHTML = `
                <div class="no-items" style="grid-column: 1 / -1;">
                    <p style="color: #dc2626;">Failed to load items. Please refresh the page.</p>
                </div>
            `;
        }
    }

};









