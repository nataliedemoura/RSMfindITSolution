let pickupRequests = [];
let currentPickupFilter = 'all';

// Handle logout
async function handleLogout() {
    try {
        await auth.signOut();
        currentUser = null;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed: ' + error.message);
    }
}

// Load pickup requests from Firestore
async function loadPickupRequests() {
    try {
        const snapshot = await db.collection('pickupRequests').get();
        
        pickupRequests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Sort by requestedAt manually (newest first)
        pickupRequests.sort((a, b) => {
            const aTime = a.requestedAt ? a.requestedAt.toMillis() : 0;
            const bTime = b.requestedAt ? b.requestedAt.toMillis() : 0;
            return bTime - aTime;
        });
        
        console.log('Loaded pickup requests:', pickupRequests.length);
        displayPickupRequests(currentPickupFilter);
    } catch (error) {
        console.error('Error loading pickup requests:', error);
        const container = document.getElementById('pickupRequestsList');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #dc2626;">Failed to load pickup requests</p>';
        }
    }
}

// Filter pickup requests
function filterPickups(status) {
    currentPickupFilter = status;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayPickupRequests(status);
}

// Display pickup requests
function displayPickupRequests(filterStatus) {
    const container = document.getElementById('pickupRequestsList');
    const countBadge = document.getElementById('pickupCount');
    
    if (!container) return;
    
    // Filter requests based on status
    let filtered = pickupRequests;
    if (filterStatus !== 'all') {
        filtered = pickupRequests.filter(req => req.status === filterStatus);
    }
    
    if (countBadge) {
        countBadge.textContent = filtered.length;
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-pickups">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; color: #9ca3af;">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" x2="16" y1="2" y2="6"></line>
                    <line x1="8" x2="8" y1="2" y2="6"></line>
                    <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
                <p>No ${filterStatus === 'all' ? '' : filterStatus} pickup requests</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(request => {
        const statusColors = {
            pending: { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
            confirmed: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
            completed: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
            cancelled: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
        };
        
        const colors = statusColors[request.status] || statusColors.pending;
        
        return `
            <div class="pickup-card">
                <div class="pickup-header">
                    <div>
                        <h3 class="pickup-item-title">${request.itemTitle}</h3>
                        <p class="pickup-item-meta">${request.itemCategory} - ${request.itemLocation}</p>
                    </div>
                    <span class="pickup-status-badge" style="background-color: ${colors.bg}; color: ${colors.text}; border: 2px solid ${colors.border};">
                        ${request.status.toUpperCase()}
                    </span>
                </div>
                
                <div class="pickup-details-grid">
                    <div class="pickup-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="detail-icon">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <div>
                            <span class="detail-label">Student Name</span>
                            <span class="detail-value">${request.studentName}</span>
                        </div>
                    </div>
                    
                    <div class="pickup-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="detail-icon">
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                        <div>
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${request.studentEmail}</span>
                        </div>
                    </div>
                    
                    <div class="pickup-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="detail-icon">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <div>
                            <span class="detail-label">Phone</span>
                            <span class="detail-value">${request.studentPhone}</span>
                        </div>
                    </div>
                    
                    <div class="pickup-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="detail-icon">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                        <div>
                            <span class="detail-label">Student ID</span>
                            <span class="detail-value">${request.studentId}</span>
                        </div>
                    </div>
                    
                    <div class="pickup-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="detail-icon">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                            <line x1="16" x2="16" y1="2" y2="6"></line>
                            <line x1="8" x2="8" y1="2" y2="6"></line>
                            <line x1="3" x2="21" y1="10" y2="10"></line>
                        </svg>
                        <div>
                            <span class="detail-label">Pickup Date</span>
                            <span class="detail-value">${request.pickupDate}</span>
                        </div>
                    </div>
                    
                    <div class="pickup-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="detail-icon">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <div>
                            <span class="detail-label">Pickup Time</span>
                            <span class="detail-value">${request.pickupTime}</span>
                        </div>
                    </div>
                </div>
                
                ${request.notes ? `
                    <div class="pickup-notes">
                        <strong>Notes:</strong> ${request.notes}
                    </div>
                ` : ''}
                
                <div class="pickup-actions">
                    ${request.status === 'pending' ? `
                        <button class="pickup-action-btn confirm-btn" onclick="updatePickupStatus('${request.id}', 'confirmed')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Confirm
                        </button>
                    ` : ''}
                    
                    ${request.status === 'confirmed' ? `
                        <button class="pickup-action-btn complete-btn" onclick="updatePickupStatus('${request.id}', 'completed')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Mark Complete
                        </button>
                    ` : ''}
                    
                    ${request.status !== 'cancelled' && request.status !== 'completed' ? `
                        <button class="pickup-action-btn cancel-btn" onclick="updatePickupStatus('${request.id}', 'cancelled')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" x2="9" y1="9" y2="15"></line>
                                <line x1="9" x2="15" y1="9" y2="15"></line>
                            </svg>
                            Cancel
                        </button>
                    ` : ''}
                    
                    <a href="mailto:${request.studentEmail}" class="pickup-action-btn email-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                        Email Student
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// Update pickup request status
async function updatePickupStatus(requestId, newStatus) {
    const statusMessages = {
        confirmed: 'Are you sure you want to confirm this pickup?',
        completed: 'Mark this pickup as completed?',
        cancelled: 'Are you sure you want to cancel this pickup?'
    };
    
    if (!confirm(statusMessages[newStatus])) {
        return;
    }
    
    try {
        await db.collection('pickupRequests').doc(requestId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert(`Pickup status updated to ${newStatus}`);
        
        // Reload pickup requests
        await loadPickupRequests();
    } catch (error) {
        console.error('Error updating pickup status:', error);
        alert('Failed to update pickup status: ' + error.message);
    }
}

// Initialize dashboard
window.onload = async function() {
    try {
        await checkAuth();
        await loadPickupRequests();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
};