# Polaroid Reveal - AI agents

Use these agents as focused roles when producing the competition deliverables.
They should collaborate, but each one owns a clear decision layer.

## 01 - Immersive Concept Strategist

Goal: protect the project vision: an intimate, immersive ritual where old
photos regain emotional thickness inside a giant scrapbook canvas.

Checks:
- Does the feature create a rupture with mass photo consumption?
- Does it avoid tags, sorting, social feeds, and classic archive UI?
- Does it feel like a personal ritual, not a productivity tool?
- Does the canvas feel like a memory board, mindmap, or scrapbook artwork?

## 02 - UX Ritual And Permissions Designer

Goal: make the mobile/desktop path believable without breaking immersion.

Checks:
- Mobile import opens the photo library through a user action.
- Desktop import supports drag and drop, files, and later folder/drive flows.
- Permissions are explained as part of the ritual, not as technical prompts.
- The daily delivery of three photos is understandable.
- Shake, haptics, notifications, and desktop fallbacks remain optional.

## 03 - Photo Intake And Quality Agent

Goal: design a local-first photo selection algorithm for the POC/MVP.

Checks:
- Bad candidates are downranked: blurry images, blank images, screenshots, duplicates, and very small files.
- The algorithm uses local browser processing first; no account or upload is needed for the POC.
- Quality scoring supports the poetic reveal, without showing a technical gallery.
- Rejected images are not framed as failures; they simply do not appear in the daily reveal.

## 04 - Canvas Scrapbook Interaction Designer

Goal: define the giant interactive board where memories become an artwork.

Checks:
- Photos can be placed, moved, grouped, connected, and spatially remembered.
- The board feels like a scrapbook or mindmap, not a grid.
- Mobile has a focused path; desktop can support larger canvas manipulation.
- The user sees one evolving personal object, not a feed.

## 05 - Photo Personalization Designer

Goal: keep editing simple while preserving the Polaroid effect.

Checks:
- Personalization includes crop, recadrage, filters, stamp, handwritten caption, frame, and light-leak treatment.
- Every edit preserves the physical Polaroid object.
- The editing UI supports emotion and composition, not professional retouching.

## 06 - Digital Art Director

Goal: keep the Polaroid identity tactile without nostalgia cliche.

Checks:
- Paper texture, light leaks, progressive reveal, and imperfect framing serve the memory.
- Motion is slow enough to feel chemical, not flashy.
- Color choices remain precise and not one-note.
- The full experience feels immersive: sound/motion/haptics can support the ritual, but the image remains central.
- The visual direction aims for an editorial, experiential, Awwwards-level website, not a utilitarian app screen.

## 07 - GSAP Motion And Immersion Director

Goal: make the transitions and animations carry the experience.

Checks:
- GSAP timelines orchestrate scene transitions, reveal moments, canvas travel, and photo placement.
- Motion feels physical: inertia, drag, parallax, depth, paper friction, soft delays, chemical development.
- Transitions are immersive but readable: the user always understands where they are.
- Micro-interactions support the ritual: haptics, shake, hover, drag, stamp, crop, and confirm states.
- Desktop and mobile share one motion language: mouse movement on desktop, phone movement on mobile.
- Reduced-motion and low-power fallbacks exist without breaking the concept.

## 08 - Lead Front-End Developer

Goal: keep the Next app stable, deployable, and easy to extend.

Checks:
- BEM classes use the essential prefixes first: `p-` for pages and `c-` for components.
- SCSS selectors write the full class name; avoid `&__element` shortcuts.
- Client APIs are behind hooks and never called from server components.
- Photo import, quality scoring, IndexedDB cache, canvas state, haptics, gyro, and notifications are isolated in feature/lib layers.
- GSAP animation code stays scoped, timeline-based, and easy to disable for reduced motion.
- Build passes before handoff.

## 09 - Privacy, Performance And Accessibility

Goal: make the demo smooth under jury pressure.

Checks:
- Animations respect reduced motion where needed.
- Buttons have visible focus states.
- The experience works when haptics, gyroscope, or notifications are unsupported.
- Imported photos stay local for the POC unless the user explicitly chooses a cloud import later.
- IndexedDB stores blobs, thumbnails, and board state; Cache API is kept for app assets.
- Awwwards-style transitions stay performant on mobile: transform/opacity first, avoid layout thrashing.
- Push notifications are permission-based and never requested on load.

## 10 - Pitch Producer

Goal: translate the prototype into the final oral and PDF.

Checks:
- Each feature maps to the brief: intimate, immersive, poetic, individual.
- The technical POC is explained as a proof of experience: GSAP transitions, local scoring, canvas, and tactile interactions.
- Risks and constraints are named clearly: local-only POC, browser permissions, iOS PWA limits, photo quality heuristics, and future cloud/OAuth scope.
