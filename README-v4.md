# Red Parcel – Version 4

Operations-first bus parcel delivery platform  
Upgrade from Version 3

## Upload Sequence (GitHub)

Upload files in this order:

1. `red-parcel-logo.png` (if not already present)
2. `index.html`          ← main Version 4 prototype (replace old index.html)
3. `config.example.js`
4. `backend/supabase-schema-v4.sql`
5. `backend/api-structure.js`
6. `README.md`

## After Upload

1. Copy `config.example.js` → rename to `config.js`
2. Paste your real keys only in `config.js`
3. Add this line to `.gitignore`:
   ```
   config.js
   ```
4. Run the SQL file in Supabase SQL Editor

## What is new in Version 4

- Driver Check-in / Check-out
- Multi-driver / Shift support (structure ready)
- Photo proof placeholders at pickup & delivery
- Responsibility transfer concept
- Capacity awareness
- Clear `// ADD_API` markers for real backend
- Improved public tracking
- Stronger Bus Owner view

## Demo OTP
Use **4821** for delivery verification.

## Important Security
- Never commit real keys
- Never put Razorpay Secret in frontend
- Restrict Google Maps key to your domains

## Next Steps
1. Replace simulated functions with real calls marked `// ADD_API`
2. Connect Supabase Realtime for live location
3. Connect Razorpay Test mode
4. Add real photo upload to Supabase Storage
EOF
