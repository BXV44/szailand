# 🎫 SzailandBot V2 — Tickets + Welcome + Ping Aléatoire

discord.gg/szailand

---

## 🚀 Mise en ligne Railway via GitHub

```bash
git init && git add . && git commit -m "🎫 SzailandBot V2" && git branch -M main && git remote add origin https://github.com/BXV44/szailandd.git && git push -u origin main
```

Variables Railway à ajouter :
| Clé | Valeur |
|-----|--------|
| `TOKEN` | Token de ton bot Discord |
| `CLIENT_ID` | ID de l'application |

---

## ⚙️ Configuration

### 1. Déployer les slash commands (une fois en local)
```bash
node deploy-commands.js
```

### 2. Configurer le Welcome
```
/setwelcome setup salon:#bienvenue gif:https://cdn.discordapp.com/attachments/.../tenor.gif
```
Variables disponibles dans le message : `{user}` `{username}` `{server}` `{count}` `{tag}`

Pour tester : `/setwelcome test`

### 3. Configurer le Ping Aléatoire (quand quelqu'un rejoint)
```
/setpingchannels add salon:#général
/setpingchannels add salon:#discussion
/setpingchannels add salon:#off-topic
```
→ Quand quelqu'un rejoint, le bot envoie un message dans **un de ces salons au hasard**.

### 4. Configurer les Tickets
```
/setupticket panel salon:#tickets category:📩 Tickets support:@Support gif:URL_DU_GIF
```

---

## 📋 Commandes

### 🎫 Tickets
| Commande | Description |
|----------|-------------|
| `/setupticket panel` | Créer le panel avec menu de catégories |
| `/setupticket info` | Voir la config |
| `/setupticket disable` | Désactiver |

**Catégories disponibles dans le panel :**
- ❓ Support Général
- 🐛 Report de Bug
- 💡 Suggestion
- 🤝 Partenariat
- 🔨 Report
- 💰 Achat/Commande

**Boutons dans chaque ticket :**
- `🔒 Fermer` — Ferme le ticket (auteur ou support)
- `✋ Claim` — Support prend en charge
- `🗑️ Supprimer` — Supprime définitivement (support only)

### 👋 Welcome
| Commande | Description |
|----------|-------------|
| `/setwelcome setup` | Configurer salon, message, gif, couleur, autorole |
| `/setwelcome test` | Tester le message en live |
| `/setwelcome info` | Voir la config actuelle |
| `/setwelcome disable` | Désactiver |

### 🎲 Ping Aléatoire
| Commande | Description |
|----------|-------------|
| `/setpingchannels add` | Ajouter un salon |
| `/setpingchannels remove` | Retirer un salon |
| `/setpingchannels list` | Voir la liste |
| `/setpingchannels clear` | Vider la liste |

---

## 🖼️ Ajouter un GIF

Exemple avec ton GIF :
```
/setwelcome setup salon:#bienvenue gif:https://cdn.discordapp.com/attachments/1507726296220700902/1507930432694648873/tenor.gif
```

Pour le panel tickets :
```
/setupticket panel salon:#tickets category:📩Tickets support:@Support gif:https://cdn.discordapp.com/.../tenor.gif
```

---

*discord.gg/szailand*
