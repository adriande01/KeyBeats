/* ===================================
   KEYBEATS LOGIN - JAVASCRIPT
   Step-by-step login with validation
   =================================== */

// ===================================
// 1. GLOBAL VARIABLES & STATE
// ===================================

// Base API path
const API_BASE = 'api/';

let currentStep = 1;
const totalSteps = 2;
let userEmail = '';

// ===================================
// 2. DOCUMENT READY
// ===================================

$(document).ready(function() {
    // Check if user already has session
    checkExistingSession();
    
    // Initialize form validation
    initializeValidation();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Show first step
    showStep(1);
});

// ===================================
// 3. SESSION CHECK
// ===================================

function checkExistingSession() {
    // Check if session cookie exists
    const sessionToken = getCookie('keybeats_session');
    
    if (sessionToken) {
        // User already logged in, redirect to main page
        window.location.href = 'index.html';
    }
}

// ===================================
// 4. COOKIE UTILITIES
// ===================================

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// ===================================
// 5. STEP NAVIGATION
// ===================================

function showStep(step) {
    // Hide all steps
    $('.form-step').removeClass('active');
    
    // Show current step
    $(`#step${step}`).addClass('active');
    
    // Update current step
    currentStep = step;
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Focus on first input of step
    setTimeout(() => {
        $(`#step${step} input:visible:first`).focus();
    }, 100);
}

function updateNavigationButtons() {
    const $backBtn = $('#backBtn');
    const $nextBtn = $('#nextBtn');
    const $submitBtn = $('#submitBtn');
    
    // Back button (hide on step 1)
    if (currentStep === 1) {
        $backBtn.hide();
    } else {
        $backBtn.show();
    }
    
    // Next button (hide on step 2)
    if (currentStep === totalSteps) {
        $nextBtn.hide();
        $submitBtn.show();
    } else {
        $nextBtn.show();
        $submitBtn.hide();
    }
}

function nextStep() {
    // Validate current step before proceeding
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

// ===================================
// 6. VALIDATION SETUP
// ===================================

function initializeValidation() {
    // Initialize jQuery Validation
    $('#loginForm').validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true
            }
        },
        messages: {
            email: {
                required: 'Please enter your email',
                email: 'Please enter a valid email address'
            },
            password: {
                required: 'Please enter your password'
            }
        },
        errorPlacement: function(error, element) {
            const fieldName = element.attr('name');
            $(`#${fieldName}-error`).html(error.text());
        },
        highlight: function(element) {
            $(element).addClass('error').removeClass('valid');
        },
        unhighlight: function(element) {
            $(element).removeClass('error').addClass('valid');
        },
        submitHandler: function(form) {
            handleFormSubmit();
            return false;
        }
    });
}

// ===================================
// 7. STEP VALIDATION
// ===================================

function validateCurrentStep() {
    let isValid = true;
    
    switch(currentStep) {
        case 1:
            isValid = validateStep1();
            break;
        case 2:
            isValid = validateStep2();
            break;
    }
    
    return isValid;
}

function validateStep1() {
    const email = $('#email').val().trim();
    const $emailInput = $('#email');
    const $errorMsg = $('#email-error');
    
    // Validate email format
    if (!$emailInput.valid()) {
        return false;
    }
    
    // Check if email exists via AJAX
    let emailExists = false;
    
    $.ajax({
        url: API_BASE + 'check-email.php',
        method: 'POST',
        data: { email: email },
        async: false,
        success: function(response) {
            /*
            if (typeof response === 'string') {
                response = JSON.parse(response);
            }
                */
            emailExists = response.exists;
            
        },
        error: function() {
            showError('Connection error. Please try again.');
        }
    });
    
    if (!emailExists) {
        $errorMsg.text('This email is not registered');
        $emailInput.addClass('error').removeClass('valid');
        return false;
    } else {
        // Store email for next step
        userEmail = email;
        return true;
    }
}

function validateStep2() {
    const password = $('#password').val();
    const $passwordInput = $('#password');
    
    // Validate password format
    if (!$passwordInput.valid()) {
        return false;
    }
    
    return true;
}

// ===================================
// 8. TOGGLE PASSWORD VISIBILITY
// ===================================

function setupPasswordToggle() {
    $('.toggle-password').on('click', function() {
        const targetId = $(this).data('target');
        const $input = $(`#${targetId}`);
        const $icon = $(this).find('i');
        
        if ($input.attr('type') === 'password') {
            $input.attr('type', 'text');
            $icon.removeClass('fa-eye').addClass('fa-eye-slash');
            $(this).attr('aria-label', 'Hide password');
        } else {
            $input.attr('type', 'password');
            $icon.removeClass('fa-eye-slash').addClass('fa-eye');
            $(this).attr('aria-label', 'Show password');
        }
    });
}

// ===================================
// 9. TOOLTIPS
// ===================================

function initializeTooltips() {
     $('.info-tooltip').on('mouseenter focus', function() {
        const tooltipText = $(this).data('tooltip');
        const $tooltip = $('#tooltipContainer');
        const offset = $(this).offset();

        $tooltip.text(tooltipText);

        const tooltipWidth = $tooltip.outerWidth();
        const leftPos = offset.left + ($(this).outerWidth() / 2) - (tooltipWidth / 2);
        const topPos = offset.top - $tooltip.outerHeight() - 12;

        $tooltip.css({
            display: 'block',
            top: topPos + 'px',
            left: leftPos + 'px'
        });

        $tooltip.addClass('show');
    });

    $('.info-tooltip').on('mouseleave blur', function() {
        $('#tooltipContainer').removeClass('show').hide();
    });
}

// ===================================
// 10. EVENT LISTENERS
// ===================================

function initializeEventListeners() {
    // Navigation buttons
    $('#nextBtn').on('click', function() {
        nextStep();
    });
    
    $('#backBtn').on('click', function() {
        previousStep();
    });
    
    // Form submission
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });
    
    // Password toggle
    setupPasswordToggle();
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Auto-focus on input when step changes
    $('.form-input').on('focus', function() {
        $(this).select();
    });
}

// ===================================
// 11. KEYBOARD SHORTCUTS
// ===================================

function setupKeyboardShortcuts() {
    $(document).on('keydown', function(e) {
        // Enter key to go next (if not in textarea)
        if (e.key === 'Enter' && !$(e.target).is('textarea') && currentStep < totalSteps) {
            e.preventDefault();
            $('#nextBtn').click();
        }
        
        // Escape key to go back
        if (e.key === 'Escape' && currentStep > 1) {
            e.preventDefault();
            $('#backBtn').click();
        }
    });
}

// ===================================
// 12. FORM SUBMISSION
// ===================================

function handleFormSubmit() {
    // Validate current step
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading overlay
    showLoading();
    
    // Get form data
    const email = userEmail;
    const password = $('#password').val();
    
    // AJAX request to login.php
    $.ajax({
        url: API_BASE + 'login.php',
        method: 'POST',
        data: {
            email: email,
            password: password
        },
        success: function(response) {
            handleLoginResponse(response);
        },
        error: function() {
            hideLoading();
            showError('Connection error. Please try again.');
        }
    });
}

function handleLoginResponse(response) {
    try {
        //const result = JSON.parse(response);
        console.log(response);
        if (response.success) {
            
            // Login successful
            const user = response.user;
            
            // Create session cookie
            createSession(user);
            
            // Hide loading
            hideLoading();
            
            // Show success message
            showSuccess('Login successful!');
            
            // Redirect to index.html
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } else {
            // Login failed - incorrect password
            hideLoading();
            
            const $passwordError = $('#password-error');
            const $passwordInput = $('#password');
            
            $passwordError.text(response.message || 'Incorrect password');
            $passwordInput.addClass('error').removeClass('valid');
            
            // Clear password field
            $passwordInput.val('');
            $passwordInput.focus();
        }
        
    } catch (error) {
        hideLoading();
        showError('Login failed. Please try again.');
        console.error('Login error:', error);
    }
}

function createSession(user) {
    // Store session in cookie (7 days)
    const sessionData = {
        userId: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level
    };
    
    setCookie('keybeats_session', JSON.stringify(sessionData), 7);
}

// ===================================
// 13. UI FEEDBACK
// ===================================

function showLoading() {
    $('#loadingOverlay').fadeIn(300);
}

function hideLoading() {
    $('#loadingOverlay').fadeOut(300);
}

function showSuccess(message) {
    // Create success notification
    const $notification = $('<div class="notification success"></div>').text(message);
    
    // Add notification styles if not already in CSS
    $notification.css({
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#98D8C8',
        color: '#FFFFFF',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 10000,
        fontWeight: '600',
        opacity: 0,
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });
    
    $('body').append($notification);
    
    setTimeout(() => {
        $notification.css({
            opacity: 1,
            transform: 'translateY(0)'
        });
    }, 100);
    
    setTimeout(() => {
        $notification.css({
            opacity: 0,
            transform: 'translateY(-20px)'
        });
        setTimeout(() => $notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    // Create error notification
    const $notification = $('<div class="notification error"></div>').text(message);
    
    // Add notification styles if not already in CSS
    $notification.css({
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#FF6B6B',
        color: '#FFFFFF',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 10000,
        fontWeight: '600',
        opacity: 0,
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });
    
    $('body').append($notification);
    
    setTimeout(() => {
        $notification.css({
            opacity: 1,
            transform: 'translateY(0)'
        });
    }, 100);
    
    setTimeout(() => {
        $notification.css({
            opacity: 0,
            transform: 'translateY(-20px)'
        });
        setTimeout(() => $notification.remove(), 300);
    }, 3000);
}

// ===================================
// 14. INITIALIZATION CALL
// ===================================

// All initialization happens in $(document).ready() at the top