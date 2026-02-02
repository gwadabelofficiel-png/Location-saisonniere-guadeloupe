// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ====================
// GALLERY LIGHTBOX
// ====================
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

const galleryItems = document.querySelectorAll('.gallery-item');
let currentImageIndex = 0;

const images = Array.from(galleryItems).map(item => ({
    src: item.querySelector('.gallery-image').src,
    title: item.querySelector('.gallery-title').textContent
}));

// Open lightbox
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentImageIndex = index;
        openLightbox();
    });
});

function openLightbox() {
    lightbox.classList.add('active');
    updateLightboxImage();
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function updateLightboxImage() {
    const currentImage = images[currentImageIndex];
    lightboxImage.src = currentImage.src;
    lightboxCaption.textContent = currentImage.title;
}

// Lightbox controls
lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

lightboxPrev.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateLightboxImage();
});

lightboxNext.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateLightboxImage();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    } else if (e.key === 'ArrowRight') {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
    }
});

// ====================
// CALENDAR & BOOKING
// ====================
let currentDate = new Date();
let selectedDates = [];
const bookedDates = [3, 4, 5, 15, 16, 22, 23, 24, 25]; // Example booked dates
const PRICE_PER_NIGHT = 850;
const CLEANING_FEE = 200;

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthDisplay = document.getElementById('currentMonth');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthDisplay.textContent = currentDate.toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
    });

    calendar.innerHTML = '';

    // Day headers
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    // Previous month days
    for (let i = 0; i < adjustedFirstDay; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day other-month';
        calendar.appendChild(dayCell);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.textContent = day;
        
        if (bookedDates.includes(day)) {
            dayCell.className = 'calendar-day booked';
        } else if (selectedDates.includes(day)) {
            dayCell.className = 'calendar-day selected';
        } else {
            dayCell.className = 'calendar-day available';
            dayCell.addEventListener('click', () => selectDate(day));
        }
        
        calendar.appendChild(dayCell);
    }

    updatePrice();
}

function selectDate(day) {
    if (selectedDates.length === 0) {
        // First selection (arrival)
        selectedDates.push(day);
    } else if (selectedDates.length === 1) {
        // Second selection (departure)
        selectedDates.push(day);
        selectedDates.sort((a, b) => a - b);
        
        // Check if there are booked dates in range
        const [start, end] = selectedDates;
        for (let d = start; d <= end; d++) {
            if (bookedDates.includes(d)) {
                alert('Désolé, certaines dates dans cette plage sont déjà réservées.');
                selectedDates = [];
                renderCalendar();
                return;
            }
        }
    } else {
        // Reset and start new selection
        selectedDates = [day];
    }
    renderCalendar();
}

function updatePrice() {
    const nightsCount = document.getElementById('nightsCount');
    const subtotal = document.getElementById('subtotal');
    const totalPrice = document.getElementById('totalPrice');
    
    if (selectedDates.length === 2) {
        const nights = selectedDates[1] - selectedDates[0];
        const subtotalAmount = nights * PRICE_PER_NIGHT;
        const total = subtotalAmount + CLEANING_FEE;
        
        nightsCount.textContent = nights;
        subtotal.textContent = subtotalAmount.toLocaleString('fr-FR') + '€';
        totalPrice.textContent = total.toLocaleString('fr-FR') + '€';
    } else {
        nightsCount.textContent = '0';
        subtotal.textContent = '0€';
        totalPrice.textContent = '0€';
    }
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    selectedDates = [];
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    selectedDates = [];
    renderCalendar();
});

// Initialize calendar
renderCalendar();

// Booking form submission
document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (selectedDates.length !== 2) {
        alert('Veuillez sélectionner vos dates d\'arrivée et de départ.');
        return;
    }
    
    const nights = selectedDates[1] - selectedDates[0];
    const total = (nights * PRICE_PER_NIGHT) + CLEANING_FEE;
    const formData = new FormData(e.target);
    const name = formData.get('nom') || e.target[0].value;
    const email = formData.get('email') || e.target[1].value;
    const phone = formData.get('telephone') || e.target[2].value;
    
    // Create WhatsApp message
    const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const message = `Bonjour, je souhaite réserver Villa Azur & Or
    
📅 Dates : ${selectedDates[0]} au ${selectedDates[1]} ${monthName}
🌙 Nombre de nuits : ${nights}
💰 Total : ${total.toLocaleString('fr-FR')}€

👤 Nom : ${name}
📧 Email : ${email}
📱 Téléphone : ${phone}

Merci !`;

    const whatsappUrl = `https://wa.me/590690977378?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
});

// ====================
// TESTIMONIALS CAROUSEL
// ====================
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');
const testimonialsTrack = document.getElementById('testimonialsTrack');
const dotsContainer = document.getElementById('carouselDots');

// Create dots
testimonials.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToTestimonial(index));
    dotsContainer.appendChild(dot);
});

function updateTestimonials() {
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentTestimonial);
    });

    testimonialsTrack.style.transform = `translateX(-${currentTestimonial * 100}%)`;
}

function goToTestimonial(index) {
    currentTestimonial = index;
    updateTestimonials();
}

document.querySelector('.testimonials-section .carousel-prev').addEventListener('click', () => {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    updateTestimonials();
});

document.querySelector('.testimonials-section .carousel-next').addEventListener('click', () => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    updateTestimonials();
});

// Auto-rotate testimonials
setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    updateTestimonials();
}, 6000);

// ====================
// CHAT WIDGET
// ====================
const chatTrigger = document.getElementById('chatTrigger');
const chatWidget = document.getElementById('chatWidget');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');

// Open chat
chatTrigger.addEventListener('click', () => {
    chatWidget.classList.add('active');
    chatTrigger.style.display = 'none';
    chatInput.focus();
});

// Close chat
chatClose.addEventListener('click', () => {
    chatWidget.classList.remove('active');
    chatTrigger.style.display = 'flex';
});

// Quick replies
document.querySelectorAll('.quick-reply').forEach(button => {
    button.addEventListener('click', (e) => {
        const message = e.target.dataset.message;
        addUserMessage(message);
        setTimeout(() => respondToQuickReply(message), 800);
        e.target.parentElement.style.display = 'none';
    });
});

// Send message
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addUserMessage(message);
    chatInput.value = '';
    
    setTimeout(() => {
        addBotMessage("Merci pour votre message ! Un de nos conseillers va vous répondre dans quelques instants. Pour une réponse immédiate, vous pouvez aussi nous contacter au +590 690 97 73 78 ou via WhatsApp. 😊");
    }, 1000);
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user';
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot';
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function respondToQuickReply(type) {
    let response = '';
    switch(type) {
        case 'Disponibilités':
            response = "Pour vérifier nos disponibilités en temps réel, je vous invite à nous contacter directement :<br><br>📞 Téléphone : +590 690 97 73 78<br>💬 WhatsApp : Cliquez sur le bouton vert en bas à droite<br>📧 Email : gwadabelofficiel@gmail.com<br><br>Nous vous répondrons dans l'heure ! 😊";
            break;
        case 'Tarifs':
            response = "Nos tarifs :<br><br>💰 Tarif par nuit : 850€<br>🧹 Frais de ménage : 200€<br><br>🌴 Basse saison (mai-nov) : -15%<br>☀️ Haute saison (déc-avril) : Tarif standard<br>🎄 Période fêtes : +20%<br><br>Utilisez le calendrier de réservation ci-dessus pour voir le prix exact ! 😊";
            break;
        case 'Services':
            response = "Services inclus :<br>✅ Piscine chauffée<br>✅ WiFi fibre<br>✅ Linge de maison<br>✅ Ménage fin de séjour<br><br>Services sur demande :<br>⭐ Chef privé (150€/repas)<br>⭐ Majordome 24/7 (200€/jour)<br>⭐ Spa & massages (100€/h)<br>⭐ Excursions privées<br><br>Besoin de plus d'infos ?";
            break;
        case 'Contact':
            response = "Parfait ! Voici comment nous joindre :<br><br>📞 Téléphone : +590 690 97 73 78<br>💬 WhatsApp : Clic sur le bouton vert<br>📧 Email : gwadabelofficiel@gmail.com<br><br>Nous sommes disponibles 7j/7 de 8h à 20h. À tout de suite ! 😊";
            break;
        default:
            response = "Merci ! Comment puis-je vous aider ?";
    }
    addBotMessage(response);
}