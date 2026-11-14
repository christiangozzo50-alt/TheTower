# The Tower

Gioco online: https://christiangozzo50-alt.github.io/TheTower/

## Come è organizzato

Il file che va online è `index.html`, ma **non va modificato a mano**: è generato unendo i pezzi in `src/`.

```
src/pagina.html          la pagina (HTML)
src/stile.css            lo stile
src/js/01-base-salvataggi.js ... 22-carte.js   il codice del gioco, un file per argomento
src/js/99-avvio.js       fa partire il gioco
build.py                 unisce tutto in index.html
```

I file in `src/js/` vengono uniti in ordine di nome dentro un'unica funzione,
quindi vedono tutti le stesse variabili, come prima quando era un file solo.

## Fare una modifica

1. Modifica il file giusto in `src/` (per esempio le carte potenziamento sono in `src/js/22-carte.js` e `src/js/03-dati-gioco.js`).
2. Lancia `python3 build.py --rilascio` (rigenera `index.html` e cambia il numero di versione, così le app installate si aggiornano da sole).
3. Carica `index.html` (e i file cambiati in `src/`) sul repository.
