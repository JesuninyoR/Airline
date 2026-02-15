// Currency Rates (Base: USD)
const currencyRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    NGN: 1550,
    JPY: 149.50
};

let currentCurrency = 'USD';
let currentBooking = null;
let searchParams = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setMinDate();
    updateNavOnScroll();
});

// Event Listeners
function initializeEventListeners() {
    // Navigation
    document.getElementById('hamburger').addEventListener('click', toggleMobileMenu);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Currency Selector
    document.getElementById('currencySelector').addEventListener('change', handleCurrencyChange);

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });

    // Trip Type
    document.querySelectorAll('input[name="tripType"]').forEach(radio => {
        radio.addEventListener('change', handleTripTypeChange);
    });

    // Swap Cities
    document.getElementById('swapBtn').addEventListener('click', swapCities);

    // Forms
    document.getElementById('searchForm').addEventListener('submit', searchFlights);
    document.getElementById('statusForm').addEventListener('submit', checkFlightStatus);
    document.getElementById('passengerForm').addEventListener('submit', (e) => e.preventDefault());
    document.getElementById('paymentForm').addEventListener('submit', processPayment);
    document.getElementById('contactForm').addEventListener('submit', handleContactForm);

    // Payment Method Change
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });

    // Modal Close
    document.getElementById('closeBooking').addEventListener('click', closeBookingModal);

    // Card Number Formatting
    document.getElementById('cardNumber')?.addEventListener('input', formatCardNumber);
    document.getElementById('expiryDate')?.addEventListener('input', formatExpiryDate);
    document.getElementById('cvv')?.addEventListener('input', formatCVV);

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
}

// Navigation
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

function handleNavClick(e) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
    
    if (window.innerWidth <= 768) {
        toggleMobileMenu();
    }
}

function updateNavOnScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Currency
function handleCurrencyChange(e) {
    currentCurrency = e.target.value;
    updateAllPrices();
}

function convertPrice(priceUSD) {
    return (priceUSD * currencyRates[currentCurrency]).toFixed(2);
}

function formatPrice(price) {
    const symbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        NGN: '₦',
        JPY: '¥'
    };
    return `${symbols[currentCurrency]}${parseFloat(price).toLocaleString()}`;
}

function updateAllPrices() {
    document.querySelectorAll('.flight-price').forEach(priceEl => {
        const basePrice = parseFloat(priceEl.dataset.basePrice);
        priceEl.textContent = formatPrice(convertPrice(basePrice));
    });
}

// Tab Switching
function switchTab(e) {
    const tabName = e.currentTarget.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    e.currentTarget.classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Trip Type
function handleTripTypeChange(e) {
    const returnDateGroup = document.getElementById('returnDateGroup');
    if (e.target.value === 'oneway') {
        returnDateGroup.style.opacity = '0.5';
        returnDateGroup.querySelector('input').disabled = true;
    } else {
        returnDateGroup.style.opacity = '1';
        returnDateGroup.querySelector('input').disabled = false;
    }
}

// Swap Cities
function swapCities() {
    const fromCity = document.getElementById('fromCity');
    const toCity = document.getElementById('toCity');
    
    const temp = fromCity.value;
    fromCity.value = toCity.value;
    toCity.value = temp;
}

// Set Minimum Date
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('departDate').min = today;
    document.getElementById('returnDate').min = today;
    document.getElementById('statusDate').min = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

// Search Flights
function searchFlights(e) {
    e.preventDefault();
    
    searchParams = {
        from: document.getElementById('fromCity').value,
        to: document.getElementById('toCity').value,
        departDate: document.getElementById('departDate').value,
        returnDate: document.getElementById('returnDate').value,
        passengers: document.getElementById('passengers').value,
        class: document.getElementById('travelClass').value,
        tripType: document.querySelector('input[name="tripType"]:checked').value
    };
    
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        displayFlightResults();
        document.getElementById('flightResults').classList.remove('hidden');
        document.getElementById('flightResults').scrollIntoView({ behavior: 'smooth' });
    }, 1500);
}

// Display Flight Results
function displayFlightResults() {
    const flightsList = document.getElementById('flightsList');
    const resultsInfo = document.getElementById('resultsInfo');
    
    const flights = generateFlights();
    
    resultsInfo.textContent = `Found ${flights.length} flights from ${searchParams.from} to ${searchParams.to}`;
    
    flightsList.innerHTML = '';
    
    flights.forEach((flight, index) => {
        const flightCard = createFlightCard(flight, index);
        flightsList.appendChild(flightCard);
    });
}

// Generate Sample Flights
function generateFlights() {
    const airlines = ['SkyWings', 'AirGlobal', 'JetStream', 'CloudNine', 'WingSpan'];
    const flights = [];
    
    const departTime = new Date(searchParams.departDate);
    
    for (let i = 0; i < 10; i++) {
        const hours = 6 + Math.floor(Math.random() * 16);
        const minutes = Math.floor(Math.random() * 4) * 15;
        
        const depTime = new Date(departTime);
        depTime.setHours(hours, minutes);
        
        const duration = 2 + Math.random() * 10;
        const arrTime = new Date(depTime.getTime() + duration * 60 * 60 * 1000);
        
        let basePrice = 200 + Math.random() * 800;
        if (searchParams.class === 'business') basePrice *= 2;
        if (searchParams.class === 'first') basePrice *= 3;
        
        const timeOfDay = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
        
        flights.push({
            id: `SW${1000 + i}`,
            airline: airlines[Math.floor(Math.random() * airlines.length)],
            from: searchParams.from,
            to: searchParams.to,
            departTime: depTime,
            arriveTime: arrTime,
            duration: duration.toFixed(1),
            price: basePrice,
            stops: Math.random() > 0.7 ? 1 : 0,
            timeOfDay: timeOfDay
        });
    }
    
    return flights.sort((a, b) => a.price - b.price);
}

// Create Flight Card
function createFlightCard(flight, index) {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.style.animationDelay = `${index * 0.1}s`;
    card.dataset.timeOfDay = flight.timeOfDay;
    
    const depTime = flight.departTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const arrTime = flight.arriveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const convertedPrice = convertPrice(flight.price);
    
    card.innerHTML = `
        <div class="flight-header">
            <div class="airline-info">
                <div class="airline-logo">${flight.airline.substring(0, 2)}</div>
                <div>
                    <h4>${flight.airline}</h4>
                    <p>${flight.id}</p>
                </div>
            </div>
            <div>
                <span class="status-badge on-time">${flight.stops === 0 ? 'Non-stop' : '1 Stop'}</span>
            </div>
        </div>
        
        <div class="flight-details">
            <div class="flight-time">
                <div class="time">${depTime}</div>
                <div class="city">${flight.from}</div>
            </div>
            
            <div class="flight-duration">
                <div class="duration-text">${flight.duration}h</div>
                <div class="duration-line">
                    <i class="fas fa-plane plane-icon"></i>
                </div>
            </div>
            
            <div class="flight-time">
                <div class="time">${arrTime}</div>
                <div class="city">${flight.to}</div>
            </div>
        </div>
        
        <div class="flight-footer">
            <div>
                <span class="price-label">Price per passenger</span>
                <div class="flight-price" data-base-price="${flight.price}">${formatPrice(convertedPrice)}</div>
            </div>
            <button class="btn-primary" onclick='bookFlight(${JSON.stringify(flight)})'>
                <i class="fas fa-ticket-alt"></i> Book Now
            </button>
        </div>
    `;
    
    return card;
}

// Filter Flights
function handleFilterClick(e) {
    const filter = e.target.dataset.filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const flightCards = document.querySelectorAll('.flight-card');
    
    flightCards.forEach(card => {
        if (filter === 'all' || card.dataset.timeOfDay === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Check Flight Status
function checkFlightStatus(e) {
    e.preventDefault();
    
    const flightNumber = document.getElementById('flightNumber').value;
    const statusDate = document.getElementById('statusDate').value;
    
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        displayFlightStatus(flightNumber, statusDate);
        document.getElementById('statusResults').classList.remove('hidden');
        document.getElementById('statusResults').scrollIntoView({ behavior: 'smooth' });
    }, 1000);
}

// Display Flight Status
function displayFlightStatus(flightNumber, date) {
    const statusInfo = document.getElementById('statusInfo');
    
    const statuses = ['on-time', 'delayed', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let statusText = status === 'on-time' ? 'On Time' : status === 'delayed' ? 'Delayed by 45 minutes' : 'Cancelled';
    
    statusInfo.innerHTML = `
        <div class="status-card">
            <h3>Flight ${flightNumber}</h3>
            <span class="status-badge ${status}">${statusText}</span>
            
            <div class="status-timeline">
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div>
                        <strong>Scheduled Departure:</strong>
                        <p>${new Date(date).toLocaleDateString()} at 14:30</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div>
                        <strong>Estimated Arrival:</strong>
                        <p>${new Date(date).toLocaleDateString()} at 18:45</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div>
                        <strong>Gate:</strong>
                        <p>B${Math.floor(Math.random() * 20) + 1}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Book Flight
function bookFlight(flight) {
    currentBooking = {
        ...flight,
        searchParams: searchParams
    };
    
    generatePassengerInputs();
    document.getElementById('bookingModal').classList.add('active');
    goToStep(1);
}

// Generate Passenger Inputs
function generatePassengerInputs() {
    const container = document.getElementById('passengerInputs');
    const numPassengers = parseInt(searchParams.passengers);
    
    container.innerHTML = '';
    
    for (let i = 0; i < numPassengers; i++) {
        const passengerGroup = document.createElement('div');
        passengerGroup.className = 'passenger-group';
        passengerGroup.innerHTML = `
            <h5>Passenger ${i + 1}</h5>
            <div class="form-row">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="firstName${i}" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="lastName${i}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" id="dob${i}" required>
                </div>
                <div class="form-group">
                    <label>Passport Number</label>
                    <input type="text" id="passport${i}" required>
                </div>
            </div>
        `;
        container.appendChild(passengerGroup);
    }
}

// Step Navigation
function nextStep(step) {
    if (step === 2) {
        if (!validatePassengerForm()) return;
        updateBookingSummary();
    }
    goToStep(step);
}

function prevStep(step) {
    goToStep(step);
}

function goToStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
    document.getElementById(`step${step}`).classList.add('active');
}

// Validate Passenger Form
function validatePassengerForm() {
    const numPassengers = parseInt(searchParams.passengers);
    
    for (let i = 0; i < numPassengers; i++) {
        const firstName = document.getElementById(`firstName${i}`).value;
        const lastName = document.getElementById(`lastName${i}`).value;
        const dob = document.getElementById(`dob${i}`).value;
        const passport = document.getElementById(`passport${i}`).value;
        
        if (!firstName || !lastName || !dob || !passport) {
            alert('Please fill in all passenger details');
            return false;
        }
    }
    
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    
    if (!email || !phone) {
        alert('Please provide contact information');
        return false;
    }
    
    return true;
}

// Update Booking Summary
function updateBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    const numPassengers = parseInt(searchParams.passengers);
    const subtotal = currentBooking.price * numPassengers;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    const convertedSubtotal = convertPrice(subtotal);
    const convertedTax = convertPrice(tax);
    const convertedTotal = convertPrice(total);
    
    currentBooking.total = total;
    
    summary.innerHTML = `
        <div class="summary-row">
            <span>Flight:</span>
            <span>${currentBooking.airline} ${currentBooking.id}</span>
        </div>
        <div class="summary-row">
            <span>Route:</span>
            <span>${currentBooking.from} → ${currentBooking.to}</span>
        </div>
        <div class="summary-row">
            <span>Passengers:</span>
            <span>${numPassengers}</span>
        </div>
        <div class="summary-row">
            <span>Class:</span>
            <span>${searchParams.class.charAt(0).toUpperCase() + searchParams.class.slice(1)}</span>
        </div>
        <hr>
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>${formatPrice(convertedSubtotal)}</span>
        </div>
        <div class="summary-row">
            <span>Taxes & Fees:</span>
            <span>${formatPrice(convertedTax)}</span>
        </div>
        <div class="summary-row summary-total">
            <span>Total:</span>
            <span>${formatPrice(convertedTotal)}</span>
        </div>
    `;
}

// Payment Method Change
function handlePaymentMethodChange(e) {
    document.querySelectorAll('.payment-details').forEach(detail => {
        detail.classList.add('hidden');
    });
    
    const method = e.target.value;
    document.getElementById(`${method}Payment`).classList.remove('hidden');
}

// Process Payment
function processPayment(e) {
    e.preventDefault();
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiry = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        if (!cardNumber || !expiry || !cvv || !cardName) {
            alert('Please fill in all card details');
            return;
        }
    }
    
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        completeBooking();
    }, 2000);
}

// Complete Booking
function completeBooking() {
    const bookingRef = 'SW' + Math.random().toString(36).substr(2, 9).toUpperCase();
    currentBooking.bookingRef = bookingRef;
    
    document.getElementById('bookingRef').textContent = bookingRef;
    goToStep(3);
}

// Card Formatting
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
}

function formatCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
}

// Download Receipt
function downloadReceipt() {
    generateReceipt();
    document.getElementById('receiptModal').classList.add('active');
}

// Email Receipt
function emailReceipt() {
    const email = document.getElementById('contactEmail').value;
    alert(`Receipt will be sent to ${email}`);
}

// Generate Receipt
function generateReceipt() {
    const receipt = document.getElementById('receiptContent');
    const numPassengers = parseInt(searchParams.passengers);
    const subtotal = currentBooking.price * numPassengers;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    const convertedSubtotal = convertPrice(subtotal);
    const convertedTax = convertPrice(tax);
    const convertedTotal = convertPrice(total);
    
    const depTime = currentBooking.departTime.toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
    });
    const arrTime = currentBooking.arriveTime.toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
    });
    
    receipt.innerHTML = `
        <div class="receipt-header">
            <h2><i class="fas fa-plane-departure"></i> SkyWings Airlines</h2>
            <p>Booking Confirmation</p>
        </div>
        
        <div class="receipt-body">
            <div class="receipt-section">
                <h4>Booking Reference</h4>
                <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${currentBooking.bookingRef}</p>
            </div>
            
            <div class="receipt-section">
                <h4>Flight Details</h4>
                <div class="receipt-row">
                    <span>Flight Number:</span>
                    <strong>${currentBooking.airline} ${currentBooking.id}</strong>
                </div>
                <div class="receipt-row">
                    <span>From:</span>
                    <strong>${currentBooking.from}</strong>
                </div>
                <div class="receipt-row">
                    <span>To:</span>
                    <strong>${currentBooking.to}</strong>
                </div>
                <div class="receipt-row">
                    <span>Departure:</span>
                    <strong>${depTime}</strong>
                </div>
                <div class="receipt-row">
                    <span>Arrival:</span>
                    <strong>${arrTime}</strong>
                </div>
                <div class="receipt-row">
                    <span>Duration:</span>
                    <strong>${currentBooking.duration} hours</strong>
                </div>
            </div>
            
            <div class="receipt-section">
                <h4>Passenger Information</h4>
                <div class="receipt-row">
                    <span>Number of Passengers:</span>
                    <strong>${numPassengers}</strong>
                </div>
                <div class="receipt-row">
                    <span>Class:</span>
                    <strong>${searchParams.class.charAt(0).toUpperCase() + searchParams.class.slice(1)}</strong>
                </div>
            </div>
            
            <div class="receipt-section">
                <h4>Payment Summary</h4>
                <div class="receipt-row">
                    <span>Subtotal:</span>
                    <strong>${formatPrice(convertedSubtotal)}</strong>
                </div>
                <div class="receipt-row">
                    <span>Taxes & Fees:</span>
                    <strong>${formatPrice(convertedTax)}</strong>
                </div>
                <div class="receipt-row" style="font-size: 1.2rem;">
                    <span><strong>Total Paid:</strong></span>
                    <strong style="color: var(--primary-color);">${formatPrice(convertedTotal)}</strong>
                </div>
            </div>
        </div>
        
        <div class="receipt-footer">
            <p>Thank you for choosing SkyWings Airlines!</p>
            <p style="font-size: 0.9rem; color: #6c757d;">
                Please arrive at the airport at least 2 hours before departure.
            </p>
        </div>
    `;
}

// Print Receipt
function printReceipt() {
    window.print();
}

// Download Receipt as PDF
function downloadReceiptPDF() {
    alert('Receipt PDF download started. In a real application, this would generate and download a PDF file.');
}

// Close Receipt Modal
function closeReceipt() {
    document.getElementById('receiptModal').classList.remove('active');
}

// Close Booking Modal
function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
    currentBooking = null;
}

// Contact Form
function handleContactForm(e) {
    e.preventDefault();
    alert('Thank you for your message. We will get back to you soon!');
    e.target.reset();
}

// Loading
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});