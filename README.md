# ClickFast

![CI](https://github.com/Saar45/clickfast/actions/workflows/ci.yml/badge.svg)

Un petit jeu de clics : clique le plus vite possible avant la fin du chrono (10 secondes).
Site 100 % statique (HTML/CSS/JS), zéro dépendance, servi par nginx dans un conteneur Docker,
testé et buildé automatiquement par **GitHub Actions** à chaque push.

## Lancer le projet

Avec Docker :

```bash
docker build -t clickfast .
docker run -d -p 8088:80 clickfast
# puis ouvrir http://localhost:8088
```

Sans Docker : ouvrir `public/index.html` dans un navigateur, c'est tout.

## Les tests

La logique du jeu (compteur, chrono, record) vit dans `public/game.js`, sans DOM,
et se teste avec le runner intégré de Node :

```bash
npm test   # node --test, 10 tests
```

## La pipeline

`.github/workflows/ci.yml`, déclenchée à chaque push sur toutes les branches :

1. **test** : checkout, Node 22, `npm test` — si un test casse, tout s'arrête là.
2. **build** (`needs: test`) : build de l'image `clickfast:<sha du commit>`, puis
   smoke test — le conteneur démarre dans le runner et `curl` vérifie que la page
   et `game.js` répondent vraiment.

L'image n'est jamais construite si les tests sont rouges : fail fast.

## Journal de bord

**Les tests** : 10 tests sur la logique pure (clic avant départ refusé, clic après la
fin refusé, frontière exacte de fin de partie à 10 000 ms, temps restant jamais négatif,
arrondi des clics/s, record). Accroc : `node --test tests/` échoue avec
`Cannot find module .../tests` — ce runner ne prend pas un dossier en argument ici ;
`node --test` tout court fait la découverte automatique des `*.test.js`.

**Le Dockerfile** : `nginx:1.27.3-alpine` épinglé, seule `public/` est copiée → image
de **76,9 Mo**, contexte de build de 6 ko grâce au `.dockerignore` (ni tests, ni
package.json, ni `.git` dans l'image, vérifié par `ls` dans le conteneur).

**La première pipeline verte** : passée du premier coup — `test` en **5 s**, `build`
en **12 s**, **32 s** au total du push au voyant vert, très loin sous le budget des
dix minutes. Le `${{ github.sha }}` comme tag d'image rend chaque build traçable
jusqu'au commit exact. À noter : GitHub signale que `actions/checkout@v4` et
`setup-node@v4` ciblent Node 20, déprécié sur les runners — la pipeline reste verte,
mais c'est un exemple concret de l'entretien qu'une pipeline demande (passage en
`@v5` à prévoir).

**La preuve que la pipeline bloque** : sur une branche `demo/test-casse`, la garde
`isRunning` a été volontairement retirée de `click()` — un clic après la fin du chrono
était compté. En local, `npm test` attrape le bug (`✖ un clic après la fin ne compte
pas`, 9 pass / 1 fail). Poussé sur la branche, le résultat côté GitHub Actions :
`test : failure`, **`build : skipped`** — le job de build ne s'est jamais lancé,
l'image cassée n'a jamais existé. C'est exactement le contrat « fail fast » : la
pipeline ne protège pas en réparant, elle protège en refusant d'aller plus loin.
Branche supprimée après la démo, `main` n'a jamais vu le bug.
