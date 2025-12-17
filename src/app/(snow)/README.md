# Snow Sessions Event Site

This is the dedicated microsite for Origins Radio Snow Sessions event at Erciyes ski resort.

## Structure

- **Route Group**: `(snow)` - All pages are under this route group
- **Subdomain**: Configured to work with `snow.originsradio.com`
- **Design**: Uses Origins Radio design language (liquid glass, dark theme, cyan/teal accents)

## Pages

1. **Home/About** (`/`) - Event overview, hero section, stats, and CTAs
2. **Line Up** (`/lineup`) - Artist lineup with cards and filtering
3. **Hotels** (`/hotels`) - Partner hotels and accommodation information
4. **Prices** (`/prices`) - Package tiers, pricing, and add-ons
5. **Reservation** (`/reservation`) - Booking form and payment information
6. **Contact** (`/contact`) - Contact information and social links

## Content Management

All event-specific content should be extracted from the PDF and added to:
- `src/app/components/snow/snow-content.ts`

This file contains:
- Event dates
- Artist lineup
- Hotel information
- Package details
- Contact information

### How to Extract Content from PDF

1. Open `/Users/sina/Desktop/Origins_Erciyes_Etkinlik_Dosyasi.pdf`
2. Extract the following information:
   - Event dates (start/end)
   - Artist names, genres, photos, performance times
   - Hotel names, locations, amenities, contact info
   - Package names, prices, features
   - Any additional contact information
3. Update `snow-content.ts` with the extracted data
4. Update the pages to use the data from `snow-content.ts` instead of placeholders

## Language Support

The site supports English (EN) and Turkish (TR) languages. Language state is managed globally via `useSnowLanguage` hook and persists in localStorage.

## Vercel Subdomain Configuration

To configure the subdomain on Vercel:

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add `snow.originsradio.com` as a domain
4. Configure DNS:
   - Add a CNAME record: `snow` → `cname.vercel-dns.com`
   - Or use Vercel's automatic DNS configuration
5. The middleware will automatically route `snow.originsradio.com` requests to the `(snow)` route group

## Development

The site uses the same design system as the main Origins Radio site:
- Liquid glass effects
- Dark theme with cyan/teal accents
- Framer Motion animations
- Responsive design (mobile-first)

## Notes

- All pages use the shared `SnowLanguageProvider` for language state
- Navigation is fixed at the top with mobile hamburger menu
- All pages have language toggle buttons
- Content is structured to be easily updated from the PDF
