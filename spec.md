# MEDSAARTHI

## Current State
The app is a voice-first healthcare assistant with:
- Welcome screen (auto-speaks, single "Get Started" button)
- 7-step voice registration (name, age, language, doctor name, doctor phone, caregiver name, caregiver phone)
- Home screen with 4 quick-action cards, mic button for voice commands, today's progress
- My Medicines, Scan Prescription (camera + mock results), Verify Medicine (camera + match)
- Reminders timeline with mark-as-taken per dose
- Health Check-in, Caregiver Dashboard, Profile pages
- Emergency SOS button (fixed top-right on all screens)
- Bottom nav: Home, Reminders, Caregiver, Profile

## Requested Changes (Diff)

### Add
- Welcome screen: auto-speak "Welcome to MEDSAARTHI. Your voice healthcare assistant." (update existing message), add two large buttons: "Start Setup" (→ /register) and "Voice Command" (→ /home, triggers mic)
- Registration: add step for "Medical Conditions" between language and doctor contact (6 screens: name, age, language, medical conditions, doctor contact, caregiver contact — merge doctor/caregiver into single screens each)
- Reminders page: group doses by Morning / Afternoon / Night sections with section headers; show ✔ or Pending status per dose; add voice reminder that says "It is time to take your medicine."
- Scan Prescription: show extracted result in clear Medicine/Dosage/Time format (e.g. Medicine: Paracetamol, Time: 8 AM / 8 PM)
- Verify Medicine: add ⚠ Wrong Medicine path; randomly show correct vs wrong for demo
- Confirmation Button: prominent "I Took My Medicine" button on Reminders/Medicines page; also triggerable by voice
- Emergency Button: existing SOS becomes larger, labeled "Emergency Help"; voice "help" still works
- Caregiver Screen: display Medication Taken, Missed Doses, Last Health Update sections clearly
- Demo Mode page: new /demo route with auto-playthrough of voice greeting → prescription scan → reminder alarm → medicine scan (timed sequence, auto-advance, cancelable)
- Accessibility: ensure all buttons have min 72px touch targets, high-contrast text, aria-labels, audio instructions on every screen load

### Modify
- Welcome.tsx: update speak text; replace single "Get Started" button with two buttons ("Start Setup" and "Voice Command")
- Register.tsx: adjust STEPS to 6 steps (merge doctor into one step with name+phone, merge caregiver similarly; add medical conditions step)
- Reminders.tsx: group by time-of-day (Morning before 12, Afternoon 12-17, Night 17+)
- VerifyMedicine.tsx: add wrong medicine result state shown 50% of time for demo
- Home.tsx: ensure voice "I took my medicine" works; add Reminders card to quick actions
- Layout.tsx: make SOS button larger (w-16 h-16), add label "Emergency Help"
- App.tsx: add /demo route

### Remove
- Nothing removed

## Implementation Plan
1. Update Welcome.tsx: new speak text, two buttons (Start Setup, Voice Command)
2. Update Register.tsx: 6-step flow with medical conditions step added, doctor/caregiver as combined name+phone steps
3. Update Reminders.tsx: group by Morning/Afternoon/Night; add "I Took My Medicine" prominent button; voice reminder text update
4. Update ScanPrescription.tsx: improve displayed result format (Medicine: X, Dosage: Y, Time: Z)
5. Update VerifyMedicine.tsx: add wrong-medicine result path for demo
6. Update Layout.tsx: larger SOS button with Emergency Help label
7. Update CaregiverDashboard.tsx: clear sections for medication taken, missed doses, last health update
8. Create DemoMode.tsx: auto-sequence demo page at /demo
9. Update App.tsx: add /demo route, add Demo Mode card on Home
10. Validate and fix any TypeScript/lint errors
