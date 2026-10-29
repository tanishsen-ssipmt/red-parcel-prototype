# Red Parcel – Interactive Prototype

**Bus-powered parcel delivery with live tracking**

Red Parcel connects three parties:
1. **Sender** – books a parcel to travel on a regular intercity bus  
2. **Bus Driver** – carries the parcel and earns a small service fee  
3. **Receiver** – sees the **live location** of the bus so they know exactly when to reach the bus stop  

Bus owners subscribe monthly so their fleet appears in the app.

---

## How the model works

| Role | What they do |
|------|--------------|
| **Bus Owner** | Buys a subscription (Starter / Pro / Business). Drivers & buses get listed. |
| **Sender** | Selects route → chooses bus → pays driver fee (₹40–200) → gives parcel to driver at pickup stop. |
| **Driver** | Accepts parcels, shares live GPS during the trip, marks pickup / delivery. |
| **Receiver** | Opens the tracking link / app → sees live bus location + ETA → waits calmly at the stop. |

No extra vehicles. Existing buses become micro-logistics nodes.

---

## Prototype screens included

- Role selection (Receiver / Sender / Driver / Bus Owner)
- **Receiver** – home + **live map tracking** with moving bus & countdown ETA
- **Sender** – book flow → bus selection → confirmation
- **Driver** – dashboard, active trip, parcel actions, location sharing
- **Bus Owner** – fleet overview + **subscription plans** (₹799 / ₹1,999 / ₹4,999)

---

## How to run locally

```bash
# Just open the file
open index.html
# or
npx serve .
```

Or drag `index.html` into any browser.

---

## Deploy to GitHub Pages (so you get a public link)

1. Create a new repository on GitHub (e.g. `red-parcel-prototype`)
2. Upload these files:
   - `index.html`
   - `red-parcel-logo.png`
   - `README.md`
3. Go to **Settings → Pages**
4. Source: Deploy from branch `main` / root
5. After 1–2 minutes you will get a link like:  
   `https://yourusername.github.io/red-parcel-prototype/`

That’s the link you can share or put in your pitch deck.

---

## Design notes

- Mobile-first (390 px frame)
- Brand red `#E30613` matching the logo
- Clean, simple UI focused on reducing receiver anxiety through live tracking
- Fully interactive (buttons, navigation, simulated live bus movement & ETA)

---

Built as a clickable prototype for validation & investor / stakeholder demos.
