document.getElementById('read-nfc').addEventListener('click', async () => {
    try {
        if ('NFC' in window) {
            const nfc = new NDEFReader();
            await nfc.scan();
            console.log("NFC scan started successfully.");

            nfc.onreading = event => {
                const message = event.message;
                let output = "National ID Data:\n";
                
                for (const record of message.records) {
                    output += `Record Type: ${record.recordType}\n`;
                    output += `MIME Type: ${record.mediaType || "N/A"}\n`;
                    output += `Data: ${new TextDecoder().decode(record.data)}\n`;
                }
                document.getElementById('nfc-output').innerText = output;
            };
        } else {
            alert("NFC is not supported on this device.");
        }
    } catch (error) {
        console.error("Error reading NFC tag:", error);
    }
});

function handleNFCTap(serial) {
    const status = document.getElementById("nfcStatus");
    const message = document.getElementById("clockMessage");
    status.textContent = `Detected NFC: ${serial}`;
    
    let staffData = JSON.parse(localStorage.getItem("staffData")) || {};
    let clockHistory = JSON.parse(localStorage.getItem("clockHistory")) || {};
    
    for (let id in staffData) {
        if (staffData[id].nfc === serial) {
            const staffId = id;
            const now = new Date().toLocaleString();
            
            if (!clockHistory[staffId]) clockHistory[staffId] = [];
            const lastEntry = clockHistory[staffId][clockHistory[staffId].length - 1];
            
            if (lastEntry && !lastEntry.clockOut) {
                lastEntry.clockOut = now;
                message.textContent = `${staffData[id].name} clocked out at ${now}`;
            } else {
                clockHistory[staffId].push({ clockIn: now, clockOut: null });
                message.textContent = `${staffData[id].name} clocked in at ${now}`;
            }
            
            localStorage.setItem("clockHistory", JSON.stringify(clockHistory));
            return;
        }
    }
    message.textContent = "Staff not found for this NFC card";
}

function adminLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    if (username === "Admin" && password === "Passcode") {
        document.getElementById("loginPage").classList.remove("active");
        document.getElementById("adminPanel").classList.add("active");
    } else {
        alert("Invalid credentials");
    }
}

function logout() {
    document.getElementById("adminPanel").classList.remove("active");
    document.getElementById("loginPage").classList.add("active");
}

function addStaff() {
    const name = document.getElementById("staffName").value;
    const nfc = document.getElementById("staffNFC").value;
    
    if (name && nfc) {
        let staffData = JSON.parse(localStorage.getItem("staffData")) || {};
        const staffId = Date.now().toString();
        staffData[staffId] = { name, nfc };
        localStorage.setItem("staffData", JSON.stringify(staffData));
        alert("Staff added successfully");
        document.getElementById("staffName").value = "";
        document.getElementById("staffNFC").value = "";
    } else {
        alert("Please fill all fields");
    }
}

function searchHistory() {
    const search = document.getElementById("searchStaff").value.toLowerCase();
    const output = document.getElementById("historyOutput");
    const staffData = JSON.parse(localStorage.getItem("staffData")) || {};
    const clockHistory = JSON.parse(localStorage.getItem("clockHistory")) || {};
    
    output.innerHTML = "";
    for (let id in staffData) {
        if (staffData[id].name.toLowerCase().includes(search) || staffData[id].nfc.includes(search)) {
            output.innerHTML += `<h3>${staffData[id].name} (NFC: ${staffData[id].nfc})</h3>`;
            if (clockHistory[id]) {
                clockHistory[id].forEach(entry => {
                    output.innerHTML += `<p>Clock In: ${entry.clockIn} - Clock Out: ${entry.clockOut || "Pending"}</p>`;
                });
            }
        }
    }
}

setInterval(() => {
    const nfcSerials = ["NFC123", "NFC456", "NFC789"];
    const randomSerial = nfcSerials[Math.floor(Math.random() * nfcSerials.length)];
    handleNFCTap(randomSerial);
}, 5000);
