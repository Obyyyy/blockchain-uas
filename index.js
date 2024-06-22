require("dotenv").config();
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
app.use(
    fileUpload({
        extended: true,
    })
);
app.use(express.static(__dirname));
app.use(express.json());
const path = require("path");
const ethers = require("ethers");

var port = 3000;

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const { abi } = require("./artifacts/contracts/Voting.sol/Voting.json");
const provider = new ethers.providers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// app.post("/addCandidate", async (req, res) => {
//     var vote = req.body.vote;
//     console.log(vote);

//     async function storeDataInBlockchain(vote) {
//         console.log("Menambahkan kandidat ke voting contract...");
//         const tx = await contractInstance.addCandidate(vote);
//         await tx.wait();
//     }

//     const bool = await contractInstance.getVotingStatus();
//     const owner = await contractInstance.getOwner();
//     const signerAddress = await signer.getAddress();
//     console.log(`Signer Address: ${signerAddress}`);
//     console.log(`Contract Owner: ${owner}`);

//     if (bool == true) {
//         if (signerAddress.toLowerCase() === owner.toLowerCase()) {
//             await storeDataInBlockchain(vote);
//             res.send("Kandidat telah berhasil ditambahkan");
//         } else {
//             res.send("Hanya pemilik kontrak yang bisa menambahkan kandidat");
//         }
//     } else {
//         res.send("Waktu Voting telah selesai");
//     }
// });

// Function to print contract owner address on server start

async function printContractOwner() {
    const owner = await contractInstance.getOwner();
    console.log(`Contract Owner Address: ${owner}`);
}

// Call the function to print the contract owner address
printContractOwner().catch(console.error);

app.listen(port, function () {
    console.log("App is listening on port 3000");
});
