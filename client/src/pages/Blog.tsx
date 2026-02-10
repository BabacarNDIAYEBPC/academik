import { Link, useParams } from "wouter";
import { useI18n } from "@/lib/i18n";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, Clock, BookOpen } from "lucide-react";
import { MODULE_CATALOG } from "./ModulePage";

interface BlogArticle {
  slug: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  keywordsFr: string;
  keywordsEn: string;
  date: string;
  readMinutes: number;
  contentFr: string;
  contentEn: string;
}

const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "comment-rediger-problematique-memoire",
    titleFr: "Comment rédiger une problématique de mémoire ?",
    titleEn: "How to Write a Dissertation Research Question?",
    descFr: "Guide complet pour formuler une problématique de mémoire efficace : méthodologie, exemples concrets et erreurs à éviter.",
    descEn: "Complete guide to formulating an effective dissertation research question: methodology, concrete examples, and mistakes to avoid.",
    keywordsFr: "problématique mémoire, formuler problématique, question de recherche, mémoire master, méthodologie",
    keywordsEn: "research question, dissertation, thesis question, master thesis, methodology",
    date: "2026-01-15",
    readMinutes: 8,
    contentFr: `La problématique est le fil conducteur de tout travail académique. Elle oriente votre recherche, structure votre réflexion et donne du sens à l'ensemble de votre mémoire. Pourtant, c'est souvent l'étape qui pose le plus de difficultés aux étudiants.

## Qu'est-ce qu'une problématique ?

La problématique n'est pas une simple question. C'est une interrogation complexe qui met en tension plusieurs éléments de votre sujet et qui nécessite une démonstration argumentée pour y répondre. Elle doit être :

- **Précise** : évitez les formulations trop larges ou trop vagues
- **Pertinente** : elle doit avoir un intérêt académique et/ou professionnel
- **Réalisable** : vous devez pouvoir y répondre dans le cadre de votre mémoire
- **Originale** : elle apporte un regard nouveau sur le sujet

## Les étapes pour formuler votre problématique

### 1. Partez de votre terrain d'observation

Identifiez un phénomène, une situation ou un constat issu de votre expérience professionnelle ou de vos lectures. C'est votre point de départ.

### 2. Identifiez la tension ou le paradoxe

Une bonne problématique naît d'une contradiction, d'un écart entre ce qui est attendu et ce qui est observé, ou d'un manque dans les connaissances existantes.

### 3. Formulez sous forme de question

Transformez votre réflexion en une question claire et directe. Privilégiez les formulations commençant par "En quoi", "Dans quelle mesure", "Comment" plutôt que les questions fermées (oui/non).

### 4. Testez votre problématique

Vérifiez qu'elle remplit les critères suivants :
- Peut-on y répondre par une argumentation structurée ?
- Est-elle suffisamment délimitée pour un mémoire ?
- Permet-elle de mobiliser un cadre théorique pertinent ?

## Exemples de problématiques par domaine

**Soins infirmiers :** "En quoi l'accompagnement infirmier par la relation d'aide contribue-t-il à l'amélioration de l'observance thérapeutique chez les patients atteints de maladies chroniques ?"

**Management :** "Dans quelle mesure le télétravail hybride modifie-t-il les pratiques managériales et l'engagement des collaborateurs dans les PME françaises ?"

**Ressources humaines :** "Comment la mise en place d'une démarche de qualité de vie au travail impacte-t-elle la rétention des talents dans le secteur hospitalier ?"

## Les erreurs à éviter

1. **La question trop large** : "Quels sont les enjeux de la santé ?" → Trop vaste, impossible à traiter
2. **La question fermée** : "Le management participatif est-il efficace ?" → Réponse oui/non insuffisante
3. **L'absence de tension** : "Comment fonctionne le service RH ?" → Pas de problème à résoudre
4. **Le parti pris** : "Pourquoi le numérique détruit-il l'emploi ?" → Présupposé non démontré

## Conclusion

La formulation de la problématique est un processus itératif. N'hésitez pas à la faire évoluer au fil de vos recherches et lectures. Un bon outil de méthodologie peut vous aider à structurer votre réflexion et à tester différentes formulations jusqu'à trouver celle qui guidera efficacement votre travail.`,
    contentEn: `The research question is the guiding thread of any academic work. It directs your research, structures your thinking, and gives meaning to your entire dissertation. Yet, it's often the step that poses the most difficulties for students.

## What is a Research Question?

A research question is not a simple question. It's a complex interrogation that puts several elements of your subject in tension and requires a reasoned demonstration to answer. It must be:

- **Precise**: avoid formulations that are too broad or too vague
- **Relevant**: it must have academic and/or professional interest
- **Feasible**: you must be able to answer it within the scope of your dissertation
- **Original**: it brings a new perspective to the subject

## Steps to Formulate Your Research Question

### 1. Start from Your Observation

Identify a phenomenon, situation, or finding from your professional experience or readings. This is your starting point.

### 2. Identify the Tension or Paradox

A good research question arises from a contradiction, a gap between what is expected and what is observed, or a lack in existing knowledge.

### 3. Formulate as a Question

Transform your reflection into a clear and direct question. Prefer formulations starting with "To what extent", "How", "In what way" rather than closed questions (yes/no).

### 4. Test Your Research Question

Check that it meets the following criteria:
- Can it be answered through structured argumentation?
- Is it sufficiently delimited for a dissertation?
- Does it allow mobilizing a relevant theoretical framework?

## Examples of Research Questions by Field

**Nursing:** "To what extent does nursing support through the helping relationship contribute to improving therapeutic adherence in patients with chronic diseases?"

**Management:** "How does hybrid remote work modify managerial practices and employee engagement in French SMEs?"

**Human Resources:** "How does implementing a quality of work life approach impact talent retention in the hospital sector?"

## Mistakes to Avoid

1. **Too broad a question**: "What are the challenges of healthcare?" → Too vast, impossible to address
2. **Closed question**: "Is participative management effective?" → Yes/no answer is insufficient
3. **No tension**: "How does the HR department work?" → No problem to solve
4. **Bias**: "Why does digital technology destroy jobs?" → Unproven assumption

## Conclusion

Formulating the research question is an iterative process. Don't hesitate to evolve it as you progress through your research and readings. A good methodology tool can help you structure your thinking and test different formulations until you find the one that will effectively guide your work.`,
  },
  {
    slug: "structurer-plan-memoire",
    titleFr: "Comment structurer le plan de votre mémoire ?",
    titleEn: "How to Structure Your Dissertation Outline?",
    descFr: "Apprenez à construire un plan de mémoire solide et cohérent. Découvrez les différents types de plans et les meilleures pratiques.",
    descEn: "Learn how to build a solid and coherent dissertation outline. Discover different types of plans and best practices.",
    keywordsFr: "plan mémoire, structurer mémoire, plan de travail, organisation mémoire, parties mémoire",
    keywordsEn: "dissertation outline, structure thesis, work plan, organize dissertation, thesis sections",
    date: "2026-01-22",
    readMinutes: 7,
    contentFr: `Le plan est l'architecture de votre mémoire. Un plan bien construit facilite la rédaction, assure la cohérence de votre argumentation et guide le lecteur dans votre raisonnement.

## Les différents types de plans

### Plan analytique (le plus courant)
Structure en trois parties : constat → analyse → propositions. Idéal pour les mémoires professionnels.

### Plan dialectique
Thèse → antithèse → synthèse. Adapté aux sujets qui comportent un débat ou une opposition.

### Plan thématique
Organisation par thèmes ou aspects du sujet. Convient aux sujets larges qui nécessitent une exploration multi-dimensionnelle.

### Plan chronologique
Organisation temporelle. Pertinent pour les sujets historiques ou les études de cas avec une dimension évolutive.

## La structure type d'un mémoire

### Introduction (10-15% du volume)
- Accroche et contextualisation
- Définition des termes clés
- Présentation de la problématique
- Annonce du plan

### Partie 1 : Cadre théorique (25-30%)
- Revue de littérature
- Cadre conceptuel
- Modèles théoriques retenus

### Partie 2 : Méthodologie et terrain (25-30%)
- Présentation de la méthodologie
- Description du terrain d'étude
- Outils de collecte de données
- Présentation des résultats

### Partie 3 : Analyse et discussion (25-30%)
- Analyse des résultats
- Discussion au regard de la littérature
- Limites de l'étude
- Préconisations

### Conclusion (5-10%)
- Synthèse des résultats
- Réponse à la problématique
- Ouverture

## Conseils pratiques

1. **Équilibrez vos parties** : chaque partie doit avoir un volume comparable
2. **Limitez la profondeur** : ne dépassez pas 3 niveaux de sous-parties
3. **Titrez clairement** : chaque titre doit être informatif et refléter le contenu
4. **Assurez les transitions** : chaque partie doit s'enchaîner logiquement avec la suivante
5. **Restez flexible** : le plan peut évoluer pendant la rédaction

## Conclusion

Un plan solide est la clé d'un mémoire réussi. Prenez le temps de le construire avant de vous lancer dans la rédaction. Des outils de méthodologie académique peuvent vous aider à générer et ajuster votre plan en fonction de votre problématique et de votre cadre théorique.`,
    contentEn: `The outline is the architecture of your dissertation. A well-constructed plan facilitates writing, ensures the coherence of your argumentation, and guides the reader through your reasoning.

## Different Types of Outlines

### Analytical Plan (most common)
Three-part structure: observation → analysis → proposals. Ideal for professional dissertations.

### Dialectical Plan
Thesis → antithesis → synthesis. Suited for subjects involving debate or opposition.

### Thematic Plan
Organization by themes or aspects of the subject. Suitable for broad subjects requiring multi-dimensional exploration.

### Chronological Plan
Temporal organization. Relevant for historical subjects or case studies with an evolutionary dimension.

## Standard Dissertation Structure

### Introduction (10-15% of volume)
- Hook and contextualization
- Definition of key terms
- Presentation of the research question
- Plan announcement

### Part 1: Theoretical Framework (25-30%)
- Literature review
- Conceptual framework
- Selected theoretical models

### Part 2: Methodology and Field (25-30%)
- Methodology presentation
- Study field description
- Data collection tools
- Results presentation

### Part 3: Analysis and Discussion (25-30%)
- Results analysis
- Discussion in light of literature
- Study limitations
- Recommendations

### Conclusion (5-10%)
- Results synthesis
- Answer to the research question
- Opening

## Practical Tips

1. **Balance your sections**: each part should have comparable volume
2. **Limit depth**: don't exceed 3 levels of sub-sections
3. **Title clearly**: each title should be informative and reflect content
4. **Ensure transitions**: each part should logically connect to the next
5. **Stay flexible**: the plan can evolve during writing

## Conclusion

A solid outline is the key to a successful dissertation. Take the time to build it before diving into writing. Academic methodology tools can help you generate and adjust your outline based on your research question and theoretical framework.`,
  },
  {
    slug: "cadre-theorique-conceptuel-memoire",
    titleFr: "Cadre théorique et conceptuel : guide complet",
    titleEn: "Theoretical and Conceptual Framework: Complete Guide",
    descFr: "Comprendre la différence entre cadre théorique et cadre conceptuel, et savoir les construire pour votre mémoire.",
    descEn: "Understand the difference between theoretical and conceptual frameworks, and how to build them for your dissertation.",
    keywordsFr: "cadre théorique, cadre conceptuel, mémoire, théories, concepts, schéma conceptuel",
    keywordsEn: "theoretical framework, conceptual framework, dissertation, theories, concepts, conceptual map",
    date: "2026-01-29",
    readMinutes: 9,
    contentFr: `Le cadre théorique et le cadre conceptuel sont deux piliers essentiels de tout mémoire académique. Bien qu'ils soient souvent confondus, ils remplissent des fonctions distinctes et complémentaires.

## Cadre théorique vs cadre conceptuel

### Le cadre théorique
Il s'appuie sur les théories existantes dans votre domaine. Il répond à la question : "Sur quelles théories scientifiques repose votre recherche ?"

**Exemples de théories courantes :**
- Théorie de l'attachement (Bowlby) en soins infirmiers
- Théorie de la motivation (Maslow, Herzberg) en management
- Théorie de l'apprentissage organisationnel (Argyris, Senge) en RH

### Le cadre conceptuel
Il définit et articule les concepts clés de votre recherche. Il répond à la question : "Quels sont les concepts centraux que vous étudiez et comment sont-ils liés entre eux ?"

## Comment construire votre cadre théorique

### Étape 1 : Identifier les théories pertinentes
À partir de votre revue de littérature, repérez les théories qui éclairent votre problématique.

### Étape 2 : Sélectionner et justifier
Retenez 2 à 4 théories maximum et expliquez pourquoi elles sont pertinentes pour votre sujet.

### Étape 3 : Articuler les théories entre elles
Montrez comment les théories sélectionnées se complètent ou s'opposent pour éclairer votre problématique.

## Comment construire votre cadre conceptuel

### Étape 1 : Extraire les concepts clés
Identifiez les 3 à 6 concepts centraux de votre recherche à partir de votre problématique et de votre cadre théorique.

### Étape 2 : Définir chaque concept
Pour chaque concept, proposez une définition académique en vous appuyant sur les auteurs de référence.

### Étape 3 : Établir les relations
Montrez comment les concepts sont reliés entre eux. C'est ici qu'intervient le schéma conceptuel.

### Étape 4 : Le schéma conceptuel
Représentez visuellement les relations entre vos concepts. Ce schéma est un outil puissant pour :
- Visualiser votre raisonnement
- Communiquer votre approche
- Guider votre collecte de données

## Erreurs fréquentes

1. **Confondre théorie et concept** : une théorie est un système explicatif, un concept est une notion abstraite
2. **Accumuler les théories** : mieux vaut approfondir 2-3 théories que survoler 10
3. **Oublier de justifier** : expliquez toujours pourquoi vous avez choisi ces théories/concepts
4. **Négliger les liens** : l'articulation entre les éléments est aussi importante que les éléments eux-mêmes

## Conclusion

Le cadre théorique et conceptuel donne de la rigueur scientifique à votre mémoire. C'est un travail exigeant mais fondamental qui conditionne la qualité de toute votre recherche.`,
    contentEn: `The theoretical and conceptual frameworks are two essential pillars of any academic dissertation. Although often confused, they serve distinct and complementary functions.

## Theoretical Framework vs Conceptual Framework

### The Theoretical Framework
It relies on existing theories in your field. It answers the question: "What scientific theories does your research rest upon?"

**Examples of common theories:**
- Attachment theory (Bowlby) in nursing
- Motivation theory (Maslow, Herzberg) in management
- Organizational learning theory (Argyris, Senge) in HR

### The Conceptual Framework
It defines and articulates the key concepts of your research. It answers the question: "What are the central concepts you are studying and how are they related?"

## How to Build Your Theoretical Framework

### Step 1: Identify Relevant Theories
From your literature review, identify theories that illuminate your research question.

### Step 2: Select and Justify
Retain a maximum of 2 to 4 theories and explain why they are relevant to your subject.

### Step 3: Articulate Theories Together
Show how the selected theories complement or oppose each other to illuminate your research question.

## How to Build Your Conceptual Framework

### Step 1: Extract Key Concepts
Identify the 3 to 6 central concepts of your research from your research question and theoretical framework.

### Step 2: Define Each Concept
For each concept, provide an academic definition based on reference authors.

### Step 3: Establish Relationships
Show how concepts are connected to each other. This is where the conceptual map comes in.

### Step 4: The Conceptual Map
Visually represent the relationships between your concepts. This diagram is a powerful tool for:
- Visualizing your reasoning
- Communicating your approach
- Guiding your data collection

## Common Mistakes

1. **Confusing theory and concept**: a theory is an explanatory system, a concept is an abstract notion
2. **Accumulating theories**: it's better to deepen 2-3 theories than to skim 10
3. **Forgetting to justify**: always explain why you chose these theories/concepts
4. **Neglecting links**: the articulation between elements is as important as the elements themselves

## Conclusion

The theoretical and conceptual framework gives scientific rigor to your dissertation. It's demanding but fundamental work that conditions the quality of your entire research.`,
  },
  {
    slug: "revue-litterature-methode",
    titleFr: "Revue de littérature : méthode et bonnes pratiques",
    titleEn: "Literature Review: Method and Best Practices",
    descFr: "Comment mener une revue de littérature efficace pour votre mémoire : recherche, sélection, analyse et synthèse des sources.",
    descEn: "How to conduct an effective literature review for your dissertation: search, selection, analysis, and synthesis of sources.",
    keywordsFr: "revue de littérature, recherche bibliographique, sources académiques, analyse articles, mémoire",
    keywordsEn: "literature review, bibliographic research, academic sources, article analysis, dissertation",
    date: "2026-02-01",
    readMinutes: 10,
    contentFr: `La revue de littérature est une étape fondamentale de votre mémoire. Elle démontre votre maîtrise du sujet, situe votre recherche dans le champ scientifique existant et justifie la pertinence de votre problématique.

## Qu'est-ce qu'une revue de littérature ?

C'est une synthèse critique et organisée des travaux existants sur votre sujet. Elle ne se limite pas à un résumé d'articles : elle analyse, compare, confronte et évalue les sources pour dégager les tendances, les consensus, les controverses et les lacunes dans la connaissance.

## Les étapes de la revue de littérature

### 1. Définir vos mots-clés et équations de recherche

Identifiez les termes clés de votre sujet en français et en anglais. Combinez-les avec des opérateurs booléens :
- **ET / AND** : restreint la recherche
- **OU / OR** : élargit la recherche
- **SAUF / NOT** : exclut des termes

Exemple : "qualité de vie au travail" ET "secteur hospitalier" ET "infirmier"

### 2. Interroger les bases de données

Utilisez les plateformes académiques reconnues :
- **Google Scholar** : large couverture, accès gratuit
- **PubMed** : référence en sciences de la santé
- **HAL** : archives ouvertes françaises
- **CAIRN** : sciences humaines et sociales francophones
- **Web of Science** : articles internationaux à comité de lecture

### 3. Sélectionner les sources pertinentes

Appliquez des critères de sélection :
- **Actualité** : privilégiez les publications des 5-10 dernières années
- **Pertinence** : le sujet doit être en lien direct avec votre problématique
- **Qualité** : préférez les articles publiés dans des revues à comité de lecture
- **Diversité** : variez les types de sources (articles, thèses, rapports institutionnels)

### 4. Analyser et synthétiser

Pour chaque source retenue :
- Identifiez la question de recherche, la méthodologie, les résultats principaux
- Évaluez la qualité méthodologique
- Notez les forces et les limites

### 5. Organiser votre revue

Structurez votre revue de manière thématique (et non source par source). Regroupez les travaux par thème, par approche méthodologique ou par résultats.

## La confrontation d'articles

La confrontation consiste à mettre en dialogue plusieurs articles sur un même thème. Elle met en évidence :
- Les **convergences** : ce sur quoi les auteurs sont d'accord
- Les **divergences** : les points de désaccord
- Les **complémentarités** : ce que chaque étude apporte de spécifique

## Conseils pratiques

1. **Tenez un tableau de synthèse** : auteur, année, question, méthode, résultats, limites
2. **Citez correctement** : respectez la norme bibliographique demandée (APA, Vancouver, etc.)
3. **Soyez critique** : ne prenez pas tout pour acquis, évaluez la solidité des travaux
4. **Quantifiez** : visez 15 à 30 sources pour un mémoire de master

## Conclusion

Une revue de littérature rigoureuse est le socle de tout travail académique de qualité. Elle requiert méthode, rigueur et esprit critique. Des outils de recherche connectés aux plateformes académiques peuvent vous aider à automatiser la recherche, la sélection et l'analyse de vos sources.`,
    contentEn: `The literature review is a fundamental step of your dissertation. It demonstrates your mastery of the subject, situates your research within the existing scientific field, and justifies the relevance of your research question.

## What is a Literature Review?

It's a critical and organized synthesis of existing work on your subject. It goes beyond summarizing articles: it analyzes, compares, confronts, and evaluates sources to identify trends, consensus, controversies, and gaps in knowledge.

## Steps of the Literature Review

### 1. Define Your Keywords and Search Equations

Identify the key terms of your subject in your working languages. Combine them with Boolean operators:
- **AND**: restricts the search
- **OR**: broadens the search
- **NOT**: excludes terms

Example: "quality of work life" AND "hospital sector" AND "nurse"

### 2. Query Academic Databases

Use recognized academic platforms:
- **Google Scholar**: broad coverage, free access
- **PubMed**: reference in health sciences
- **HAL**: French open archives
- **CAIRN**: French-speaking humanities and social sciences
- **Web of Science**: international peer-reviewed articles

### 3. Select Relevant Sources

Apply selection criteria:
- **Currency**: prioritize publications from the last 5-10 years
- **Relevance**: the subject must be directly related to your research question
- **Quality**: prefer articles published in peer-reviewed journals
- **Diversity**: vary source types (articles, theses, institutional reports)

### 4. Analyze and Synthesize

For each selected source:
- Identify the research question, methodology, main results
- Evaluate methodological quality
- Note strengths and limitations

### 5. Organize Your Review

Structure your review thematically (not source by source). Group works by theme, methodological approach, or results.

## Article Confrontation

Confrontation involves putting several articles on the same theme in dialogue. It highlights:
- **Convergences**: what authors agree on
- **Divergences**: points of disagreement
- **Complementarities**: what each study specifically contributes

## Practical Tips

1. **Keep a synthesis table**: author, year, question, method, results, limitations
2. **Cite correctly**: follow the required bibliographic standard (APA, Vancouver, etc.)
3. **Be critical**: don't take everything for granted, evaluate the solidity of works
4. **Quantify**: aim for 15 to 30 sources for a master's dissertation

## Conclusion

A rigorous literature review is the foundation of any quality academic work. It requires method, rigor, and critical thinking. Research tools connected to academic platforms can help you automate the search, selection, and analysis of your sources.`,
  },
  {
    slug: "methodologie-memoire-guide",
    titleFr: "Guide de la méthodologie de mémoire",
    titleEn: "Dissertation Methodology Guide",
    descFr: "Comment choisir et rédiger la partie méthodologie de votre mémoire : approche qualitative, quantitative ou mixte.",
    descEn: "How to choose and write the methodology section of your dissertation: qualitative, quantitative, or mixed approach.",
    keywordsFr: "méthodologie mémoire, approche qualitative, approche quantitative, entretien, questionnaire, collecte données",
    keywordsEn: "dissertation methodology, qualitative approach, quantitative approach, interview, questionnaire, data collection",
    date: "2026-02-05",
    readMinutes: 8,
    contentFr: `La méthodologie est la partie de votre mémoire qui explique comment vous avez mené votre recherche. Elle doit être suffisamment détaillée pour qu'un autre chercheur puisse reproduire votre étude.

## Les grandes approches méthodologiques

### Approche qualitative
Elle vise à comprendre un phénomène en profondeur. Elle est adaptée quand vous cherchez à explorer des expériences, des perceptions ou des significations.

**Outils de collecte :**
- Entretiens semi-directifs
- Observation participante
- Focus groups
- Analyse documentaire

**Analyse des données :**
- Analyse thématique
- Analyse de contenu
- Codage des verbatims

### Approche quantitative
Elle vise à mesurer, quantifier et établir des relations statistiques. Elle est adaptée quand vous cherchez à tester des hypothèses ou à généraliser des résultats.

**Outils de collecte :**
- Questionnaires fermés
- Échelles de mesure
- Données statistiques existantes

**Analyse des données :**
- Statistiques descriptives (moyennes, écarts-types)
- Tests statistiques (chi-2, corrélation, régression)
- Tableaux et graphiques

### Approche mixte
Elle combine les deux approches pour bénéficier de leurs avantages respectifs. Par exemple : un questionnaire quantitatif complété par des entretiens qualitatifs.

## Comment rédiger la méthodologie

### 1. Justifiez votre choix méthodologique
Expliquez pourquoi votre approche est la plus adaptée à votre problématique.

### 2. Décrivez votre population et votre échantillon
- Qui sont vos participants ?
- Comment les avez-vous sélectionnés ?
- Combien sont-ils ?

### 3. Présentez vos outils de collecte
- Décrivez votre guide d'entretien ou questionnaire
- Expliquez comment vous l'avez construit
- Mentionnez le pré-test éventuel

### 4. Détaillez le déroulement
- Quand et où la collecte a-t-elle eu lieu ?
- Comment les entretiens/questionnaires ont-ils été administrés ?
- Quelle a été la durée ?

### 5. Expliquez votre méthode d'analyse
- Comment avez-vous traité les données ?
- Quels logiciels ou outils avez-vous utilisés ?

### 6. Abordez les considérations éthiques
- Consentement éclairé
- Anonymat et confidentialité
- Validation par un comité d'éthique (si applicable)

## Les 5 tableaux méthodologiques

Pour structurer votre méthodologie, utilisez ces 5 tableaux analytiques :

1. **Tableau des variables** : variable, indicateurs, modalités de mesure
2. **Tableau de la population** : caractéristiques, critères d'inclusion/exclusion
3. **Tableau des outils** : outil, objectif, mode d'administration
4. **Tableau du calendrier** : étape, période, durée
5. **Tableau des analyses** : données, méthode d'analyse, objectif

## Conclusion

La méthodologie est le gage de la rigueur scientifique de votre travail. Une méthodologie bien pensée et bien rédigée renforce la crédibilité de vos résultats et de vos conclusions.`,
    contentEn: `Methodology is the part of your dissertation that explains how you conducted your research. It must be detailed enough for another researcher to reproduce your study.

## Major Methodological Approaches

### Qualitative Approach
It aims to understand a phenomenon in depth. It's suitable when you seek to explore experiences, perceptions, or meanings.

**Collection tools:**
- Semi-structured interviews
- Participant observation
- Focus groups
- Documentary analysis

**Data analysis:**
- Thematic analysis
- Content analysis
- Verbatim coding

### Quantitative Approach
It aims to measure, quantify, and establish statistical relationships. It's suitable when you seek to test hypotheses or generalize results.

**Collection tools:**
- Closed questionnaires
- Measurement scales
- Existing statistical data

**Data analysis:**
- Descriptive statistics (means, standard deviations)
- Statistical tests (chi-square, correlation, regression)
- Tables and charts

### Mixed Approach
It combines both approaches to benefit from their respective advantages. For example: a quantitative questionnaire supplemented by qualitative interviews.

## How to Write the Methodology

### 1. Justify Your Methodological Choice
Explain why your approach is most suited to your research question.

### 2. Describe Your Population and Sample
- Who are your participants?
- How did you select them?
- How many are there?

### 3. Present Your Collection Tools
- Describe your interview guide or questionnaire
- Explain how you constructed it
- Mention any pre-test

### 4. Detail the Process
- When and where did data collection take place?
- How were interviews/questionnaires administered?
- What was the duration?

### 5. Explain Your Analysis Method
- How did you process the data?
- What software or tools did you use?

### 6. Address Ethical Considerations
- Informed consent
- Anonymity and confidentiality
- Ethics committee validation (if applicable)

## The 5 Methodological Tables

To structure your methodology, use these 5 analytical tables:

1. **Variables table**: variable, indicators, measurement methods
2. **Population table**: characteristics, inclusion/exclusion criteria
3. **Tools table**: tool, objective, administration method
4. **Calendar table**: step, period, duration
5. **Analysis table**: data, analysis method, objective

## Conclusion

Methodology is the guarantee of scientific rigor in your work. A well-thought-out and well-written methodology strengthens the credibility of your results and conclusions.`,
  },
  {
    slug: "tfe-infirmier-guide-complet",
    titleFr: "TFE Infirmier : guide complet pour réussir",
    titleEn: "Nursing Thesis (TFE): Complete Guide to Success",
    descFr: "Tout savoir sur le TFE infirmier : de la situation d'appel à la soutenance, en passant par la problématique et la méthodologie.",
    descEn: "Everything you need to know about the nursing thesis (TFE): from the triggering situation to the defense, including research question and methodology.",
    keywordsFr: "TFE infirmier, travail fin études, IFSI, situation appel, soutenance infirmier, mémoire infirmier",
    keywordsEn: "nursing thesis, TFE, IFSI, triggering situation, nursing defense, nursing dissertation",
    date: "2026-02-08",
    readMinutes: 12,
    contentFr: `Le Travail de Fin d'Études (TFE) est l'aboutissement de votre formation en soins infirmiers. C'est un mémoire de recherche qui démontre votre capacité à mener une réflexion professionnelle structurée et argumentée.

## Les étapes du TFE infirmier

### 1. La situation d'appel

C'est le point de départ de votre TFE. Elle décrit une situation de soin vécue qui vous a interpellé(e) et qui soulève un questionnement professionnel.

**Comment la rédiger :**
- Décrivez les faits de manière objective et chronologique
- Identifiez ce qui vous a questionné
- Précisez le contexte (service, patient, équipe)
- Expliquez l'impact émotionnel et professionnel

**Conseils :**
- Restez factuel(le) et professionnel(le)
- Anonymisez tous les noms et lieux
- Choisissez une situation suffisamment riche pour alimenter une réflexion approfondie

### 2. La question de départ

À partir de votre situation d'appel, formulez une question de départ. C'est une question large qui oriente votre exploration initiale.

Exemple : "En quoi la communication non verbale influence-t-elle la relation soignant-soigné en réanimation ?"

### 3. Le cadre conceptuel

Définissez les concepts clés issus de votre question de départ :
- Concepts infirmiers (relation d'aide, éducation thérapeutique, accompagnement...)
- Concepts psychologiques (anxiété, coping, résilience...)
- Concepts organisationnels (travail en équipe, transmissions, coordination...)

### 4. La problématique et les hypothèses

Affinez votre question de départ en une problématique précise et formulez 2 à 3 hypothèses de recherche.

### 5. L'enquête de terrain

#### L'entretien semi-directif
C'est l'outil privilégié du TFE infirmier :
- Préparez un guide d'entretien avec 5 à 8 questions ouvertes
- Interrogez 3 à 6 professionnels
- Enregistrez (avec accord) et retranscrivez intégralement

#### L'analyse des entretiens
- Codez les verbatims par thème
- Identifiez les convergences et divergences
- Confrontez les résultats avec votre cadre conceptuel

### 6. La rédaction

**Structure type du TFE :**
1. Introduction
2. Situation d'appel
3. Question de départ
4. Cadre conceptuel
5. Méthodologie
6. Résultats et analyse
7. Discussion
8. Conclusion
9. Bibliographie
10. Annexes

### 7. La soutenance

La soutenance dure généralement 20 à 30 minutes :
- 10-15 minutes de présentation
- 10-15 minutes de questions du jury

**Conseils pour la soutenance :**
- Préparez un support visuel clair (PowerPoint)
- Ne lisez pas votre texte, parlez avec vos propres mots
- Anticipez les questions possibles du jury
- Montrez votre évolution professionnelle

## Les compétences évaluées

Le jury évalue :
- La qualité de la réflexion et de l'analyse
- La rigueur méthodologique
- La capacité à mobiliser des références théoriques
- La posture professionnelle
- La qualité de la communication orale et écrite

## Conclusion

Le TFE est un exercice exigeant mais formateur. C'est l'occasion de développer votre identité professionnelle et de démontrer votre capacité à questionner votre pratique de manière rigoureuse et constructive.`,
    contentEn: `The End-of-Studies Work (TFE - Travail de Fin d'Études) is the culmination of your nursing training. It's a research dissertation that demonstrates your ability to conduct a structured and argued professional reflection.

## Steps of the Nursing TFE

### 1. The Triggering Situation

This is the starting point of your TFE. It describes a care situation you experienced that struck you and raises a professional question.

**How to write it:**
- Describe the facts objectively and chronologically
- Identify what questioned you
- Specify the context (department, patient, team)
- Explain the emotional and professional impact

**Tips:**
- Stay factual and professional
- Anonymize all names and places
- Choose a situation rich enough to fuel in-depth reflection

### 2. The Initial Question

From your triggering situation, formulate an initial question. It's a broad question that guides your initial exploration.

Example: "How does non-verbal communication influence the caregiver-patient relationship in intensive care?"

### 3. The Conceptual Framework

Define the key concepts from your initial question:
- Nursing concepts (helping relationship, therapeutic education, support...)
- Psychological concepts (anxiety, coping, resilience...)
- Organizational concepts (teamwork, handoffs, coordination...)

### 4. The Research Question and Hypotheses

Refine your initial question into a precise research question and formulate 2 to 3 research hypotheses.

### 5. Field Investigation

#### Semi-structured Interview
This is the preferred tool for nursing TFE:
- Prepare an interview guide with 5 to 8 open questions
- Interview 3 to 6 professionals
- Record (with consent) and transcribe in full

#### Interview Analysis
- Code verbatims by theme
- Identify convergences and divergences
- Compare results with your conceptual framework

### 6. Writing

**Standard TFE structure:**
1. Introduction
2. Triggering situation
3. Initial question
4. Conceptual framework
5. Methodology
6. Results and analysis
7. Discussion
8. Conclusion
9. Bibliography
10. Appendices

### 7. The Defense

The defense typically lasts 20 to 30 minutes:
- 10-15 minutes of presentation
- 10-15 minutes of jury questions

**Defense tips:**
- Prepare a clear visual support (PowerPoint)
- Don't read your text, speak in your own words
- Anticipate possible jury questions
- Show your professional growth

## Evaluated Competencies

The jury evaluates:
- Quality of reflection and analysis
- Methodological rigor
- Ability to mobilize theoretical references
- Professional posture
- Quality of oral and written communication

## Conclusion

The TFE is a demanding but formative exercise. It's an opportunity to develop your professional identity and demonstrate your ability to question your practice in a rigorous and constructive manner.`,
  },
];

const BLOG_TO_MODULES: Record<string, string[]> = {
  "comment-rediger-problematique-memoire": ["problematique", "memoire", "tfe-infirmier"],
  "structurer-plan-memoire": ["plan-de-travail", "memoire", "redaction-assistee"],
  "cadre-theorique-conceptuel-memoire": ["cadre-theorique-conceptuel", "revue-de-litterature", "memoire"],
  "revue-litterature-methode": ["revue-de-litterature", "bibliographie-multi-normes", "analyse-articles-scientifiques"],
  "methodologie-memoire-guide": ["methodologie-recherche", "questionnaire-recherche", "guide-entretien"],
  "tfe-infirmier-guide-complet": ["tfe-infirmier", "guide-entretien", "analyse-qualitative", "powerpoint-soutenance"],
};

function BlogList() {
  const { t, lang } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        titleKey="blog.pageTitle"
        descriptionKey="blog.pageDescription"
        keywordsKey="blog.pageKeywords"
        canonicalPath="/blog"
        ogType="website"
      />
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-blog-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg">Academik</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" data-testid="text-blog-title">
            {t("blog.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("blog.subtitle")}
          </p>
        </div>

        <div className="space-y-6" data-testid="blog-article-list">
          {BLOG_ARTICLES.map((article, i) => (
            <Link key={article.slug} href={`/blog/${article.slug}`}>
              <Card className="hover-elevate cursor-pointer overflow-visible" data-testid={`blog-card-${i}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xl font-bold" data-testid={`text-blog-title-${i}`}>
                      {lang === "fr" ? article.titleFr : article.titleEn}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {lang === "fr" ? article.descFr : article.descEn}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readMinutes} min {lang === "fr" ? "de lecture" : "read"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useI18n();

  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{lang === "fr" ? "Article non trouvé" : "Article not found"}</h1>
          <Link href="/blog">
            <Button data-testid="link-blog-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === "fr" ? "Retour au blog" : "Back to blog"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = lang === "fr" ? article.titleFr : article.titleEn;
  const desc = lang === "fr" ? article.descFr : article.descEn;
  const content = lang === "fr" ? article.contentFr : article.contentEn;
  const keywords = lang === "fr" ? article.keywordsFr : article.keywordsEn;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": desc,
    "datePublished": article.date,
    "author": {
      "@type": "Organization",
      "name": "Performance Consulting Groupe SAS",
      "url": "https://academik.fr",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Academik",
      "url": "https://academik.fr",
      "logo": { "@type": "ImageObject", "url": "https://academik.fr/images/logo-512.png" },
    },
    "mainEntityOfPage": `https://academik.fr/blog/${article.slug}`,
    "inLanguage": lang,
    "wordCount": content.split(/\s+/).length,
  };

  const sections = content.split("\n\n").map((block) => block.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        titleKey=""
        directTitle={`${title} - Academik`}
        directDescription={desc}
        directKeywords={keywords}
        canonicalPath={`/blog/${article.slug}`}
        ogType="article"
        jsonLd={jsonLd}
      />

      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/blog">
            <Button variant="ghost" size="sm" data-testid="link-article-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === "fr" ? "Retour au blog" : "Back to blog"}
            </Button>
          </Link>
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold text-lg">Academik</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" data-testid="text-article-title">
              {title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readMinutes} min {lang === "fr" ? "de lecture" : "read"}
              </span>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none" data-testid="article-content">
            {sections.map((section, i) => {
              if (section.startsWith("## ")) {
                return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{section.replace("## ", "")}</h2>;
              }
              if (section.startsWith("### ")) {
                return <h3 key={i} className="text-xl font-semibold mt-6 mb-3">{section.replace("### ", "")}</h3>;
              }
              if (section.startsWith("- ") || section.startsWith("1. ")) {
                const items = section.split("\n").filter(Boolean);
                const isOrdered = section.startsWith("1. ");
                const ListTag = isOrdered ? "ol" : "ul";
                return (
                  <ListTag key={i} className={`mb-4 space-y-1 ${isOrdered ? "list-decimal" : "list-disc"} pl-6`}>
                    {items.map((item, j) => (
                      <li key={j} className="text-sm leading-relaxed text-muted-foreground">
                        <span dangerouslySetInnerHTML={{ __html: item.replace(/^[-\d.]+\s*/, "").replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />
                      </li>
                    ))}
                  </ListTag>
                );
              }
              return (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground mb-4">
                  <span dangerouslySetInnerHTML={{ __html: section.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />
                </p>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t">
            <Card className="overflow-visible">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-2">
                  {lang === "fr" ? "Besoin d'aide pour votre mémoire ?" : "Need help with your dissertation?"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {lang === "fr"
                    ? "Academik vous accompagne dans la structuration et la rédaction de votre travail académique."
                    : "Academik supports you in structuring and writing your academic work."}
                </p>
                <Link href="/">
                  <Button data-testid="link-article-cta">
                    {lang === "fr" ? "Découvrir Academik" : "Discover Academik"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {(() => {
            const relatedModuleSlugs = BLOG_TO_MODULES[article.slug] || [];
            const relatedModules = relatedModuleSlugs
              .map(s => MODULE_CATALOG.find(m => m.slug === s))
              .filter(Boolean);
            if (relatedModules.length === 0) return null;
            return (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4" data-testid="text-related-modules">
                  {lang === "fr" ? "Fonctionnalités associées" : "Related Features"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedModules.map((m) => (
                    <Link key={m!.slug} href={`/fonctionnalites/${m!.slug}`}>
                      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-blog-module-${m!.slug}`}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-1">{lang === "fr" ? m!.titleFr : m!.titleEn}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{lang === "fr" ? m!.subtitleFr : m!.subtitleEn}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}
        </article>
      </main>
    </div>
  );
}

export default function Blog() {
  const { slug } = useParams<{ slug: string }>();
  if (slug) return <BlogArticlePage />;
  return <BlogList />;
}

export { BLOG_ARTICLES };
