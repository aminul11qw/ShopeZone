ShopeZone — corrected current files

Based directly on the newly uploaded ShopeZone files.

Preserved:
- Current ShopeZone blue design
- Current products, categories, search and cart
- Firebase phone OTP/reCAPTCHA
- Email/password registration + email verification
- Login/logout
- Saved customer details: name, phone, billing code, address

Fixed:
- Auth mode switching no longer targets a missing #authHint element.
- Orders are stored locally with an order ID, customer details, billing code,
  items, total, payment method, Pending status and date.

Firebase note:
The uploaded FIREBASE-SETUP.txt states that the live domain must be added in
Firebase Authentication -> Settings -> Authorized domains for Phone OTP.
