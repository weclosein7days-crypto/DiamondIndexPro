# Diamond Index™ — Project TODO

## Site-wide Branding & Copy
- [x] Remove all direct SportCardsOnline references from Investors page revenue streams
- [x] Remove all direct SportCardsOnline references from Investors page traction section
- [x] Remove SportCardsOnline name and DIMASTER membership code from post-grade email (routers.ts)
- [x] Remove SportCardsOnline reference from CameraCapture marketplace screen
- [x] Reword marketplace copy to reflect open certified grader partner model
- [x] Reword post-grade email to reference general partner marketplace network

## Investors Page
- [x] Marketplace Listings card — reworded to open grader marketplace model
- [x] SportCardsOnline Integration card — renamed to Partner Network Fees, reworded
- [x] Certified Grader Memberships card — updated to mention partner network listing
- [x] Traction section Marketplace Go-Live — removed SportCardsOnline reference
- [x] Inquiry modal wired to investors.submitLead tRPC mutation
- [x] Success state shown after form submission

## CameraCapture / Grade Flow
- [x] vault.saveCard mutation wired in vault-save phase
- [x] Marketplace screen copy updated — no partner name mentioned

## Backend
- [x] Post-grade email reworded — Certified Grader Network section replaces SportCardsOnline section
- [x] investors.submitLead procedure in routers.ts

## Pending / Future
- [ ] Grader signup page — add "If you would like to be a Certified Grader and list your marketplace with us, sign up here" CTA
- [ ] Partner marketplace management UI — graders can link/unlink their marketplace
- [ ] Export to marketplace flow — select one or all connected partner platforms
- [ ] Per-platform transaction fee configuration for sponsors

## Certification + Verification System
- [x] Add certId (DI-XXXX-XXXX), qrCodeUrl, and status fields to graded_cards DB schema
- [x] Push DB migration
- [x] Generate unique DI-XXXX-XXXX cert ID on grade save in routers.ts
- [x] Generate QR code URL pointing to /verify/{certId}
- [x] Update vault card status enum: In Vault / Sent to Partner / Slab Ordered (remove Listed/Sold)
- [x] Remove "List for Sale" from post-grade CameraCapture flow
- [x] Add "Connect With a Master Grader" screen (partner referral) to post-grade flow
- [x] Add "Order Slab / Label" screen to post-grade flow
- [x] Update Vault page — show Cert ID, QR code, verification link, new status badges
- [x] Build public /verify/:certId page — card images, grade, breakdown, Verified Authentic badge
- [x] Wire /verify/:certId route in App.tsx

## Grader Program Page Reframe
- [x] Replace "Ran By Collectors, For Collectors" hero with "Start Your Own Grading Business"
- [x] Remove all affiliate/referral language from the page
- [x] New 7-section structure: Hero, How It Works, How You Make Money, Booth Model, Real Earnings, What You Get, Apply
- [x] Add "You keep the customer. We power the grading." power line
- [x] Add "All grades are backed by Diamond Index™ certification + verification system" trust anchor
- [x] Reframe tier table as volume-based rate tiers (not recruit counts)
- [x] Simplify earnings examples to 3 clean scenarios (no L2 recruit math)
- [x] Booth Model section moved up — positioned as key differentiator
- [x] CTA changed to "Apply to Become a Grader" throughout
- [x] FAQ updated to remove referral/recruit questions, add certification and operation questions

## Navigation Audit & Fixes
- [x] Make logo clickable to Home on Header
- [x] Ensure all nav links in Header use proper router Links (not anchor tags)
- [x] CameraCapture: add X/close button on every phase to exit back to Home
- [x] Vault page: confirm header nav works
- [x] Verify page: add back-to-home link (no header on this page)
- [x] GraderProgram, Investors, HowItWorks, Pricing: confirm header nav links all work
- [x] Grade page (CameraCapture wrapper): confirm header is present and nav works

## CameraCapture Flow Overhaul
- [x] Countdown screen: keep card alignment frame visible during countdown, overlay timer in corner
- [x] Analysis/scanning: slow all animations to Rolex-paced, methodical, no fast movements
- [x] Final screen: remove sales pitch, add Print Results + Email Results buttons
- [x] Final screen: add 3 slab fulfillment options (DIY label $pkg1, ship label+slab $14.99, mail to SportCardsOnline $19.90)
- [x] Final screen: name SportCardsOnline as closest Master Grader with Columbus OH address
- [x] Final screen: auto-email results (grade + photos + detailed report + label download steps + fulfillment options)
- [x] Vault: add "List on Partner Marketplace" option that links to SportCardsOnline vault

## Future / Requires External Setup
- [ ] Direct user email delivery (currently relayed via owner notification) — requires email service (SendGrid/Postmark)
- [ ] SportCardsOnline vault deep-link with card export — requires SportCardsOnline API integration

## Role-Based Account System
- [ ] Verify DB schema has role enum: user | grader
- [ ] Add grader-only tRPC procedures (graderProcedure) in routers.ts
- [ ] Role-based routing in App.tsx: users → /vault, graders → /grader-dashboard on login
- [ ] Dynamic nav: user nav (My Vault, Grade, Pricing, Account) vs grader nav (Dashboard, My Vault, Batch Grading, Labels, Earnings, Account)
- [ ] Build GraderDashboard page with tabs: Overview, Batch Grading, Labels, Earnings
- [ ] Update user Vault: simplified clean view + "Become a Certified Grader" upgrade CTA card
- [ ] Grader Vault view: same cards + cert IDs visible, quick print button, batch select
- [ ] Grader Approval screen: shown once after role upgrade, celebrates transition with CTA to Enter Grader Dashboard

## Card Detail Page (Money Page) — Updated Model
- [x] Rebuild CardProfile.tsx as the full "Money Page" with 6 sections
- [x] Section 1: Slab image (left 60%) + Score/diamonds/quick stats/CTA buttons (right 40%)
- [x] Section 2: Verification — Verified by Diamond Index, Cert ID, Scan Activity, Verify Card CTA
- [x] Section 3: Full Grading Breakdown — clean grid with diamond icons per category
- [x] Section 4: Vault — Vault Status, Owner Verified, Add to Vault / Transfer Ownership
- [x] Section 5: Master Grader Referral — "Need Official Slab? Submit for Physical Grading"
- [x] Section 6: Market Insight — Estimated Range, Confidence Score, Recent Activity (inform, not sell)
- [x] UX: Clean, fast, obvious — no overdesign, no animations everywhere, financial platform feel

## Card Detail Page (Money Page) — Updated Model
- [x] Rebuild CardProfile.tsx as the full "Money Page" with 6 sections
- [x] Section 1: Slab image (left 60%) + Score/diamonds/quick stats/CTA buttons (right 40%)
- [x] Section 2: Verification — Verified by Diamond Index, Cert ID, Scan Activity, Verify Card CTA
- [x] Section 3: Full Grading Breakdown — clean grid with diamond icons per category
- [x] Section 4: Vault — Vault Status, Owner Verified, Add to Vault / Transfer Ownership
- [x] Section 5: Master Grader Referral — "Need Official Slab? Submit for Physical Grading"
- [x] Section 6: Market Insight — Estimated Range, Confidence Score, Recent Activity (inform, not sell)
- [x] UX: Clean, fast, obvious — no overdesign, no animations everywhere, financial platform feel

## Grading Breakdown Modal
- [x] Create GradingBreakdownModal component with shadcn Dialog
- [x] Show all 5 grading categories with sub-criteria breakdown
- [x] Visual score bars per category and sub-criteria
- [x] Diamond rating icons per category
- [x] Grading methodology explanation section
- [x] Wire "View Full Breakdown" button in CardProfile.tsx to open modal
- [x] Smooth open/close animation, keyboard accessible (Esc to close)

## Label Generation System
- [ ] Add grader.getLabelData tRPC procedure in server/routers.ts
- [ ] Build LabelRenderer.tsx component (1050×300px, black design, all dynamic fields)
- [ ] Build LabelPreviewModal.tsx with Download PDF and Download PNG buttons
- [ ] Add html2canvas + jspdf dependencies
- [ ] Wire PRINT LABEL button in GraderDashboard Labels tab to LabelPreviewModal
- [ ] Wire "Order Slab / Label" button in Grade result screen to LabelPreviewModal
- [ ] Write vitest tests for label data assembly and diamond rating mapping

## Verification Page (/verify/:certId)
- [x] Fix verify.getCard procedure to resolve S3 presigned URLs for card images
- [x] Rebuild Verify.tsx with premium full-page design
- [x] Section 1: Verified Authentic badge (green, prominent)
- [x] Section 2: Card identity header (player, set, year, number)
- [x] Section 3: Card images (front + back, side by side)
- [x] Section 4: Grade panel (score, diamonds, tier, cert ID)
- [x] Section 5: Category breakdown with score bars
- [x] Section 6: Grading metadata (date, standard, registry note)
- [x] Section 7: QR code display (this card's own QR)
- [x] Mobile responsive layout
- [x] Write vitest tests for verify procedure

## 3D Card Slab Viewer (Verify Page)
- [x] Install Three.js + @react-three/fiber + @react-three/drei
- [x] Build CardSlab3D.tsx component with slab geometry, card texture, gold border
- [ ] Auto-rotate with mouse drag override (OrbitControls)
- [ ] Card front image as texture mapped onto slab face
- [ ] Subtle ambient + directional lighting with specular highlights
- [ ] Integrate into Verify.tsx above the grade panel
- [ ] Fallback to static card image if WebGL not supported

## Admin: Grade Override
- [ ] Add adminOverrideScore, adminOverrideTier, adminOverrideDiamonds, adminOverrideNote, adminOverrideBy fields to gradedCards schema
- [ ] Push DB migration
- [ ] Add admin.listAllCards tRPC procedure (admin only — sees all cards across all users)
- [ ] Add admin.overrideGrade tRPC procedure (admin only — update score/tier/diamonds + note)
- [ ] Add Admin tab to GraderDashboard (visible only to admin role)
- [ ] Admin tab: card list with search/filter, click to open grade override modal
- [ ] Grade override modal: shows current grade, allows editing score/tier/diamonds, requires note

## Admin: Lead Management + Affiliate Assignment
- [ ] Add affiliates table to schema (id, name, code, ownerUserId, createdAt)
- [ ] Add affiliateId field to users table
- [ ] Push DB migration
- [ ] Add admin.listLeads tRPC procedure (all investor leads)
- [ ] Add admin.listAffiliates tRPC procedure
- [ ] Add admin.createAffiliate tRPC procedure
- [ ] Add admin.assignAffiliate tRPC procedure (assign user to affiliate)
- [ ] Leads tab in Admin panel: view all investor leads, assign to affiliate
- [ ] Users tab in Admin panel: view all users, assign to affiliate, change role

## 3D Slab Viewer Improvements
- [ ] Show actual front label image on slab face (not just card photo)
- [ ] Improve lighting — studio-quality with specular on acrylic
- [ ] Smoother auto-rotation speed
- [ ] Better drag controls — disable zoom on mobile, improve touch
- [ ] Add subtle reflection on slab surface

## Admin Control Panel (/admin)
- [x] Finish DB migration — push affiliates table, affiliateId on users, override fields on gradedCards, status/notes on investorLeads
- [x] admin.listAllCards procedure — all cards across all users, with user info
- [x] admin.updateCard procedure — edit score, tier, diamonds, status, override note
- [x] admin.deleteCard procedure — hard delete a card
- [x] admin.listUsers procedure — all users with role, affiliate, card count
- [x] admin.updateUser procedure — change role, assign affiliate
- [x] admin.deleteUser procedure
- [x] admin.listLeads procedure — all investor leads with status, affiliate
- [x] admin.updateLead procedure — change status, assign affiliate, add notes
- [x] admin.deleteLead procedure
- [x] admin.listAffiliates procedure
- [x] admin.createAffiliate procedure
- [x] admin.updateAffiliate procedure
- [x] admin.deleteAffiliate procedure
- [x] Build AdminPanel.tsx page at /admin — sidebar with tabs: Cards, Users, Affiliates, Leads
- [x] Cards tab — searchable table, edit grade modal, delete
- [x] Users tab — table, role change, affiliate assign, delete
- [x] Affiliates tab — create/delete affiliates
- [x] Leads tab — table, status change, affiliate assign, notes
- [x] Wire /admin route in App.tsx (admin role only)
- [x] Add Admin link in grader dashboard sidebar for admin users

## 3 UX Impact Moves (ChatGPT Priority)
- [ ] Move 1: Add percentile rank ("Top 12% of all graded cards") under score/tier on result page
- [ ] Move 1: Add PSA anchor line ("Comparable to PSA 9+") under percentile
- [ ] Move 2: Animated reveal sequence — Analyzing (1-2s) → score count-up 0→X → diamonds appear one-by-one → then breakdown/defects/value
- [ ] Move 3: Trust block above grading section — "HOW YOUR CARD IS GRADED" with 5 categories + "View Full Grading Breakdown" link
- [ ] Move 3 Bonus: Add "AI-adjusted market value based on current comps" line above price in value section

## ChatGPT Fix Round 2
- [ ] Fix 1: Percentile line bigger — fontSize 1rem, fontWeight 800, letterSpacing 0.14em
- [ ] Fix 2: Reveal timing slower — phase 2 at 1800ms, phase 3 at 3800ms
- [ ] Fix 3: Diamond pop micro-animation — scale(1.15) translateY(-2px) then settle to 1
- [ ] Fix 4: Move "Measured to the pixel — not estimated" to result screen under score
- [ ] Fix 5: Add "Based on recent sales of similar graded cards" under value

## Critical Broken Pipes
- [ ] Fix vault saving — graded card actually saves to vault after grading
- [ ] Fix image display — card images show correctly in vault (not placeholder)
- [ ] Fix 3D slab — show real card image on slab face

## Core Pipeline Fix (Priority 1)
- [ ] Add server upload endpoint: POST /api/upload → S3 → return storage URL
- [ ] Fix Grade.tsx: replace Unsplash hardcoded URLs with real uploaded image from file input
- [ ] Fix vault save: no silent fail, always save, use real image URL
- [ ] Fix vault display: render real card image from storage URL
- [ ] Fix 3D slab: pass real frontImageUrl into CardSlab3D texture
- [ ] Add rejection logic: if image is not a card / too blurry / invalid → reject with message

## User Vault — Delete Card
- [x] Add vault.deleteCard tRPC procedure (owner-only, hard delete)
- [x] Add deleteCard DB helper in server/db.ts
- [x] Add delete button to vault card detail modal
- [x] Confirmation dialog before delete (prevent accidental deletion)
- [x] Optimistic removal from list after successful delete
- [x] Write vitest tests for deleteCard procedure

## Collection Analytics Dashboard
- [ ] Add getCollectionAnalytics DB helper in server/db.ts
- [ ] Add vault.getAnalytics tRPC procedure (total cards, avg score, grade tier distribution, diamond rating breakdown, top cards, grading activity by month)
- [ ] Build /analytics page with stat cards (total cards, avg score, highest rated, estimated total value)
- [ ] Grade tier distribution donut/bar chart (Recharts)
- [ ] Diamond rating breakdown bar chart
- [ ] Grading activity over time (monthly bar chart)
- [ ] Top 5 highest-rated cards list with thumbnails
- [ ] Wire /analytics route in App.tsx
- [ ] Add Analytics nav link in grader portal sidebar
- [ ] Write vitest tests for getAnalytics procedure

## Rejection Logic + Reveal Enhancements (Priority)
- [x] Add cards.validateImage tRPC procedure — vision AI checks: is it a card, is it blurry, is framing correct
- [x] Wire validation into Grade flow: call validateImage before grading starts, block on failure
- [x] Show rejection error screen with message and retry button (no score shown)
- [x] Add score count-up animation on StepResult reveal (0 → final score)
- [x] Add diamond pop/stagger animation when diamonds appear one by one
- [x] Add "Top X%" percentile stat under overall score on result page
- [x] Calculate percentile from all graded cards in DB via vault.getPercentile procedure

## Result Screen UX Improvements
- [x] Add "Top X% of graded cards" line under score (live from DB)
- [x] Add "Comparable to PSA 9+" confidence anchor under ELITE GRADE label
- [x] Highlight "Ship Me a Slab – $14.99" button with glow + Most Popular badge
- [x] Rename "Save to My Vault" button to "Add to My Collection"
- [x] Add guiding next-step line above action buttons

## Slab Realism Improvements (Apr 21)
- [ ] CardSlab3D: accept backImageUrl prop — show real card back image on back face
- [ ] CardSlab3D: make acrylic crystal clear and thinner (reduce slab depth)
- [ ] CardSlab3D: improve card edge realism inside slab (visible card thickness layer)
- [ ] Grade page: pass backImageUrl to CardSlab3D in StepResult
- [ ] Vault page: pass card.backImageKey to CardSlab3D in CardDetailModal

## 3D Slab Viewer — Full Label + Image Composite (Session 2026-04-21)
- [x] Rewrite CardSlab3D.tsx: front face = real card photo + DI front label strip (diamonds, score, cert, card name)
- [x] Back face = real back card photo + DI back label strip (cert, 5-category score grid)
- [x] Crystal-clear acrylic: SLAB_D 0.35→0.18, transmission 0.95, opacity 0.08
- [x] Card edge layer: thin cream-white box at z=0 inside slab to simulate physical card thickness
- [x] Wire backImageUrl prop through Grade.tsx StepResult → CardSlab3D
- [x] Wire backImageUrl + all score/meta props through Vault.tsx CardDetailModal → CardSlab3D
- [x] Wire same props through Verify.tsx → CardSlab3D
- [x] Export CardSlab3DProps interface for downstream use
- [x] 78/78 tests passing, 0 TypeScript errors

## 3D Slab Back Face Fix (Session 2026-04-21 #2)
- [x] Back face: remove card image entirely — back is NEVER a card photo
- [x] Back face: full DI certification back design — navy/dark background, full canvas (512×716)
- [x] Back face: large DI diamond logo centered (top third)
- [x] Back face: DIAMOND INDEX™ wordmark below logo
- [x] Back face: cert ID in mono (prominent)
- [x] Back face: QR code placeholder (drawn on canvas as a grid pattern)
- [x] Back face: 5-category score grid (Centering, Edges, Surface, Corners, Eye Appeal) with gold values
- [x] Back face: "CERTIFIED AUTHENTIC" stamp / badge area
- [x] Back face: VRC.7 standard footer
- [x] Front face: keep card photo + DI label strip (no change needed)
- [x] Add subtle flip icon overlay to guide user to rotate and see the back

## Front Label Visibility Fix (Session 2026-04-21 #3)
- [x] Increase LABEL_H_FRAC from 0.22 → 0.30 so label strip is taller and more dominant
- [x] Increase "DIAMOND INDEX™" header font from 13px → 20px, stronger gold
- [x] Increase score font from 22px → 36px
- [x] Increase diamond icon size from 11px → 14px, increase gap
- [x] Increase cert ID font from 9px → 12px bold monospace
- [x] Increase card name font from 10px → 13px bold
- [x] Add a solid gold bottom border line (2.5px, 90% opacity) to clearly separate label from card area
- [x] Ensure label background is deep navy (not transparent) for strong contrast against card

## Focus Mode (Session 2026-04-21 #4)
- [x] Click slab → enters focus mode: dark semi-transparent backdrop covers page behind slab
- [x] Backdrop has backdrop-blur so background content is softly blurred
- [x] Slab lifts slightly (scale up ~4%) and gains a subtle gold glow ring on focus
- [x] Click outside slab or press Escape → exits focus mode smoothly
- [x] Smooth CSS transition (300ms ease) for enter/exit
- [x] Focus mode state is local to CardSlab3D (no prop drilling needed)

## Share Button in Focus Mode (Session 2026-04-21 #5)
- [x] Share button appears only when focus mode is active (bottom of slab overlay)
- [x] Button generates URL: window.location.origin + /verify/ + certId
- [x] Clicking copies URL to clipboard via navigator.clipboard.writeText
- [x] Brief "Link copied!" toast confirmation (2 seconds, then fades)
- [x] Button styled: small, gold outline, share icon + "Share" label
- [x] Button does not trigger focus mode exit when clicked

## Certification Moment (Session 2026-04-21 #6)
- [x] Overlay plays once on slab mount (not on every render)
- [x] Phase 0 (0–0.4s): slab starts with blur(3px) + dark dim overlay (opacity 0.55)
- [x] Phase 1 (0.4–0.9s): "CERTIFYING…" text fades in, centered, gold mono uppercase
- [x] Phase 2 (0.9–1.5s): thin scan line sweeps top-to-bottom across the slab (1.5px, light blue, subtle glow)
- [x] Phase 3 (1.5–2.1s): "CERTIFYING…" fades out, "CERTIFIED — {certId}" fades in (larger, gold)
- [x] Phase 3b: small line below: "Verified on Diamond Index™" in light mono
- [x] Phase 4 (2.1–2.8s): overlay fades out, slab blur clears, diamond glow pulse (brief gold ring)
- [x] Total duration: ~2.5 seconds, then normal slab state resumes
- [x] No repeat — plays once per mount only

## Shimmer Sweep After Certification Moment
- [x] After certPhase reaches 'certified', trigger a single diagonal shimmer sweep across the slab
- [x] Shimmer: thin diagonal white/gold gradient band, ~40px wide, skewed ~18deg
- [x] Sweeps left-to-right across the full slab width in 0.65s
- [x] Plays exactly once — no repeat, no loop
- [x] Opacity: subtle (0 → 0.38 → 0) — light catching acrylic, not a flash
- [x] CSS keyframe animation on a positioned overlay div inside the slab container
- [x] Overlay div removed from DOM after animation completes (onAnimationEnd)
- [x] Does not interfere with focus mode, rotation, or share button

## Slab Visual Refinements (Session 2026-04-21)
- [x] Front label: increase LABEL_H_FRAC from 0.30 → 0.34 for more presence
- [x] Front label: darken background to rgba(2,6,16,0.97) for stronger contrast vs card
- [x] Front label: add a 3px solid gold bottom border (rgba(201,168,76,0.95)) to cleanly separate label from card
- [x] Front label: score font 36px → 40px, diamonds 14px → 16px
- [x] Shimmer: reduce band width from 40px → 24px, reduce peak opacity from 0.38 → 0.22
- [x] Default load angle: Y=0.12 (less side tilt), X=0.06 (slight upward)
- [x] Back label: QR canvas size 90px → 108px, SCAN TO VERIFY label gold and bold
- [x] Back label: SCAN TO VERIFY label improved visibility (gold, bold 9px)

## Slab Product Realism Refinements (Session 2026-04-21)
- [x] Remove any blur/glow/shadow that bleeds over the front label area — label must have sharp printed edges
- [x] Reduce front face acrylic glare: acrylic sheen opacity 0.04→0.015, reflectivity 0.6→0.15, front material roughness 0.28→0.72
- [x] Set hero load angle: Y=0 (dead face-on), X=0.04 — user sees full label + card immediately
- [x] Back label: QR border opacity 0.3→0.7, lineWidth 0.8→1.2 for at-a-glance readability
- [x] Back label: cert ID is 18px bold monospace (already correct, confirmed)
- [x] Diamond glow shadowBlur reduced 7→3 on canvas — sharp diamonds, no bleed over label

## 3D Slab Front Label Reduction (Session 2026-04-21)
## ⚠️ PERMANENT LOCK: LabelRenderer.tsx (print version) — NEVER TOUCH dimensions, layout, or appearance
- [ ] Reduce LABEL_H_FRAC from 0.34 → 0.16 (16% of 716px = ~115px strip)
- [ ] Tighten all Y positions in buildFrontLabelCanvas to fit within 115px
- [ ] Reduce "DIAMOND INDEX™" header from 20px → 13px, Y: 26 → 14
- [ ] Reduce score from 40px → 22px, Y: 108 → 62
- [ ] Reduce diamond size from 16px → 10px, Y: 54 → 34
- [ ] Reduce cert ID from 12px → 8px, Y: 145 → 82
- [ ] Reduce card name from 13px → 9px, Y: 168 → 96
- [ ] Reduce year/set from 10px → 8px, Y: 186 → 106
- [ ] Footer line and VRC.7 text at Y: LABEL_H_PX - 8 and LABEL_H_PX - 2
- [ ] Gold bottom border remains 2px at 95% opacity — sharp printed edge

## 3D Slab Front Label — Replicate LabelRenderer Design
- [ ] Rewrite buildFrontLabelCanvas to match locked LabelRenderer 3-column layout
- [ ] Left column (~28%): card photo thumbnail + DI badge top-left + player name bottom
- [ ] Center column (~52%): DIAMOND INDEX™ header + score grid (5 categories) + FINAL SCORE panel with diamonds + score
- [ ] Right column (~20%): QR code centered + cert ID below
- [ ] Gold vertical dividers between columns
- [ ] Label strip height: increase to ~28% of canvas (200px) to fit the 3-column layout
- [ ] Card photo area: remaining 72% below the label strip
- [ ] Do NOT change LabelRenderer.tsx (permanently locked)

## Hero Marketing Render
- [x] Generate high-resolution hero slab rendering for marketing materials
- [x] Front face at hero angle (slight tilt, 3/4 view)
- [x] Realistic acrylic depth, gold trim, label clearly visible
- [x] Dark premium background (deep navy/black gradient)
- [x] Suitable for website hero, ads, social media

## Hero Render Pair — Front + Back
- [ ] Front hero render: narrow DI label strip at top, card front photo fills face
- [ ] Back hero render: DI certification back label at top, card back photo fills face
- [ ] Both at same angle, lighting, background as reference

## Grading Delivery System (Auto-Render Pipeline)
- [x] After grading completes: auto-generate 3D front slab render (card front + DI navy label) via AI image generation
- [x] After grading completes: auto-generate 3D back slab render (card back + DI cert label with FINAL SCORE/scores) via AI image generation
- [x] After grading completes: auto-generate composite mock (front + back side by side) via Python PIL
- [x] Store all 5 assets in S3: original front, original back, slab front render, slab back render, composite
- [x] Wire all 5 assets into card vault profile page
- [x] Add download buttons for each asset on card profile
- [ ] Include all 5 assets in post-grade email

## Print-Ready Label Files
- [ ] Generate print-ready front label PNG at real slab dimensions (2.5" x 0.875" @ 300 DPI = 750x263px)
- [ ] Generate print-ready back label PNG at real slab dimensions (2.5" x 0.875" @ 300 DPI = 750x263px)
- [ ] Add "Download Print Label" button on card profile page
- [ ] Labels should have crop/bleed marks for professional printing
