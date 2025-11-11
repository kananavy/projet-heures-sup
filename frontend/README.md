# 🎓 Gestion des Heures d'Enseignement - Version Moderne

## 📋 Description

Système moderne de gestion des heures d'enseignement universitaire avec interface utilisateur modernisée, développé avec React et Vite.

### ✨ Nouvelles fonctionnalités (v2.0)

- **Interface moderne** : Design system complet avec couleurs cohérentes
- **Navigation intuitive** : Onglets organisés par fonctionnalité
- **Responsive design** : Optimisé pour tous les écrans
- **Notifications en temps réel** : Feedback utilisateur amélioré
- **Statistiques visuelles** : Cartes statistiques interactives
- **Import Excel amélioré** : Interface de mappage des colonnes
- **Animations fluides** : Transitions et micro-interactions
- **Thème professionnel** : Couleurs et typographie optimisées

## 🚀 Installation

### Prérequis
- Node.js 16+ 
- npm ou yarn
- Serveur backend Laravel (API)

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone [url-du-repo]
cd modern-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration**
Créer un fichier `.env` :
```env
VITE_API_BASE=http://localhost:8080/api
```

4. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Structure du projet

```
modern-app/
├── src/
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants UI réutilisables
│   │   ├── TeacherForm.jsx
│   │   ├── TeacherList.jsx
│   │   ├── CourseForm.jsx
│   │   ├── ImportPanel.jsx
│   │   └── ...
│   ├── config/             # Configuration
│   │   └── api.js          # Configuration Axios
│   ├── hooks/              # Hooks personnalisés
│   │   └── useNotifications.js
│   ├── App.jsx             # Composant principal
│   ├── main.jsx           # Point d'entrée
│   └── index.css          # Styles globaux
├── public/                 # Assets statiques
├── package.json
└── vite.config.js
```

## 🎨 Design System

### Palette de couleurs
- **Primary** : Bleu (#3b82f6)
- **Success** : Vert (#10b981) 
- **Warning** : Orange (#f59e0b)
- **Error** : Rouge (#ef4444)
- **Gray** : Échelle de gris complète

### Composants disponibles
- **Cards** : `.modern-card` avec header/body/footer
- **Boutons** : `.btn` avec variantes (primary, success, outline, etc.)
- **Formulaires** : `.form-input`, `.form-select` avec validation
- **Tables** : `.table` responsive avec tri
- **Badges** : `.badge` avec types de couleurs
- **Stats Cards** : Cartes statistiques animées

## 📱 Fonctionnalités

### 1. Vue d'ensemble
- Statistiques globales en temps réel
- Actions rapides (ajout enseignant/cours)
- Indicateurs visuels colorés

### 2. Gestion des enseignants  
- Liste avec recherche et tri
- Formulaire d'ajout avec validation
- Modal de détails avec historique des cours
- Suppression avec confirmation

### 3. Ajout de cours
- Formulaire intuitif avec sélection d'enseignant
- Types de cours préconfigurés
- Calcul automatique des heures supplémentaires
- Validation des données

### 4. Importation Excel
- Interface de mappage des colonnes
- Aperçu des données avant import
- Support .xls et .xlsx
- Création automatique des enseignants manquants
- Rapport d'importation détaillé

## 🔧 Configuration API

L'application communique avec une API Laravel. Configuration dans `src/config/api.js` :

### Endpoints requis
```
GET    /enseignants              # Liste des enseignants
POST   /enseignants              # Créer enseignant
GET    /enseignants/{id}         # Détails enseignant
DELETE /enseignants/{id}         # Supprimer enseignant

GET    /cours/enseignant/{id}    # Cours d'un enseignant
POST   /enseignants/{id}/cours   # Ajouter cours
DELETE /cours/{id}               # Supprimer cours

POST   /import/teachers/preview  # Aperçu import enseignants
POST   /import/teachers          # Import enseignants
POST   /import/courses/preview   # Aperçu import cours  
POST   /import/courses           # Import cours
```

## 🎯 Utilisation

### Démarrage rapide
1. Ajouter des enseignants via l'onglet "Enseignants"
2. Créer des cours via l'onglet "Cours"
3. Consulter les statistiques dans "Vue d'ensemble"
4. Importer des données Excel via "Importation"

### Import Excel
1. Sélectionner le type (Enseignants ou Cours)
2. Choisir le fichier Excel
3. Mapper les colonnes avec l'interface
4. Confirmer l'import

### Format Excel recommandé

**Enseignants :**
```
Nom | Mention | Parcours | Niveau | UE | EC | Volume
```

**Cours :**
```
Type | Date | Heure_debut | Heure_fin | Mention | Parcours | Enseignant | Durée
```

## 🔧 Développement

### Commandes disponibles
```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Aperçu du build
npm run lint     # Vérification du code
```

### Personnalisation
- **Couleurs** : Modifier les variables CSS dans `src/index.css`
- **Components** : Étendre les composants dans `src/components/ui/`
- **API** : Adapter `src/config/api.js` pour votre backend

## 📦 Build et déploiement

### Build de production
```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`.

### Déploiement
1. Serveur web (Apache, Nginx)
2. Platforms (Vercel, Netlify)
3. CDN

Configurer la variable `VITE_API_BASE` pour pointer vers votre API de production.

## 🐛 Résolution de problèmes

### Problèmes courants
- **CORS** : Configurer les headers dans votre API Laravel
- **API inaccessible** : Vérifier `VITE_API_BASE` dans `.env`
- **Import Excel échoue** : Vérifier le format et les permissions

### Support
- Vérifier la console navigateur pour les erreurs
- Tester les endpoints API avec Postman
- Consulter les logs du serveur backend

## 👨‍💻 Développeur

**Florent** - Développeur Full Stack  
Spécialisé Laravel & React - Madagascar

---

© 2025 - Système de Gestion des Heures d'Enseignement v2.0