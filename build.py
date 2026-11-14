#!/usr/bin/env python3
"""Costruisce index.html (il file che va online) unendo i pezzi in src/.

  python3 build.py            -> rigenera index.html
  python3 build.py --rilascio -> rigenera e cambia BUILD_ID, così i telefoni si aggiornano da soli

Non modificare index.html a mano: modifica i file in src/ e rilancia questo script.
- src/pagina.html  la pagina (HTML) con due segnaposto: /*@STILE@*/ e /*@CODICE@*/
- src/stile.css    tutto lo stile
- src/js/*.js      il codice del gioco, diviso per argomento; i file vengono uniti in ordine di nome
                   (01-, 02-, ...) dentro un'unica funzione, quindi vedono tutti le stesse variabili.
"""
import os, re, sys, time
R = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(R, 'src')

def leggi(p):
    with open(p, encoding='utf-8') as f: return f.read()

def costruisci(rilascio=False):
    pagina = leggi(os.path.join(S, 'pagina.html'))
    stile = leggi(os.path.join(S, 'stile.css')).rstrip('\n')
    js_dir = os.path.join(S, 'js')
    files = sorted(f for f in os.listdir(js_dir) if f.endswith('.js'))
    codice = ''.join(leggi(os.path.join(js_dir, f)) for f in files).rstrip('\n')
    if rilascio:
        codice, n = re.subn(r"const BUILD_ID='\d+'", "const BUILD_ID='%d'" % int(time.time()), codice)
        assert n == 1, 'BUILD_ID non trovato'
        # il nuovo BUILD_ID va salvato anche nel file sorgente
        for f in files:
            p = os.path.join(js_dir, f); t = leggi(p)
            if "const BUILD_ID='" in t:
                t = re.sub(r"const BUILD_ID='\d+'", re.search(r"const BUILD_ID='\d+'", codice).group(0), t)
                with open(p, 'w', encoding='utf-8') as fh: fh.write(t)
    assert pagina.count('/*@STILE@*/') == 1 and pagina.count('/*@CODICE@*/') == 1
    out = pagina.replace('/*@STILE@*/', stile).replace('/*@CODICE@*/', codice)
    with open(os.path.join(R, 'index.html'), 'w', encoding='utf-8') as f: f.write(out)
    print('index.html pronto: %d file js, %d righe' % (len(files), out.count('\n') + 1))

if __name__ == '__main__':
    costruisci('--rilascio' in sys.argv)
