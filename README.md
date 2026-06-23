# Polaroid Reveal

POC Next.js pour le sujet Polaroid : une experience individuelle et sensible
pour raviver des photos scannees sans tomber dans une galerie, un tri ou un
outil d'archivage.

Direction actuelle : un rituel immersif ou trois photos sont revelees, modifiees
avec un effet Polaroid, puis placees sur un grand canvas scrapbook/mindmap.

## Stack

- Next.js App Router + TypeScript
- SCSS avec architecture BEM essentielle
- GSAP + `@gsap/react`
- `web-haptics` pour les retours haptiques mobile
- Device Orientation API pour le gyroscope
- Manifest PWA + service worker de base pour les notifications
- POC local-first pour l'import photo et le cache navigateur

## Commandes

```bash
pnpm dev
pnpm lint
pnpm build
```

## Structure SCSS

```txt
src/styles/
  01-settings/
  02-tools/
  03-generic/
  04-components/
  global.scss
```

Regle d'equipe : garder les selectors complets.

```scss
.c-polaroid-card__image {}
.c-polaroid-card--is-revealed .c-polaroid-card__image {}
```

Eviter :

```scss
.c-polaroid-card {
  &__image {}
}
```

## Conventions de classes

- `p-` pour les pages, exemple `p-home`.
- `c-` pour les composants, exemple `c-polaroid-card`.
- Ajouter `u-` seulement si une vraie utility devient necessaire.

## Notifications

Le POC peut demander la permission et afficher une notification de test via
`public/sw.js`. Pour un vrai rappel quotidien, il faudra ajouter une API de
souscription Push, stocker les subscriptions, generer des clefs VAPID et lancer
un cron Vercel. Voir `docs/notifications.md`.

## Photo import

Voir `docs/photo-ingestion.md`.

- Mobile : galerie via `<input type="file" accept="image/*" multiple />`.
- Desktop : drag and drop, fichiers, puis dossier si API disponible.
- POC : stockage local IndexedDB, pas de compte obligatoire.
- Algorithme : downrank flou, vide, screenshot, doublon, trop petit.

## Motion

Voir `docs/motion-system.md`.

- GSAP pour les transitions de scenes.
- Reveal chimique progressif.
- Canvas scrapbook avec pan, zoom, parallax et inertie.
- Fallback reduced-motion obligatoire.

## Deploy Vercel

Vercel detecte Next.js automatiquement.

- Install command: `pnpm install`
- Build command: `pnpm build`
- Output: `.next`

Voir `docs/vercel.md` pour les variables d'environnement push.
