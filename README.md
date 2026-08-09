# TubsAndSaunas.com

GitHub Pages-ready static site for an interactive backyard wellness planner.

## Core features
- Space/budget/electrical Backyard Wellness Planner
- Sauna vs cold plunge vs hot tub comparison
- Electricity cost calculator
- Electrical planning guide
- Featured InHouse Wellness product recommendations
- Weekly automated product refresh from public InHouse Wellness Shopify collection data
- Optional EIA residential electricity-rate refresh

## Launch
1. Upload every file and folder to the repository, including the hidden `.github` directory.
2. GitHub repository → **Settings → Pages** → set **Source** to **GitHub Actions**.
3. GitHub repository → **Settings → Pages → Custom domain** → enter `tubsandsaunas.com`.
4. Point the domain DNS to GitHub Pages.
5. Go to **Actions → Update wellness data and deploy → Run workflow** and run it once on `main`.
6. After GitHub validates DNS and provisions the certificate, enable **Enforce HTTPS**.

## Optional EIA electricity data
The site works without an EIA key. The included starter planning rates remain in place.

For live government residential electricity-rate refreshes, create a free EIA API key and add it as this repository secret:

`EIA_API_KEY`

The updater uses the EIA v2 electricity retail-sales dataset and the residential (`RES`) sector.

## Data philosophy
The planner provides rough screening estimates. Product manuals, local code, electricians, plumbers and site professionals control real installation decisions.

InHouse Wellness is the featured retail partner. That commercial relationship is disclosed on the methodology page.


## Design identity
This build uses a distinct editorial / field-guide visual system (serif masthead, asymmetric layouts, blueprint-style planner output, warm paper palette) rather than the shared card-based visual language used on the other sauna data sites.
