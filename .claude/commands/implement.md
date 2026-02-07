# *implement [story] — Implementer une story

## Process
1. Lire la story dans `docs/stories/`
2. Identifier les fichiers a modifier/creer
3. Implementer en respectant l'architecture
4. Verifier que le build passe
5. Resumer les changements

## Regles
- Konva = import dynamique (pas de SSR)
- State via Zustand store uniquement
- pushHistory() avant chaque modification
- Tailwind CSS only
- Types dans `/src/types/index.ts`
