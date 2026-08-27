# Sergiu — Mecanic Iveco (Iași)

Site de prezentare pentru atelierul lui Sergiu: Iveco Daily 2.3 și 3.0, an 2012 sau
mai nou. O singură pagină statică, fără build și fără dependențe externe.

```
index.html            structura paginii (doar HTML)
css/style.css         tot stilul: culori, layout, animatii CSS
js/main.js            tot codul: CONFIG, scenele SVG, galeria, formularele
vendor/anime.min.js   biblioteca de animatie (locala, merge si fara internet)
galerie/1..6.jpg      pozele din galerie (demo — de inlocuit)
```

## Ce modifici cel mai des

### Telefon, e-mail, adresă

Toate datele de contact stau într-un singur loc, la începutul lui `js/main.js`,
în blocul `CONFIG`:

```js
const CONFIG = {
  phone:     '0759 838 748',        // cum se afiseaza pe pagina
  phoneDial: '+40759838748',        // pentru butonul de sunat
  whatsapp:  '40759838748',         // numarul de WhatsApp, fara + si fara spatii
  email:     'contact@sergiu-iveco.ro',
  address:   'Iași — adresa exactă la telefon'
};
```

Schimbi aici și se actualizează peste tot: antet, subsol, butonul verde de WhatsApp
și cele două formulare.

### Pozele din galerie

Înlocuiești fișierele din `galerie/` (`1.jpg` … `6.jpg`) cu pozele tale, păstrând
aceleași nume. Ideal 1200×900 px (raport 4:3). Titlurile de sub fiecare poză se
schimbă în `index.html`, în secțiunea `<!-- GALERIE -->`, la `<figcaption>`.

## Cum ajung programările

Formularul de programare și cel de recenzie deschid WhatsApp-ul clientului cu
mesajul deja scris către numărul din `CONFIG.whatsapp`. Clientul apasă *Trimite*,
iar mesajul intră normal în WhatsApp-ul atelierului. Nu e nevoie de server.

Recenziile scrise de clienți se salvează în browserul lor (localStorage) ca să le
vadă imediat pe pagină, și îți ajung pe WhatsApp ca să le poți adăuga permanent în
cod dacă vrei să le vadă toată lumea.

## Rulare locală

Orice server static merge. Din folderul proiectului:

```bash
python -m http.server 5599
```

Apoi deschizi <http://localhost:5599>.

## Publicare (Vercel)

Site static, fără build. În Vercel: *Add New → Project*, imporți repo-ul de pe
GitHub și lași setările implicite (Framework: *Other*, fără Build Command, Output
Directory: rădăcina). Fiecare `git push` pe `main` redeployează automat.
