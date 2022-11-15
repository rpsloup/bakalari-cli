# Bakaláři CLI

## Nutné aplikace

* `git` - pro naklonování repozitáře
* `node` - pro JS runtime
* `yarn` (preferovaný) nebo `npm` - package manager

## Instalace

Jako první naklonuj repo aplikace, a to pomocí příkazu `git clone`. Dále jdi dovnitř nově vzniklé složky.
```
git clone https://github.com/rpsloup/bakalari-cli.git
cd bakalari-cli
```

Až se budeš v nově vzniklé složce, nainstaluj balíčky pomocí svého package manageru.
```
npm i
```
Pro uživatele `yarn` stačí spustit stejnojmenný příkaz -
```
yarn
```

## Spouštění

Po instalaci ti stačí jen spustit příkaz pro spuštění nainstalované aplikace.
```
npm start
```
Uživatelé `yarn` musí spustit prakticky stejný příkaz -
```
yarn start
```

## Použití

Po spuštění aplikace ti budou položeny 3 dotazy. Jaké je URL tvé školy pro systém Bakaláři, tvé uživatelské jméno a tvé heslo.
Tato data **nejsou nikde ukládána**, slouží *pouze pro tvorbu requestu* na samotné API. Po správném vyplnění musíš počkat několik
vteřin na odpověď serveru. Pokud se login povedl, uvidíš prompt v ukázaném formátu. Tvoje URL systému Bakaláři a uživatelské jméno se
uloží do souboru `/data/auth.json`, abys tyto informace příště nemusel zadávat znovu. Složku lze vymazat manuálně nebo příkazem `rmcache`.

```
Bakaláři CLI

Enter the Bakaláři URL
> https://bakalari.skola.cz
Enter your username
> Jan25714
Enter your password
> ********

Successfully logged in.

[Jan25714@bakalari]$
```

Zde už jen píšeš příkazy, které najdeš hned v další sekci tohoto manuálu. V případě nesprávného loginu se ti zobrazí tato hláška -
```
Login failed.
```

## Příkazy

* `teachers` - vypíše všechny učitele obsáhlé ve stálém rozvrhu
* `marks` - vypíše celkové průměry ze všech předmětů
  * `marks PMT` - vypíše známky s jejich váhami podle zkratky předmětu
  * `marks PMT -m` - nevypíše název předmětu a celkový průměr z něj
* `timetable` - vypíše aktuální rozvrh, platný pro momentální týden
  * `-n` - vypíše rozvrh pro další týden
  * `-m` - nevypíše názvy dnů a čísla hodin
  * `-s` - zmenší mezery mezi řádky a sloupci
* `hours` - vypíše časové rozmezí jednotlivých hodin
* `absence` - vypíše absenci v jednotlivých hodinách
  * `-m` - minimalistický výpis
* `rmcache` - vymaže složku `/data`, kde jsou uloženy přihlašovací informace
* `exit` - ukončí aplikaci

Některé příkazy podporují i možnosti, které upravují chování zvoleného příkazu. Lze je přidat pomocí pomlčky, a to více možnostmi,
podobně jako u normálních shellů -

```
prikaz -abc
prikaz -a -b -c
prikaz -c -ba
```

Každou z těchto variant považuje aplikace za stejnou. Je možné používat více možností najednou.
