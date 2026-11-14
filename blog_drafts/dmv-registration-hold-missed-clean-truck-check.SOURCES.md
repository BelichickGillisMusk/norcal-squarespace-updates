Generated: November 9, 2026, 10:20 PM PT — DRAFT, not published

# SOURCES.md — claim map for DRAFT-post.md

Every deadline, hold, certificate, frequency, and penalty claim in the draft is mapped below to an official CARB (`ww2.arb.ca.gov` / `arb.ca.gov`) or California DMV (`dmv.ca.gov`) page fetched live. Fetch times are America/Los_Angeles (PST on this date). HTML and extracted-text snapshots live in `./snapshots/`.

NorCal prices and internal URLs were also fetched live and snapshotted; they are not CARB/DMV legal claims.

## Fetch index (official)

| Snapshot stem | Requested URL | HTTP | Fetched at (PT) |
|---|---|---|---|
| carb-dmv-hold-sb210 | https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-ca-dmv-registration-hold-sb-210 | 200 | November 9, 2026, 10:14:18 PM PST |
| carb-testing-requirements | https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements | 200 | November 9, 2026, 10:14:18 PM PST |
| carb-semiannual | https://ww2.arb.ca.gov/clean-truck-check-requirements-vehicles-subject-semi-annual-compliance | 200 | November 9, 2026, 10:14:18 PM PST |
| carb-faq | https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0 | 200 | November 9, 2026, 10:14:18 PM PST |
| carb-overview | https://ww2.arb.ca.gov/clean-truck-check-overview-fact-sheet | 200 | November 9, 2026, 10:14:18 PM PST |
| carb-overview-alt | https://ww2.arb.ca.gov/overview-fact-sheet-clean-truck-check → redirects to carb-overview | 200 (1 redirect) | November 9, 2026, 10:14:18 PM PST |
| carb-hdim-enforcement | https://ww2.arb.ca.gov/hdimenforcement | 200 | November 9, 2026, 10:14:19 PM PST |
| carb-referee | https://ww2.arb.ca.gov/resources/fact-sheets/referee-factsheet-clean-truck-check-0 | 200 | November 9, 2026, 10:14:19 PM PST |
| carb-ag-mh-annual | https://ww2.arb.ca.gov/resources/documents/clean-truck-check-agricultural-vehicles-california-motor-homes-annual | 200 | November 9, 2026, 10:14:19 PM PST |
| carb-ag-requirements | https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-agricultural-vehicles-requirements | 200 | November 9, 2026, 10:14:19 PM PST |
| dmv-10-035-hd-emission | https://www.dmv.ca.gov/portal/handbook/vehicle-industry-registration-procedures-manual-2/renewals/10-035-emission-compliance-for-heavy-duty-vehicles-vc-%C2%A7%C2%A74000-15-4156-5-c2e1-and-9257-5/ | 200 | November 9, 2026, 10:14:20 PM PST |
| carb-enforcement-policy | https://ww2.arb.ca.gov/resources/documents/enforcement-policy | 200 | November 9, 2026, 10:14:20 PM PST |
| carb-dmv-hold-sb210-print | https://ww2.arb.ca.gov/resources/fact-sheets/ca-dmv-registration-hold-sb-210-clean-truck-check/printable/print | **404** | November 9, 2026, 10:14:18 PM PST |
| carb-fact-sheets-index | https://ww2.arb.ca.gov/our-work/programs/inspection-and-maintenance-program/hd-im-fact-sheets | **403** | November 9, 2026, 10:14:19 PM PST |

The 404 printable URL and the 403 fact-sheet index were not used as sources. The general Enforcement Policy page was fetched for penalty-amount research; no Clean Truck Check-specific dollar schedule was taken from it (see Dropped claims).

## Claim → source

### Who is subject

| Claim in draft | Official source | Snapshot | Fetched |
|---|---|---|---|
| Nearly all diesel and alternative-fuel HD vehicles over 14,000 lbs GVWR that operate on CA public roads, including many out-of-state vehicles | [SB 210 hold fact sheet](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-ca-dmv-registration-hold-sb-210); same scope on [overview](https://ww2.arb.ca.gov/clean-truck-check-overview-fact-sheet) | carb-dmv-hold-sb210.txt; carb-overview.txt | 10:14:18 PM PST |

### What “compliant” requires

| Claim in draft | Official source | Snapshot | Fetched |
|---|---|---|---|
| Meet all deadlines and: report in CTC-VIS, pay the annual fee, submit a passing test, and have no outstanding enforcement violations | [Overview fact sheet, “What are my compliance requirements?”](https://ww2.arb.ca.gov/clean-truck-check-overview-fact-sheet) | carb-overview.txt | 10:14:18 PM PST |
| Vehicles must be reported in CTC-VIS, pay annual fees, and undergo emissions testing | [SB 210 hold fact sheet](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-ca-dmv-registration-hold-sb-210) | carb-dmv-hold-sb210.txt | 10:14:18 PM PST |
| Annual fee started at $30 and adjusts with the California CPI; due on the first compliance deadline of the compliance year | [FAQ, “How much is the compliance fee…”](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0) | carb-faq.txt | 10:14:18 PM PST |
| Overview example: 2025 compliance fee $31.18; fee increases with California CPI | [Overview, “Am I required to report and pay…”](https://ww2.arb.ca.gov/clean-truck-check-overview-fact-sheet) | carb-overview.txt | 10:14:18 PM PST |
| Report vehicles at CTC-VIS (cleantruckcheck.arb.ca.gov) | [Overview](https://ww2.arb.ca.gov/clean-truck-check-overview-fact-sheet) (mentions reporting at cleantruckcheck.arb.ca.gov); hold sheet points owners to CTC-VIS | carb-overview.txt; carb-dmv-hold-sb210.txt | 10:14:18 PM PST |

### DMV registration holds

| Claim in draft | Official source | Snapshot | Fetched |
|---|---|---|---|
| CA DMV registration holds are automatically placed on vehicles not compliant with Clean Truck Check | [SB 210 hold fact sheet](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-ca-dmv-registration-hold-sb-210) | carb-dmv-hold-sb210.txt | 10:14:18 PM PST |
| DMV automatically places registration holds on vehicles not compliant with Clean Truck Check | [Agricultural vehicles requirements](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-agricultural-vehicles-requirements) | carb-ag-requirements.txt | 10:14:19 PM PST |
| To remove an SB 210 hold: report in CTC-VIS, be compliant with the annual fee, and be compliant with emission testing | [SB 210 hold fact sheet, “How do I get the CA DMV registration hold removed…”](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-ca-dmv-registration-hold-sb-210) | carb-dmv-hold-sb210.txt | 10:14:18 PM PST |
| Registration cannot be completed if a requirement was not met before new registration or the registration expiration date | Same SB 210 hold fact sheet | carb-dmv-hold-sb210.txt | 10:14:18 PM PST |
| This type of hold prevents most DMV transactions | Same SB 210 hold fact sheet | carb-dmv-hold-sb210.txt | 10:14:18 PM PST |
| You do not need to show or send the certificate to CA DMV | Same SB 210 hold fact sheet | carb-dmv-hold-sb210.txt | 10:14:18 PM PST |
| After the hold is removed, contact DMV to complete the transaction; DMV will not automatically send tags; CARB recommends going in person if possible | Same SB 210 hold fact sheet | carb-dmv-hold-sb210.txt | 10:14:18 PM PST |
| DMV confirms compliance electronically as identified by CARB and denies renewal or transfer of non-compliant HD vehicles over 14,000 lbs GVWR (VC §§4000.15, 4156.5, 9257.5); industry flag Q212 WARNING CARB NON-COMPLIANT (HDIM) | [DMV 10.035 Emission Compliance for Heavy Duty Vehicles](https://www.dmv.ca.gov/portal/handbook/vehicle-industry-registration-procedures-manual-2/renewals/10-035-emission-compliance-for-heavy-duty-vehicles-vc-%C2%A7%C2%A74000-15-4156-5-c2e1-and-9257-5/) | dmv-10-035-hd-emission.txt | 10:14:20 PM PST |
| Non-compliance may result in DMV registration blocks and other enforcement action | [Semi-annual requirements](https://ww2.arb.ca.gov/clean-truck-check-requirements-vehicles-subject-semi-annual-compliance) | carb-semiannual.txt | 10:14:18 PM PST |
| Subject vehicles must be reported in CTC-VIS and compliant before they may operate on CA public roads and highways | [Semi-annual requirements, Key Highlights](https://ww2.arb.ca.gov/clean-truck-check-requirements-vehicles-subject-semi-annual-compliance) | carb-semiannual.txt | 10:14:18 PM PST |

### Certificates and processing time

| Claim in draft | Official source | Snapshot | Fetched |
|---|---|---|---|
| Card payments 1–2 business days; TeleCheck/eCheck up to 7 business days; certificate available in Vehicles on My Entity once payment has processed | [SB 210 hold fact sheet](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-ca-dmv-registration-hold-sb-210); [FAQ](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0) | carb-dmv-hold-sb210.txt; carb-faq.txt | 10:14:18 PM PST |
| Weekends and holidays do not count as business days | [FAQ](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0) | carb-faq.txt | 10:14:18 PM PST |
| If requirements were met before the due date (no more than 90 days before), allow 1–3 business days for DMV to update | [FAQ, “I have a registration hold… what now?”](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0) | carb-faq.txt | 10:14:18 PM PST |
| SB 210 hold “will be removed 1-3 business days after the compliance requirements for the upcoming deadline have been completed” | [SB 210 hold fact sheet](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-ca-dmv-registration-hold-sb-210) | carb-dmv-hold-sb210.txt | 10:14:18 PM PST |
| Once a hold is placed, allow 3–5 business days from the date the certificate is downloaded for DMV to update | [FAQ](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0); [Referee fact sheet](https://ww2.arb.ca.gov/resources/fact-sheets/referee-factsheet-clean-truck-check-0) | carb-faq.txt; carb-referee.txt | 10:14:18–10:14:19 PM PST |
| CARB transmits a compliant VIN list to DMV nightly; if DMV still shows noncompliant after CTC-VIS shows compliant, contact hdim@arb.ca.gov | [FAQ](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0) | carb-faq.txt | 10:14:18 PM PST |
| Download the certificate from the Vehicles section of the My Entity homepage | [FAQ, “Where can I get my compliance certificate?”](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0) | carb-faq.txt | 10:14:18 PM PST |

### Test frequency and the 90-day window

| Claim in draft | Official source | Snapshot | Fetched |
|---|---|---|---|
| Almost all vehicles are semi-annual; agricultural (as defined) and CA-registered motorhomes for recreational use or emergency occupancy are annual | [Emissions testing requirements](https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements) | carb-testing-requirements.txt | 10:14:18 PM PST |
| Commercial-use motorhomes follow the semi-annual table | [Semi-annual requirements](https://ww2.arb.ca.gov/clean-truck-check-requirements-vehicles-subject-semi-annual-compliance) | carb-semiannual.txt | 10:14:18 PM PST |
| CA-registered deadlines are based on DMV registration expiration dates and every six months thereafter | [Semi-annual requirements](https://ww2.arb.ca.gov/clean-truck-check-requirements-vehicles-subject-semi-annual-compliance) | carb-semiannual.txt | 10:14:18 PM PST |
| Table I pairs each expiration month with two deadline months six months apart (May↔November, June↔December, etc.) | Same page, Table I | carb-semiannual.txt | 10:14:18 PM PST |
| Passing tests may be submitted up to 90 days before a compliance deadline | [Testing requirements](https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements); [semi-annual](https://ww2.arb.ca.gov/clean-truck-check-requirements-vehicles-subject-semi-annual-compliance) | carb-testing-requirements.txt; carb-semiannual.txt | 10:14:18 PM PST |
| Always refer to your CTC-VIS account for due dates; those dates mark compliance | [FAQ](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0); [testing requirements](https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements) | carb-faq.txt; carb-testing-requirements.txt | 10:14:18 PM PST |
| Beginning October 2027, OBD-equipped vehicles test four times per year; non-commercial motorhomes and agricultural vehicles remain annual | [Testing requirements](https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements) | carb-testing-requirements.txt | 10:14:18 PM PST |
| Monthly account summary lists vehicles due in the next 90 days and open enforcement actions | [Testing requirements](https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements) | carb-testing-requirements.txt | 10:14:18 PM PST |

### Which test, who submits it, “Not Ready,” NST clock

| Claim in draft | Official source | Snapshot | Fetched |
|---|---|---|---|
| Use the ECL / engine year, not a guessed chassis year | [Testing requirements](https://ww2.arb.ca.gov/clean-truck-check-emissions-compliance-testing-requirements) | carb-testing-requirements.txt | 10:14:18 PM PST |
| OBD scan: 2013+ diesel and 2018+ alternative-fuel engines, on a CARB-certified device | Same page | carb-testing-requirements.txt | 10:14:18 PM PST |
| Diesel 2012 and older: smoke opacity + visual inspection (Vehicle Emissions Control Equipment Inspection). Alt-fuel 2017 and older: visual only | Same page | carb-testing-requirements.txt | 10:14:18 PM PST |
| Testing must be done by a CARB-credentialed tester; the tester sends results to CARB; the owner does not upload them | Same page (“Do I need to send/upload my test results…? No”) | carb-testing-requirements.txt | 10:14:18 PM PST |
| OBD “Not Ready,” “Vehicle Not Applicable For OBD Testing,” or “Invalid Test” is not compliant; retest | Same page | carb-testing-requirements.txt | 10:14:18 PM PST |
| NST: even after a regular passing test, a passing test must be submitted within 30 calendar days of receipt | Same page; also [overview](https://ww2.arb.ca.gov/clean-truck-check-overview-fact-sheet) | carb-testing-requirements.txt; carb-overview.txt | 10:14:18 PM PST |

### Penalties and fines

| Claim in draft | Official source | Snapshot | Fetched |
|---|---|---|---|
| Non-compliance may result in DMV registration blocks and other enforcement action | [Semi-annual requirements](https://ww2.arb.ca.gov/clean-truck-check-requirements-vehicles-subject-semi-annual-compliance) | carb-semiannual.txt | 10:14:18 PM PST |
| If you do not have a test performed by the NST letter deadline, you could be liable for a Notice of Violation and assessed a penalty (no dollar amount on this page) | [If You Received a Notice to Submit to Testing (NST) Letter](https://ww2.arb.ca.gov/hdimenforcement) | carb-hdim-enforcement.txt | 10:14:19 PM PST |
| Owners who do not comply with the NST requirement may be subject to enforcement action, such as penalties and registration holds | [FAQ](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0) | carb-faq.txt | 10:14:18 PM PST |
| FAQ: violations of air pollution regulations are prosecuted under HSC §42402, which identifies potential civil penalties of $1,000 to $10,000 per day per vehicle — quoted only as CARB’s FAQ language in the NST answer, not as a posted fine for missing a regular six-month test | [FAQ](https://ww2.arb.ca.gov/resources/fact-sheets/clean-truck-check-faq-0) | carb-faq.txt | 10:14:18 PM PST |

## Live NorCal prices and pages (not legal claims)

| Check | Result | Snapshot | Fetched |
|---|---|---|---|
| https://norcalcarbmobile.com/pricing lists OBD Test $75 / vehicle and OVI (Smoke) Test $199 / vehicle; phone (916) 890-4427; “We come to your yard across Northern California.” No $37.50 on the page | HTTP 200 | nccm-pricing.txt / .html | November 9, 2026, 10:14:20 PM PST |
| Homepage also states “OBD is $75. OVI is $199.” | HTTP 200 | nccm-home.txt | 10:14:20 PM PST |
| Internal service and blog URLs used in the draft | all HTTP 200 | nccm-*.meta.txt | 10:14:20–10:14:22 PM PST |
| https://www.carbcleantruckcheck.app VIN lookup (title: “CARB App - Mobile Clean Truck Check”; meta describes instant VIN checks). Visible copy does not say “free”, so the draft does not call it free. JSON-LD Offer price is "0" but that is not visible page copy. | HTTP 200 (final https://www.carbcleantruckcheck.app/) | carbcleantruckcheck-app.html / .txt / .meta.txt | November 9, 2026, 10:20:00 PM PST |

## Dropped claims (no official source, or official but out of scope)

1. **A specific fine amount for missing a regular (six-month or annual) Clean Truck Check deadline.** CARB’s hold, semi-annual, overview, and testing pages describe enforcement action and DMV registration holds. They do not say “a missed periodic test costs $X.” The draft says penalties can apply and links CARB, instead of inventing a number.
2. **“Emergency,” “crisis,” or “CARB emergency.”** Official pages use “emergency” only for exempt emergency vehicles and for motorhomes in “emergency occupancy.” They do not describe a missed test or a registration hold as an emergency. Vince’s paused ad group uses “CARB Emergency” as a keyword theme; that wording was not copied into the post.
3. **“Fines hit working trucks first.”** Ad copy only; not on a CARB or DMV page.
4. **“Beat the year-end rush” / any claim that November–December is a statistically busier testing season.** Not verified. The draft only explains CARB’s six-month pairing (May/November, June/December, etc.).
5. **“A $75 test beats a CARB fine.”** That comparison needs a known fine amount for a missed regular test, which official pages do not publish.
6. **We clear the hold, we issue the compliance certificate, a pass alone makes the vehicle fully compliant, or same-day DMV clearance.** Forbidden by the carb-guru skill and unsupported by CARB: the tester submits the test; CARB issues compliance after all requirements are met; DMV updates after its published window and still requires the owner to follow up.
7. **A 5-day pass makes the vehicle fully compliant or “legal” after it expires.** CARB’s hold fact sheet says the 5-day pass allows operation in California but the vehicle is not considered compliant after it expires. Omitted from the draft to avoid a false legal promise.
8. **2026 annual CARB fee of $32.13.** Mentioned in internal skill notes, but the official pages fetched on November 9, 2026 still say the fee started at $30, give $31.18 as the 2025 example, and tell owners the fee adjusts with CPI. The draft tells readers to check CTC-VIS rather than stating an unverified 2026 figure.
9. **$37.50, referral pricing, or “Switch & Save.”** Forbidden, and not present on the live pricing page fetched for this draft.
10. **HSC §§43016 / 43154 “up to $37,500 per violation.”** This amount appears on CARB’s FAQ, but it is about operating an uncertified, tampered, or illegally modified vehicle — not about missing a periodic Clean Truck Check test. Dropped so readers do not treat it as a missed-test fine.
11. **General Enforcement Policy maximum administrative penalties.** Fetched (`carb-enforcement-policy`) but not Clean Truck Check-specific, so unused.
12. **Port or railyard gate denial as a main claim.** CARB’s FAQ does mention that non-compliant vehicles may be denied entry into ports and railyards. Left out of this draft because it is not required for the hold / missed-test / avoid-fines assignment and is easy to overstate.

## Ad-draft review (not treated as sources)

Read `/workspace/ads/urgency-novdec-2026/` (`NOTE.md`, `ads.csv`, `keywords.csv`) to match angle and keywords only. No ad headline or description was copied as a factual claim unless an official page above verified it.


## VIN lookup CTA (2026-11-09 follow-up)

Cancelled Donger compliance-check tool embed replaced in the draft body with this sentence:

Not sure where your truck stands? Run your VIN through our [Clean Truck Check VIN lookup](https://www.carbcleantruckcheck.app).

- Requested URL: https://www.carbcleantruckcheck.app
- Final URL: https://www.carbcleantruckcheck.app/
- HTTP status: **200**
- Fetched at: November 9, 2026, 10:20:00 PM PST
- Snapshot: `./snapshots/carbcleantruckcheck-app.html` (and `.txt`, `.meta.txt`)
- “free”: not used. The live HTML title/description say “Instant VIN Checks” / “Check VIN Compliance instantly” and do not use the word “free.”
