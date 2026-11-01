---
name: memory-graph
description: Carte du code dans .projetmemory/graph.md (+ graph.mmd) pour localiser sans lire le code. À utiliser pour trouver un fichier, et après un nouveau module, une feature ou une intégration.
---
# memory-graph

- graphify en priorité (installé dans ~/.claude/skills/graphify) : /graphify . puis graphify update . ; lire GRAPH_REPORT.md et graphify explain avant tout fichier. Carte générée (artefacts à la racine du workspace, jamais dans un sous-dépôt).
- Sinon : `graph.md` = une ligne par module (dossier, fichiers clés, endpoints/écrans, dépendances) ; `graph.mmd` = Mermaid groupé en `subgraph` (backend, mobile, web, externes), jamais un graphe plat géant.
- Uniquement des éléments réels du code.
- Mise à jour incrémentale : ajouter la ligne/le nœud et ses liens, ne jamais tout redessiner.
- Avant de lire du code : chercher dans `graph.md` le fichier et la zone, puis lire seulement ce bloc.
