// Replace the submitSchedule() function in your home.js with this:

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
        
        // 1. Send notification email to STAFF (brookline@russianschool.com)
        // Replace 'YOUR_STAFF_TEMPLATE_ID' with your NEW template ID from EmailJS
        await emailjs.send('service_wwhe20q', 'YOUR_STAFF_TEMPLATE_ID', {
            to_email: 'brookline@russianschool.com',  // Staff email
            from_name: name,
            from_email: email,
            phone: phone,
            student_id: studentId,
            item_name: selectedScheduleItem.title,
            item_category: selectedScheduleItem.category,
            item_location: selectedScheduleItem.location,
            pickup_date: date,
            pickup_time: time,
            additional_notes: notes || 'None',
            submission_date: new Date().toLocaleDateString()
        });
        
        // 2. Send confirmation email to STUDENT
        await emailjs.send('service_wwhe20q', 'template_c432pia', {
            student_name: name,
            student_email: email,
            item_title: selectedScheduleItem.title,
            item_category: selectedScheduleItem.category,
            item_location: selectedScheduleItem.location,
            pickup_date: date,
            pickup_time: time,
            student_id: studentId,
            to_email: email
        });
        
        console.log('Both emails sent successfully!');
        
        alert(`Pickup scheduled successfully!\n\nItem: ${selectedScheduleItem.title}\nDate: ${date}\nTime: ${time}\n\nA confirmation email has been sent to ${email}`);
        
        closeScheduleModal();
        
    } catch (error) {
        console.error('Error scheduling pickup:', error);
        alert('Failed to schedule pickup: ' + error.message);
    }
}
