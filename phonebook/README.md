# Programmierung für Kurzwahlliste (Phonebook)

1. Lade [ScriptCommunicator](https://sourceforge.net/projects/scriptcommunicator/) herunter und entpacke es nach Wahl.

2. Lade das Script und die Programmierdatei herunter, dazu: navigiere zum [Repository opentetra/scripting](https://github.com/opentetra/scripting) und lade dort als .zip herunter "Clone or Download"
- Die Datei ``kurzwahlprog.txt`` nach Wunsch anpassen.

3. Starte Script Communicator

4. In SC: "Settings" -> Stelle den Port ein und Baudrate. Außerdem unter "Console Options", "send on enter key" = CR. Aus den Einstellungen raus und "Connect". 

5. Teste die Verbindung: kopiere `at<|#CR#|>` unten in das obere Send-Feld und "Send". Darüber im großen Bereich sollte `at` und dann `OK` erscheinen. Gerät reagiert!

6. Öffne "Scripts". Wähle "Script"->"Add Worker Script". Wähle nun das Skript (`sendATCmdByLine.js`) , was du in Schritt 2 heruntergeladen hast. Wähle es in der Tabelle aus und "Start".

7. Im Dialog mittels "Open File" die Programmierdatei auswählen, ein Beispiel dazu hast du ebenfalls in Schritt 2 geladen (`kurzwahlprog.txt`).

8. "Send File" und auf Abschluss warten!
