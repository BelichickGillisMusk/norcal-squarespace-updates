# Blog unique + location SEO rule (NorCal CARB Mobile)

Goal: every new field / trip blog must be **unique** and **map-proof** so Google sees real places — and readers get content no competitor can copy-paste.

## Unique-content formula (required)

Every new post hits these four beats:

| Beat | What to include | Why |
|------|-----------------|-----|
| **1. Industry** | Who we tested for (ag, construction, freight, municipal, motorhome, tree, fencing, etc.) | Matches buyer search + proves niche |
| **2. Location** | Named city / county / corridor (Porterville, Mojave, Stockton…) | Google place signals |
| **3. Testing oddity** | Something unusual about the test day (hard-to-reach OBD port, older OVI snap, rain, yard layout, fleet size surprise, paperwork quirk) | Only you lived it → unique SEO |
| **4. Cool human detail** | Where the tester ate, a roadside stop, or what’s on the list for the **next** visit | Memorable, shareable, not generic CARB copy |

Brand voice only: **NorCal CARB Mobile** (no personal names of staff/owners).

### Mini outline agents should follow

```markdown
## [Industry] in [Location]
…who / why on-site OBD or OVI…

## Testing notes from the yard
…the oddity — what was different this time…

## Cool stop / next on the list
…where lunch was, or the next pin already queued…
```

### Front-matter extras (new posts)

```yaml
industry: "agriculture"           # or freight, construction, municipal, motorhome, …
locations: ["Porterville, CA", "Tulare County, CA"]
testing_oddity: "short note — e.g. six pre-2013 OVI units in one yard"
cool_thing: "lunch at … / next visit: …"
```

## Location SEO checklist (still required)

1. **Slug includes place tokens** when the post is about a trip or corridor  
   Example: `fleets-ovi-obd-porterville-mojave`
2. **Title names ≥1 real place** (city, county, or corridor)
3. **Meta description names ≥2 places**
4. **Body names ≥3 places in plain English** (not just “our area”)
5. **At least one H2 uses a place name**
6. **Internal link** to `/areas` and/or the matching route page
7. **JSON-LD `about` / `mentions` Places** on the HTML article
8. Industry + testing oddity + cool thing sections present (see formula above)

## Voice

- Everyday NorCal first; fleet-asked pins when asked
- Honest — do not invent industries, cities, meals, or “next visits”
- Pair with Google Business Profile photos from the same trip when available

## Do not

- Invent cities, customers, or meals you did not experience
- Stuff 20 city names with no sentences
- Use vague “we travel statewide” without naming pins
- Skip the cool detail — that is what keeps posts from sounding identical

## Example live post

https://norcalcarbmobile.com/blog/fleets-ovi-obd-porterville-mojave

Fill-in skeleton: `blog_drafts/_template-field-trip.md`
