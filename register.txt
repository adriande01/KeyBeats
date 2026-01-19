/* ===================================
   KEYBEATS REGISTRATION - JAVASCRIPT
   Step-by-step registration with validation
   =================================== */

// ===================================
// 1. GLOBAL VARIABLES & STATE
// ===================================

let currentStep = 1;
const totalSteps = 4;
let selectedAvatar = null;
let isAvatarGridExpanded = false;
let formData = {
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: ''
};

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
        window.location.href = 'main.html';
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
// 5. LOCALSTORAGE UTILITIES
// ===================================

function getUsersFromStorage() {
    const usersJSON = localStorage.getItem('keybeats_users');
    return usersJSON ? JSON.parse(usersJSON) : [];
}

function saveUsersToStorage(users) {
    localStorage.setItem('keybeats_users', JSON.stringify(users));
}

function checkNicknameExists(nickname) {
    const users = getUsersFromStorage();
    return users.some(user => user.nickname.toLowerCase() === nickname.toLowerCase());
}

function checkEmailExists(email) {
    const users = getUsersFromStorage();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

// ===================================
// 6. AVATAR SELECTION
// ===================================

function initializeAvatarSelection() {
    // Toggle avatar grid on button click
    $('#toggleAvatarBtn').on('click', function() {
        toggleAvatarGrid();
    });
    
    // Handle avatar selection
    $('.avatar-radio').on('change', function() {
        if ($(this).is(':checked')) {
            selectedAvatar = $(this).val();
            const avatarSrc = `assets/avatars/${selectedAvatar}.png`;
            
            // Update display avatar
            $('#selectedAvatarImage').attr('src', avatarSrc);
            
            // Store in form data
            formData.avatar = selectedAvatar;
            
            // Close grid after selection
            setTimeout(() => {
                toggleAvatarGrid();
            }, 300);
        }
    });
}

function toggleAvatarGrid() {
    const $gridContainer = $('#avatarGridContainer');
    const $toggleBtn = $('#toggleAvatarBtn');
    const $nicknameSection = $('#nicknameSection');
    const $toggleIcon = $('.toggle-icon');
    
    if (isAvatarGridExpanded) {
        // Close grid
        $gridContainer.slideUp(300);
        $nicknameSection.slideDown(300);
        $toggleBtn.attr('aria-expanded', 'false');
        $toggleIcon.css('transform', 'rotate(0deg)');
        isAvatarGridExpanded = false;
    } else {
        // Open grid
        $gridContainer.slideDown(300);
        $nicknameSection.slideUp(300);
        $toggleBtn.attr('aria-expanded', 'true');
        $toggleIcon.css('transform', 'rotate(180deg)');
        isAvatarGridExpanded = true;
    }
}

// ===================================
// 7. STEP NAVIGATION
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
    
    // Next button (hide on step 4)
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
// 8. VALIDATION SETUP
// ===================================

function initializeValidation() {
    // Custom validation methods
    $.validator.addMethod('validNickname', function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9_]{3,20}$/.test(value);
    }, 'Nickname must be 3-20 characters, alphanumeric and underscores only');
    
    $.validator.addMethod('strongPassword', function(value, element) {
        return this.optional(element) || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
    }, 'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, and 1 number');
    
    // Initialize jQuery Validation
    $('#registrationForm').validate({
        rules: {
            nickname: {
                required: true,
                validNickname: true
            },
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                strongPassword: true
            },
            confirmPassword: {
                required: true,
                equalTo: '#password'
            }
        },
        messages: {
            nickname: {
                required: 'Please enter a nickname'
            },
            email: {
                required: 'Please enter your email',
                email: 'Please enter a valid email address'
            },
            password: {
                required: 'Please enter a password'
            },
            confirmPassword: {
                required: 'Please confirm your password',
                equalTo: 'Passwords do not match'
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
// 9. STEP VALIDATION
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
        case 3:
            isValid = validateStep3();
            break;
        case 4:
            isValid = validateStep4();
            break;
    }
    
    return isValid;
}

function validateStep1() {
    const nickname = $('#nickname').val().trim();
    const $nicknameInput = $('#nickname');
    const $errorMsg = $('#nickname-error');
    const $availMsg = $('.availability-message');
    
    // Check if avatar selected
    if (!selectedAvatar) {
        showError('Please select an avatar');
        return false;
    }
    
    // Validate nickname
    if (!$nicknameInput.valid()) {
        return false;
    }
    
    // Check nickname availability via AJAX simulation
    if (checkNicknameExists(nickname)) {
        $errorMsg.text('This nickname is already taken');
        $availMsg.removeClass('available').addClass('unavailable').text('Nickname unavailable');
        $nicknameInput.addClass('error').removeClass('valid');
        return false;
    } else {
        $availMsg.removeClass('unavailable').addClass('available').text('Nickname available ✓');
        formData.nickname = nickname;
        return true;
    }
}

function validateStep2() {
    const email = $('#email').val().trim();
    const $emailInput = $('#email');
    const $errorMsg = $('#email-error');
    const $availMsg = $('#step2 .availability-message');
    
    // Validate email format
    if (!$emailInput.valid()) {
        return false;
    }
    
    // Check email availability via AJAX simulation
    if (checkEmailExists(email)) {
        $errorMsg.text('This email is already registered');
        $availMsg.removeClass('available').addClass('unavailable').text('Email already registered');
        $emailInput.addClass('error').removeClass('valid');
        return false;
    } else {
        $availMsg.removeClass('unavailable').addClass('available').text('Email available ✓');
        formData.email = email;
        return true;
    }
}

function validateStep3() {
    const password = $('#password').val();
    const $passwordInput = $('#password');
    
    // Validate password
    if (!$passwordInput.valid()) {
        return false;
    }
    
    formData.password = password;
    return true;
}

function validateStep4() {
    const confirmPassword = $('#confirmPassword').val();
    const $confirmInput = $('#confirmPassword');
    
    // Validate confirm password
    if (!$confirmInput.valid()) {
        return false;
    }
    
    formData.confirmPassword = confirmPassword;
    return true;
}

// ===================================
// 10. REAL-TIME VALIDATION
// ===================================

function setupRealtimeValidation() {
    // Nickname availability check
    $('#nickname').on('blur', function() {
        const nickname = $(this).val().trim();
        const $availMsg = $('.availability-message');
        
        if (nickname.length >= 3) {
            // Simulate AJAX check
            setTimeout(() => {
                if (checkNicknameExists(nickname)) {
                    $availMsg.removeClass('available').addClass('unavailable').text('Nickname unavailable');
                } else {
                    $availMsg.removeClass('unavailable').addClass('available').text('Nickname available ✓');
                }
            }, 300);
        } else {
            $availMsg.removeClass('available unavailable').text('');
        }
    });
    
    // Email availability check
    $('#email').on('blur', function() {
        const email = $(this).val().trim();
        const $availMsg = $('#step2 .availability-message');
        
        if (email.includes('@')) {
            // Simulate AJAX check
            setTimeout(() => {
                if (checkEmailExists(email)) {
                    $availMsg.removeClass('available').addClass('unavailable').text('Email already registered');
                } else {
                    $availMsg.removeClass('unavailable').addClass('available').text('Email available ✓');
                }
            }, 300);
        } else {
            $availMsg.removeClass('available unavailable').text('');
        }
    });
    
    // Password strength indicator
    $('#password').on('input', function() {
        updatePasswordStrength($(this).val());
    });
}

function updatePasswordStrength(password) {
    const $strengthFill = $('.strength-fill');
    const $strengthText = $('.strength-text');
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Normalize to 0-4 scale
    strength = Math.min(4, strength);
    
    $strengthFill.attr('data-strength', strength);
    
    const strengthTexts = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    $strengthText.text(strengthTexts[strength]);
}

// ===================================
// 11. TOGGLE PASSWORD VISIBILITY
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
// 12. TOOLTIPS
// ===================================

function initializeTooltips() {
    $('.info-tooltip').on('mouseenter focus', function() {
        const tooltipText = $(this).data('tooltip');
        const $tooltip = $('#tooltipContainer');
        const rect = this.getBoundingClientRect();
        
        $tooltip.text(tooltipText);
        $tooltip.css({
            display: 'block',
            top: (rect.top - 60) + 'px',
            left: (rect.left + rect.width / 2 - 100) + 'px'
        });
    });
    
    $('.info-tooltip').on('mouseleave blur', function() {
        $('#tooltipContainer').css('display', 'none');
    });
}

// ===================================
// 13. EVENT LISTENERS
// ===================================

function initializeEventListeners() {
    // Avatar selection
    initializeAvatarSelection();
    
    // Navigation buttons
    $('#nextBtn').on('click', function() {
        nextStep();
    });
    
    $('#backBtn').on('click', function() {
        previousStep();
    });
    
    // Form submission
    $('#registrationForm').on('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });
    
    // Real-time validation
    setupRealtimeValidation();
    
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
// 14. KEYBOARD SHORTCUTS
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
// 15. FORM SUBMISSION
// ===================================

function handleFormSubmit() {
    // Validate all steps
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading overlay
    showLoading();
    
    // Simulate async registration (AJAX would go here)
    setTimeout(() => {
        registerUser();
    }, 1500);
}

function registerUser() {
    try {
        // Get existing users
        const users = getUsersFromStorage();
        
        // Create new user object
        const newUser = {
            id: generateUserId(),
            nickname: formData.nickname,
            email: formData.email,
            password: formData.password, // In production, this should be hashed
            avatar: formData.avatar,
            level: 0,
            completedSongs: 0,
            songProgress: {}, // Will store stars per song
            createdAt: new Date().toISOString()
        };
        
        // Add to users array
        users.push(newUser);
        
        // Save to localStorage
        saveUsersToStorage(users);
        
        // Create session
        createSession(newUser);
        
        // Hide loading
        hideLoading();
        
        // Show success message
        showSuccess('Account created successfully!');
        
        // Redirect to login page after 1 second
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        
    } catch (error) {
        hideLoading();
        showError('Registration failed. Please try again.');
        console.error('Registration error:', error);
    }
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function createSession(user) {
    // Store session in cookie (7 days)
    const sessionData = {
        userId: user.id,
        nickname: user.nickname,
        avatar: user.avatar
    };
    
    setCookie('keybeats_session', JSON.stringify(sessionData), 7);
}

// ===================================
// 16. UI FEEDBACK
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
    $('body').append($notification);
    
    setTimeout(() => {
        $notification.addClass('show');
    }, 100);
    
    setTimeout(() => {
        $notification.removeClass('show');
        setTimeout(() => $notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    // Create error notification
    const $notification = $('<div class="notification error"></div>').text(message);
    $('body').append($notification);
    
    setTimeout(() => {
        $notification.addClass('show');
    }, 100);
    
    setTimeout(() => {
        $notification.removeClass('show');
        setTimeout(() => $notification.remove(), 300);
    }, 3000);
}

// ===================================
// 17. UTILITY FUNCTIONS
// ===================================

function resetForm() {
    $('#registrationForm')[0].reset();
    formData = {
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
        avatar: ''
    };
    selectedAvatar = null;
    showStep(1);
}

// ===================================
// 18. INITIALIZATION CALL
// ===================================

// All initialization happens in $(document).ready() at the top