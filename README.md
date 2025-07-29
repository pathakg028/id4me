component_name: "MobileVerification"
file_path: "/Users/gauravpathak/Desktop/id4me/src/container/MobileVerification.tsx"
component_type: "Container Component"
description: "Multi-step mobile verification and onboarding flow with lazy loading, real-time validation, and performance optimizations"

metadata:
  created_date: "2024-01-01"
  last_modified: "2024-12-29"
  author: "Gaurav Pathak"
  version: "1.0.0"
  status: "production"

dependencies:
  react_imports:
    - "React"
    - "useRef"
    - "useEffect" 
    - "useState"
    - "lazy"
    - "Suspense"
  
  third_party_libraries:
    - name: "react-hook-form"
      imports: ["useForm"]
      purpose: "Form state management and validation"
    
    - name: "custom_components"
      imports:
        - "Button"
        - "PasswordInput"
        - "PasswordStrengthIndicator"
        - "Input"
        - "OTPInput"
      path: "../components/"
    
    - name: "redux_toolkit"
      imports:
        - "useAppDispatch"
        - "useAppSelector"
      path: "../app/hooks"
    
    - name: "utils"
      imports: ["validatePassword"]
      path: "../utils/passwordFieldValidation"
    
    - name: "custom_hooks"
      imports: ["useDebounce"]
      path: "../hooks/useDebounce"

lazy_loading:
  components:
    profile_form:
      import_path: "../components/ProfileForm"
      loading_strategy: "React.lazy()"
      fallback_component: "ProfileFormLoader"
      
  fallback_loader:
    name: "ProfileFormLoader"
    type: "functional_component"
    styling: "flex items-center justify-center p-8"
    elements:
      - type: "spinner"
        classes: "animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
      - type: "text"
        content: "Loading profile form..."
        classes: "ml-3 text-gray-600"

component_interface:
  props:
    className:
      type: "string"
      required: false
      description: "Additional CSS classes"

type_definitions:
  mobile_form_values:
    name: "MobileFormValues"
    structure:
      mobile:
        type: "string"
        validation: "10-digit number"

redux_integration:
  slice: "mobileVerification"
  state_properties:
    - mobile: "string"
    - verified: "boolean"
    - loading: "boolean"
    - error: "string | null"
    - otpSent: "boolean"
    - otpLoading: "boolean"
    - otpError: "string | null"
    - step: "string"
  
  actions:
    - checkMobileExists
    - sendOTP
    - verifyOTP
    - setMobile
    - resetVerification
    - clearError
    - resetOTP

local_state_management:
  form_state:
    current_step:
      type: "number"
      initial_value: 1
      description: "Current step in onboarding flow"
    
    profile_submitted:
      type: "boolean"
      initial_value: false
      description: "Profile form submission status"
    
    otp:
      type: "string"
      initial_value: ""
      description: "OTP input value"
    
    countdown:
      type: "number"
      initial_value: 0
      description: "OTP resend countdown timer"
  
  password_state:
    password:
      type: "string"
      initial_value: ""
      validation: "Password strength requirements"
    
    confirm_password:
      type: "string"
      initial_value: ""
      validation: "Must match password"
    
    password_error:
      type: "string"
      initial_value: ""
      description: "Password validation error message"
    
    confirm_password_error:
      type: "string"
      initial_value: ""
      description: "Password confirmation error message"
    
    show_welcome:
      type: "boolean"
      initial_value: false
      description: "Show completion screen"

refs_and_timers:
  input_ref:
    type: "HTMLInputElement"
    purpose: "Auto-focus mobile input"
  
  timeout_ref:
    type: "NodeJS.Timeout | null"
    purpose: "Cleanup timeouts"

form_configuration:
  mobile_form:
    library: "react-hook-form"
    default_values:
      mobile: "localStorage.getItem('mobile') || ''"
    
    validation_rules:
      mobile:
        required: "Mobile number is required"
        pattern:
          value: "/^\\d{10}$/"
          message: "Enter a valid 10-digit mobile number"
        onChange: "Real-time sanitization and validation"
    
    debounce_configuration:
      current_mobile: "watchMobile('mobile')"
      debounced_mobile: "useDebounce(currentMobile, 800)"

use_effects:
  auto_focus:
    description: "Auto-focus mobile input on mount"
    dependencies: []
    cleanup: "Clear timeout"
    
  mobile_existence_check:
    description: "Auto-check mobile existence when user stops typing"
    dependencies: ["debouncedMobile", "dispatch"]
    trigger_condition: "10-digit valid mobile number"
    cleanup: "None required"
    
  countdown_timer:
    description: "OTP resend countdown timer"
    dependencies: ["countdown"]
    cleanup: "Clear interval timer"
    
  local_storage_sync:
    description: "Auto-save valid mobile to localStorage"
    dependencies: ["mobile"]
    cleanup: "None required"
    
  keyboard_shortcuts:
    description: "Global keyboard event handling"
    dependencies: ["currentStep", "dispatch"]
    shortcuts:
      reset_form: "Ctrl/Cmd + R"
      clear_errors: "Escape"
    cleanup: "Remove event listeners"
    
  auto_verify_otp:
    description: "Auto-verify OTP when complete"
    dependencies: ["otp", "mobile", "step", "dispatch"]
    debounce: "500ms"
    cleanup: "Clear verification timeout"

step_flow:
  step_1_mobile_verification:
    substeps:
      input:
        description: "Mobile number input with real-time validation"
        features:
          - real_time_validation
          - api_integration
          - debounced_calls
          - loading_indicators
          - error_handling
      
      otp:
        description: "OTP verification with auto-verify"
        features:
          - auto_verify
          - manual_verification
          - resend_functionality
          - countdown_timer
          - error_handling
      
      verified:
        description: "Verification success state"
        features:
          - success_message
          - navigation_to_next_step
  
  step_2_profile_setup:
    features:
      - lazy_loading
      - suspense_boundary
      - form_validation
      - navigation_controls
    
    states:
      not_submitted: "Show ProfileForm with lazy loading"
      submitted: "Show navigation buttons"
  
  step_3_password_creation:
    features:
      - password_strength_validation
      - real_time_matching
      - completion_screen
    
    states:
      password_setup: "Password creation form"
      welcome: "Onboarding completion screen"

progress_tracking:
  progress_calculation:
    step_1:
      verified: "33.33%"
      otp: "20%"
      default: "10%"
    step_2:
      submitted: "66.66%"
      default: "50%"
    step_3:
      welcome: "100%"
      default: "80%"
  
  step_status:
    completed: "Step finished"
    active: "Current step"
    inactive: "Future step"

event_handlers:
  mobile_submission:
    name: "onMobileSubmit"
    parameters: ["MobileFormValues"]
    actions:
      - validate_mobile_length
      - dispatch_set_mobile
      - check_mobile_exists
      - send_otp_if_available
      - start_countdown
  
  otp_handling:
    otp_change:
      name: "handleOtpChange"
      parameters: ["string"]
      actions: ["set_otp", "clear_errors"]
    
    otp_complete:
      name: "handleOtpComplete"
      parameters: ["string"]
      actions: ["set_otp", "auto_verify"]
    
    verify_otp:
      name: "handleVerifyOtp"
      actions: ["dispatch_verify_otp"]
    
    resend_otp:
      name: "handleResendOtp"
      actions: ["clear_otp", "clear_errors", "send_new_otp", "restart_countdown"]
    
    change_mobile:
      name: "handleChangeMobile"
      actions: ["reset_otp_state", "clear_countdown"]
  
  password_handling:
    password_submit:
      name: "onPasswordSubmit"
      validation:
        - password_strength
        - password_matching
      success_action: "show_welcome_screen"
  
  navigation:
    next_step:
      name: "handleNext"
      action: "increment_current_step"
    
    previous_step:
      name: "handleBack"
      action: "decrement_current_step"
      special_case: "reset_mobile_on_step_1"

validation_logic:
  mobile_validation:
    name: "getMobileValidationStatus"
    conditions:
      empty: "null"
      incomplete: "< 10 digits"
      invalid: "non-numeric characters"
      checking: "API call in progress"
      error: "API error occurred"
      valid: "10 digits, no errors"

ui_components:
  header:
    title: "Onboarding App"
    styling: "text-2xl md:text-3xl font-bold mb-4 text-center"
  
  progress_section:
    step_indicators:
      count: 3
      labels: ["Mobile", "Profile", "Password"]
      states: ["active", "completed", "inactive"]
    
    progress_bar:
      type: "animated"
      calculation: "dynamic based on step completion"
    
    progress_text:
      format: "Step {current} of 3 • {percentage}% Complete"
  
  step_content:
    step_1:
      mobile_input:
        type: "tel"
        placeholder: "Enter your mobile number"
        validation: "real-time"
        max_length: 10
        sanitization: "numeric only"
      
      validation_feedback:
        checking: "🔍 Checking mobile number..."
        error: "❌ {error_message}"
        valid: "✅ Mobile number is available"
        invalid: "❌ Please enter a valid 10-digit mobile number"
        incomplete: "📱 Enter {remaining} more digits"
      
      api_status_display:
        background: "bg-blue-50"
        border: "border-blue-200"
        text: "API connection status and instructions"
      
      otp_verification:
        title: "Verify Your Mobile"
        description: "6-digit code sent to masked number"
        otp_input:
          length: 6
          auto_focus: true
          auto_complete: true
        success_message: "✅ OTP sent successfully! Use: 123456"
        resend_functionality:
          countdown: "30 seconds"
          button_text: "Resend OTP"
    
    step_2:
      lazy_loading:
        component: "ProfileForm"
        fallback: "ProfileFormLoader"
        suspense_boundary: true
      
      navigation:
        back_button: "variant: secondary"
        next_button: "primary action"
    
    step_3:
      password_creation:
        password_input: "with visibility toggle"
        strength_indicator: "real-time validation"
        confirm_password: "matching validation"
        submit_button: "disabled until valid"
      
      welcome_screen:
        title: "Welcome Onboard! 🎉"
        success_message: "✅ Account created successfully!"
        user_info: "Mobile: {mobile} | Verified: ✅"
        final_action: "Get Started button"

styling_configuration:
  css_classes:
    container: "w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto p-4 md:p-8 border rounded-md shadow-md bg-white min-h-screen flex flex-col justify-center"
    
    form_elements:
      input_base: "w-full border border-gray-300 rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
      input_error: "border-red-500"
      input_valid: "border-green-500"
      button_full: "w-full"
      button_responsive: "w-full sm:w-auto"
    
    feedback_messages:
      error: "text-red-500 text-sm"
      success: "text-green-500 text-sm"
      info: "text-blue-500 text-sm"
      warning: "text-gray-500 text-sm"
    
    step_indicators:
      container: "step-indicators mb-4"
      indicator: "step-indicator"
      circle: "step-circle"
      label: "step-label"
      states:
        active: "active"
        completed: "completed"
    
    progress_bar:
      container: "progress-container"
      bar: "progress-bar"

performance_optimizations:
  debouncing:
    mobile_validation: "800ms delay"
    otp_verification: "500ms delay"
  
  lazy_loading:
    profile_form: "React.lazy() with Suspense"
  
  cleanup_patterns:
    timeouts: "useEffect cleanup functions"
    event_listeners: "addEventListener/removeEventListener pairs"
    intervals: "clearInterval on unmount"

accessibility:
  keyboard_navigation:
    tab_order: "logical flow through form elements"
    shortcuts:
      reset: "Ctrl/Cmd + R"
      clear_errors: "Escape"
  
  aria_labels:
    progress_indicators: "Step completion status"
    form_inputs: "Input field descriptions"
    error_messages: "Error announcements"
  
  focus_management:
    auto_focus: "Mobile input on mount"
    focus_trapping: "Within current step"

security_considerations:
  input_sanitization:
    mobile_number: "Numeric characters only, max 10 digits"
    password: "No client-side storage of password"
  
  data_persistence:
    localStorage: "Only mobile number for UX"
    sensitive_data: "Not stored client-side"
  
  api_security:
    rate_limiting: "Debounced requests"
    error_handling: "No sensitive info in error messages"

testing_considerations:
  unit_tests:
    - component_rendering
    - form_validation
    - state_transitions
    - event_handlers
  
  integration_tests:
    - full_user_flow
    - api_interactions
    - error_scenarios
    - keyboard_navigation
  
  accessibility_tests:
    - screen_reader_compatibility
    - keyboard_only_navigation
    - color_contrast
    - focus_indicators

browser_compatibility:
  target_browsers:
    - "Chrome 90+"
    - "Firefox 88+"
    - "Safari 14+"
    - "Edge 90+"
  
  polyfills_needed: []
  
  responsive_design:
    breakpoints:
      mobile: "max-width: 768px"
      tablet: "768px - 1024px"
      desktop: "1024px+"

deployment_considerations:
  build_optimization:
    code_splitting: "Automatic with lazy loading"
    bundle_analysis: "Profile component loading"
    performance_monitoring: "Core Web Vitals tracking"
  
  environment_variables:
    required: []
    optional:
      - "VITE_ENABLE_DEBUG"
      - "VITE_API_TIMEOUT"

maintenance_notes:
  code_quality:
    typescript_strict: true
    eslint_rules: "Airbnb configuration"
    prettier_formatting: true
  
  future_enhancements:
    - biometric_authentication
    - social_login_integration
    - multi_language_support
    - offline_capabilities
    
  known_limitations:
    - requires_javascript_enabled
    - localStorage_dependency
    - single_device_session

documentation_references:
  component_docs: "/docs/components/mobile-verification.md"
  api_integration: "/docs/api/mobile-verification-endpoints.md"
  testing_guide: "/docs/testing/mobile-verification-tests.md"
  deployment_guide: "/docs/deployment/container-components.md"