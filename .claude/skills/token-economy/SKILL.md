---
name: token-economy
description: Règles d'économie de tokens (abonnement Claude Pro). À appliquer en continu sur toute session : lecture, shell, vérif, agents, réponses. À charger avant ponytail.
---
# token-economy

- Localiser d'abord via `.projetmemory/` (graph.md, stack.md), puis lire seulement le bloc utile (offset/limit).
- Scope précis (fichier/dossier nommé), jamais de recherche générale ni de lecture « au cas où ».
- Lectures indépendantes groupées en un seul appel parallèle.
- Jamais relire un fichier, même modifié : Edit/Write font foi.
- Edits avec l'ancre la plus courte et unique ; remplacements de masse via sed.
- Toute sortie shell filtrée (grep/head/tail/wc), jamais en entier ; gros fichier = fragment ciblé.
- Une seule vérif par tâche, à la fin (sauf échec à corriger).
- Pas de sous-agent pour une tâche courte ; agents seulement sur demande, en sonnet, avec brief court.
- CLAUDE.md sous 150 lignes, le détail dans `.projetmemory/`.
- Réponses 1-2 phrases max ; proposer `/clear` en fin de tâche, `/compact` si le contexte reste utile.
