
/*************************************************************************
SPDX-License-Identifier: MIT

Based on the sendFile Example from ScriptCommunicator
***************************************************************************/
const VERSIONINFO = 'Send AT Commands Line-by-line Ver 0.1';

var linesToSend = [];
var sentUntil = -1;
var processing = false;
var recO = false;
var recOK = false;

var canSend = true;

var timer = scriptThread.createTimer();
const TIMERNORMALINTERVAL = 1000;
timer.setInterval(TIMERNORMALINTERVAL); // effectively the timeout
timer.timeoutSignal.connect(timerSlot);

function timerSlot() {
    if (!canSend) {
        scriptThread.messageBox("Critical", "Error", "Timeout waiting for OK reply. Cannot send.");
        processing = false;
        timer.stop();
    }

    if (!processing) return;

    if (linesToSend.length - 1 >= sentUntil + 1) {

        send(linesToSend[sentUntil + 1]);
        sentUntil++;
        UI_SendFileProgressBar.setValue(sentUntil + 1); // progressbar Counts Lines
    } else {
        processing = false;
        UI_InformationLabel.setText("finished. Sent " + (sentUntil + 1) + " lines !");
        scriptThread.messageBox("Information", "title", "finished. Sent " + (sentUntil + 1) + " lines !");
    }

    if (processing)
        timer.setInterval(TIMERNORMALINTERVAL);
}

function stopScript() {
    scriptThread.appendTextToConsole("script send file stopped");
}

function startProcessing() {
    processing = true;
    canSend = true;
    timer.start();
}

//The dialog is closed.
function dialogFinished(e) {
    scriptThread.stopScript()
}

function send(data) {
    var sender = this;
    if (!scriptInf.sendString(data + "\r")) {
        processing = false;
        scriptThread.messageBox("Critical", "Error", "Sending failed. Check if ScriptCommunicator is connected.");
    }
    canSend = false; // wait for reply first
}

function sendFilePushButtonClickedSlot() {
    if (scriptInf.isConnected()) {
        if (UI_FilePathLineEdit.text() != "") {
            UI_OpenFilePushButton.setEnabled(false);
            UI_SendFilePushButton.setEnabled(false);
            UI_SendFileProgressBar.reset();
            UI_InformationLabel.setText("read file");

            var fileSize = scriptThread.getFileSize(UI_FilePathLineEdit.text(), false);
            if (fileSize > 0) {
                var content = scriptFile.readFile(UI_FilePathLineEdit.text(), false);
                var stringArray = content.split("\n"); // \r\n for windows, but only \n for linux!

                for (var i = 0; i < stringArray.length; i++) {
                    var line = stringArray[i].trim();
                    if (line.indexOf("#") >= 0) {
                        scriptThread.appendTextToConsole("skipping comment line " + (i + 1));
                    } else if (line.length > 0) {
                        linesToSend.push(line);
                    }
                }

                scriptThread.appendTextToConsole("read " + linesToSend.length + " lines to send");
                UI_SendFileProgressBar.setMaximum(linesToSend.length);
                UI_InformationLabel.setText("file read, sending lines...");

                startProcessing();
            } else {
                UI_InformationLabel.setText("could not read file");
            }

            UI_OpenFilePushButton.setEnabled(true);
            UI_SendFilePushButton.setEnabled(true);
        }
    } else {
        scriptThread.messageBox("Critical", "error while sending", 'main interface is not connected')
        UI_SendFileDialog.raise();
    }
}

function openFilePushButtonClickedSlot() {
    var path = scriptThread.showFileDialog(false, "Open File", "", "Files (*)")
    if (path != "") {
        UI_FilePathLineEdit.setText(path);
    }
    UI_SendFileDialog.raise();
}

function resetRecState() {
    recO = false;
    recOK = false;
}

function dataReceivedSlot(data) {
    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            var byte = data[i];
            if (byte == 10) {
                // do nothing. Most likely followed by \n
            } else if (byte == 13) {
                // \r or \n, -> ok
                if (recOK) {
                    canSend = true;
                    timer.setInterval(1); // timer can go on directly
                }

                resetRecState();

            } else if (byte == 79) {
                recO = true;
            } else if (recO && byte == 75) {
                recOK = true;
            } else {
                scriptThread.appendTextToConsole("unknown data received: " + data);
            }
        }
    }
}

scriptThread.appendTextToConsole('script send file started');

//connect the dataReceivedSlot function with the dataReceivedSignal signal
scriptInf.dataReceivedSignal.connect(dataReceivedSlot);


UI_SendFileDialog.setWindowTitle(VERSIONINFO);
UI_SendFileDialog.finishedSignal.connect(dialogFinished);
UI_OpenFilePushButton.clickedSignal.connect(openFilePushButtonClickedSlot)
UI_SendFilePushButton.clickedSignal.connect(sendFilePushButtonClickedSlot)
UI_SendFileProgressBar.setRange(0, 100);
UI_SendFileProgressBar.setValue(0);



// setup done, now logic
if (scriptInf.isConnected()) {
    scriptThread.appendTextToConsole("Found Serial Port, Starting");

} else {
    scriptThread.messageBox("Critical", 'error', 'Serial Port not opened');
    scriptThread.stopScript(scriptThread);
}
