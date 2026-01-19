

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

// Base API path
const API_BASE = 'api/';

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
    const sessionToken = getCookie('keybeats_session');

    if (sessionToken) {
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

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// ===================================
// 5. AVATAR SELECTION
// ===================================

function initializeAvatarSelection() {
    $('#toggleAvatarBtn').on('click', function() {
        toggleAvatarGrid();
    });

    $('.avatar-radio').on('change', function() {
        if ($(this).is(':checked')) {
            selectedAvatar = $(this).val();
            const avatarSrc = `assets/avatars/${selectedAvatar}.png`;

            $('#selectedAvatarImage').attr('src', avatarSrc);
            formData.avatar = selectedAvatar;

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
        $gridContainer.slideUp(300);
        $nicknameSection.slideDown(300);
        $toggleBtn.attr('aria-expanded', 'false');
        $toggleIcon.css('transform', 'rotate(0deg)');
        isAvatarGridExpanded = false;
    } else {
        $gridContainer.slideDown(300);
        $nicknameSection.slideUp(300);
        $toggleBtn.attr('aria-expanded', 'true');
        $toggleIcon.css('transform', 'rotate(180deg)');
        isAvatarGridExpanded = true;
    }
}

// ===================================
// 6. STEP NAVIGATION
// ===================================

function showStep(step) {
    $('.form-step').removeClass('active');
    $(`#step${step}`).addClass('active');

    currentStep = step;
    updateNavigationButtons();

    setTimeout(() => {
        $(`#step${step} input:visible:first`).focus();
    }, 100);
}

function updateNavigationButtons() {
    const $backBtn = $('#backBtn');
    const $nextBtn = $('#nextBtn');
    const $submitBtn = $('#submitBtn');

    if (currentStep === 1) {
        $backBtn.hide();
    } else {
        $backBtn.show();
    }

    if (currentStep === totalSteps) {
        $nextBtn.hide();
        $submitBtn.show();
    } else {
        $nextBtn.show();
        $submitBtn.hide();
    }
}

function nextStep() {
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
// 7. VALIDATION SETUP
// ===================================

function initializeValidation() {
    $.validator.addMethod('validNickname', function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9_]{3,20}$/.test(value);
    }, 'Nickname must be 3-20 characters, alphanumeric and underscores only');

    $.validator.addMethod('strongPassword', function(value, element) {
        return this.optional(element) || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
    }, 'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, and 1 number');

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
// 8. STEP VALIDATION WITH AJAX
// ===================================

function validateCurrentStep() {
    let isValid = true;

    switch (currentStep) {
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

    if (!selectedAvatar) {
        showError('Please select an avatar');
        return false;
    }

    if (!$nicknameInput.valid()) {
        return false;
    }

    let isAvailable = false;

    $.ajax({
        url: API_BASE + 'check-nickname.php',
        type: 'POST',
        data: { nickname: nickname },
        async: false,
        success: function(response) {
            if (response.exists) {
                $errorMsg.text('This nickname is already taken');
                $availMsg.removeClass('available')
                         .addClass('unavailable')
                         .text('Nickname unavailable');
                $nicknameInput.addClass('error').removeClass('valid');
                isAvailable = false;
            } else {
                $availMsg.removeClass('unavailable')
                         .addClass('available')
                         .text('Nickname available ✓');
                formData.nickname = nickname;
                isAvailable = true;
            }
        },
        error: function() {
            showError('Error checking nickname');
            isAvailable = false;
        }
    });

    return isAvailable;
}

function validateStep2() {
    const email = $('#email').val().trim();
    const $emailInput = $('#email');
    const $errorMsg = $('#email-error');
    const $availMsg = $('#step2 .availability-message');

    if (!$emailInput.valid()) {
        return false;
    }

    let isAvailable = false;

    $.ajax({
        url: API_BASE + 'check-email.php',
        type: 'POST',
        data: { email: email },
        async: false,
        success: function(response) {
            if (response.exists) {
                $errorMsg.text('This email is already registered');
                $availMsg.removeClass('available')
                         .addClass('unavailable')
                         .text('Email already registered');
                $emailInput.addClass('error').removeClass('valid');
                isAvailable = false;
            } else {
                $availMsg.removeClass('unavailable')
                         .addClass('available')
                         .text('Email available ✓');
                formData.email = email;
                isAvailable = true;
            }
        },
        error: function() {
            showError('Error checking email');
            isAvailable = false;
        }
    });

    return isAvailable;
}

function validateStep3() {
    const password = $('#password').val();
    const $passwordInput = $('#password');

    if (!$passwordInput.valid()) {
        return false;
    }

    formData.password = password;
    return true;
}

function validateStep4() {
    const confirmPassword = $('#confirmPassword').val();
    const $confirmInput = $('#confirmPassword');

    if (!$confirmInput.valid()) {
        return false;
    }

    formData.confirmPassword = confirmPassword;
    return true;
}

// ===================================
// 9. REAL-TIME VALIDATION (AJAX)
// ===================================

function setupRealtimeValidation() {
    $('#nickname').on('blur', function() {
        const nickname = $(this).val().trim();
        const $availMsg = $('.availability-message');

        if (nickname.length >= 3) {
            $.post(API_BASE + 'check-nickname.php', { nickname }, function(response) {
                if (response.exists) {
                    $availMsg.removeClass('available')
                             .addClass('unavailable')
                             .text('Nickname unavailable');
                } else {
                    $availMsg.removeClass('unavailable')
                             .addClass('available')
                             .text('Nickname available ✓');
                }
            });
        } else {
            $availMsg.removeClass('available unavailable').text('');
        }
    });

    $('#email').on('blur', function() {
        const email = $(this).val().trim();
        const $availMsg = $('#step2 .availability-message');

        if (email.includes('@')) {
            $.post(API_BASE + 'check-email.php', { email }, function(response) {
                if (response.exists) {
                    $availMsg.removeClass('available')
                             .addClass('unavailable')
                             .text('Email already registered');
                } else {
                    $availMsg.removeClass('unavailable')
                             .addClass('available')
                             .text('Email available ✓');
                }
            });
        } else {
            $availMsg.removeClass('available unavailable').text('');
        }
    });

    $('#password').on('input', function() {
        updatePasswordStrength($(this).val());
    });
}

// ===================================
// 10. PASSWORD STRENGTH
// ===================================

function updatePasswordStrength(password) {
    const $strengthFill = $('.strength-fill');
    const $strengthText = $('.strength-text');
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

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
// 12. TOOLTIP FIX (POP-UP STYLE)
// ===================================

function initializeTooltips() {
    $('.info-tooltip').on('mouseenter focus', function() {
        const tooltipText = $(this).data('tooltip');
        const $tooltip = $('#tooltipContainer');
        const rect = this.getBoundingClientRect();

        $tooltip.text(tooltipText);

        const tooltipWidth = $tooltip.outerWidth();
        const leftPos = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        const topPos = rect.top - 50;

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
// 13. EVENT LISTENERS
// ===================================

function initializeEventListeners() {
    initializeAvatarSelection();

    $('#nextBtn').on('click', function() {
        nextStep();
    });

    $('#backBtn').on('click', function() {
        previousStep();
    });

    $('#registrationForm').on('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });

    setupRealtimeValidation();
    setupPasswordToggle();
    setupKeyboardShortcuts();

    $('.form-input').on('focus', function() {
        $(this).select();
    });
}

// ===================================
// 14. KEYBOARD SHORTCUTS
// ===================================

function setupKeyboardShortcuts() {
    $(document).on('keydown', function(e) {
        if (e.key === 'Enter' && !$(e.target).is('textarea') && currentStep < totalSteps) {
            e.preventDefault();
            $('#nextBtn').click();
        }

        if (e.key === 'Escape' && currentStep > 1) {
            e.preventDefault();
            $('#backBtn').click();
        }
    });
}

// ===================================
// 15. FORM SUBMISSION (AJAX)
// ===================================

function handleFormSubmit() {
    if (!validateCurrentStep()) {
        return;
    }

    showLoading();

    $.ajax({
        url: API_BASE + 'register-user.php',
        type: 'POST',
        data: {
            nickname: formData.nickname,
            email: formData.email,
            password: formData.password,
            avatar: formData.avatar
        },
        success: function(response) {
            hideLoading();

            if (response.success) {
                showSuccess('Account created successfully!');

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            } else {
                showError(response.message || 'Registration failed');
            }
        },
        error: function() {
            hideLoading();
            showError('Server error during registration');
        }
    });
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
// 17. RESET FORM
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
