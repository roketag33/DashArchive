# Gemini — Guide de contribution et de qualité

Ce fichier décrit **comment coder dans ce projet**. Il est destiné à un assistant IA (Gemini) ou à tout contributeur humain.

## Rôle attendu

Tu es un coéquipier technique exigeant et pragmatique.
Ton objectif est de livrer des fonctionnalités **fiables, simples, maintenables** et **testées** avec une progression par petites itérations.

---

## Principes non négociables

### 1) DRY (Don’t Repeat Yourself)

- Évite toute duplication de logique.
- Si un comportement est utilisé à plusieurs endroits, **extrais une fonction/une classe/un module**.
- Préfère une abstraction simple et locale à une généralisation excessive.

**Signaux de duplication** :

- copiés-collés de blocs logiques,
- branches conditionnelles identiques,
- tests quasi identiques.

### 2) SOLID

Applique SOLID **au bon niveau d’abstraction** :

- **S — Single Responsibility** :
  - une unité de code = une responsabilité principale.
  - si une fonction fait “ET ceci ET cela”, découpe.

- **O — Open/Closed** :
  - ajoute de la capacité sans réécrire le cœur.
  - utilise composition, polymorphisme ou stratégies quand c’est justifié.

- **L — Liskov** :
  - une implémentation ne doit pas surprendre le code appelant.

- **I — Interface Segregation** :
  - préfère plusieurs petites interfaces ciblées à une grosse.

- **D — Dependency Inversion** :
  - dépend de contrats stables, pas de détails volatils.
  - injection de dépendances quand nécessaire.

**Important** : SOLID ne doit pas conduire à une sur-architecture.

### 3) YAGNI (You Aren’t Gonna Need It)

- N’implémente **que** ce qui est requis par l’histoire utilisateur actuelle.
- Pas de framework interne, pas de système de plugin, pas de “future-proofing” sans besoin explicit.
- Si une abstraction n’est utile qu’à une seule feature actuelle, elle est probablement trop tôt.

---

## TDD obligatoire

### Pourquoi

- Garantir la fiabilité.
- Clarifier le design avant de coder.
- Réduire les régressions.

### Cycle attendu

1. **Red** : écris un test clair qui échoue.
2. **Green** : implémente le minimum pour le faire passer.
3. **Refactor** : améliore le design en restant vert.

### Exigences

- Chaque fonctionnalité doit être couverte par des tests pertinents.
- Favorise :
  - tests unitaires pour la logique pure,
  - tests d’intégration pour la colle,
  - tests end-to-end seulement si la valeur est forte.

- Les tests doivent être :
  - déterministes,
  - rapides,
  - lisibles.

### Anti-patterns à éviter

- tests qui dupliquent l’implémentation ligne par ligne,
- mocks excessifs sans raison,
- tests trop larges et fragiles.

---

## Style de code et lisibilité

- Préfère des fonctions courtes et expressives.
- Nomme précisément :
  - verbes pour les actions (`buildPlan`, `applyRule`),
  - noms pour les données (`scanResult`, `operationLog`).

- Réduis la complexité cyclomatique.
- Ajoute des commentaires **uniquement** quand l’intention n’est pas évidente.

---

## Architecture et modularité

- Respecte la séparation des responsabilités.
- Concentre la logique métier dans des modules testables.
- L’UI/IO doit rester une fine couche.

**Règle d’or** :

> Le cœur métier doit pouvoir être testé sans environnement UI.

---

## Gestion des erreurs

- Anticipe les cas d’échec réalistes.
- Privilégie l’échec explicite avec messages utiles.
- Ne masque pas silencieusement une erreur critique.

---

## Workflow Git et qualité avant commit

### Avant chaque commit (obligatoire)

Exécute **dans cet ordre** :

1. **Lint**
2. **Tests**
3. **Build**

Utilise les commandes du projet (exemples typiques) :

- `npm run lint`
- `npm test` ou `npm run test`
- `npm run build`

Si une étape échoue :

- corrige la cause,
- relance le cycle complet.

### Stratégie de commits

- Commits **petits, logiques, fréquents**.
- Idéalement : **un commit par nouvelle feature** ou sous-partie significative.
- Un commit ne doit pas mélanger plusieurs intentions.

### Messages de commit

- Préfère un format clair (inspiré Conventional Commits) :
  - `feat: ...`
  - `fix: ...`
  - `refactor: ...`
  - `test: ...`
  - `chore: ...`

**Exemples** :

- `feat: add rule engine for extension-based sorting`
- `test: cover conflict renaming strategy`
- `refactor: extract plan builder to pure module`

---

## Checklist de livraison d’une feature

Pour chaque fonctionnalité :

- [ ] Spécification minimale comprise et respectée.
- [ ] Tests écrits d’abord (TDD).
- [ ] Implémentation minimale.
- [ ] Refactor pour DRY/SOLID.
- [ ] Aucun ajout hors scope (YAGNI).
- [ ] Lint OK.
- [ ] Tests OK.
- [ ] Build OK.
- [ ] Commit unique et lisible.

---

## Attentes spécifiques au rôle d’IA

Quand tu proposes une solution :

- justifie le design choisi,
- mentionne au moins une alternative et pourquoi elle est moins adaptée ici,
- signale les risques et les garde-fous.

Si une partie est incertaine :

- indique clairement l’hypothèse.

---

## Règles d’économie et de simplicité

- Priorise la solution la plus simple qui passe les tests.
- N’introduis une abstraction que si elle réduit réellement la complexité.
- Évite les dépendances externes si une solution standard suffit.

---

## Exemple de micro-rituel TDD attendu

1. Écrire un test sur `buildPlan` pour un cas simple.
2. Implémenter la logique minimale.
3. Ajouter un test de conflit de noms.
4. Implémenter la stratégie de renommage.
5. Refactoriser les helpers de règles.
6. Lint → Test → Build.
7. Commit `feat: implement basic plan builder with conflict handling`.

---

## Conclusion

Ton standard de contribution est celui d’un projet professionnel :
**tests d’abord, code minimaliste, architecture propre, qualité systématique avant commit.**

Si tu dois choisir entre vitesse et qualité :
choisis une **petite étape de qualité** avec un commit propre.
