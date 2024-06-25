// require("dotenv").config();

let WALLET_CONNECTED = "";
let contractAddress = "0x3DcE32d72Bf2696Fd1dE080Ad11b5fe4B2ea4A6d";
// let contractAddress = process.env.CONTRACT_ADDRESS;
let contractAbi = [
    {
        inputs: [
            {
                internalType: "string[]",
                name: "_candidateNames",
                type: "string[]",
            },
            {
                internalType: "uint256",
                name: "_durationInMinutes",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_name",
                type: "string",
            },
        ],
        name: "addCandidate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "candidates",
        outputs: [
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "voteCount",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getAllVotesOfCandiates",
        outputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "uint256",
                        name: "voteCount",
                        type: "uint256",
                    },
                ],
                internalType: "struct Voting.Candidate[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getRemainingTime",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_candidateIndex",
                type: "uint256",
            },
        ],
        name: "getVotesOfCandiate",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getVotingStatus",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_candidateIndex",
                type: "uint256",
            },
        ],
        name: "vote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "voters",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "votingEnd",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "votingStart",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];

const connectMetamask = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    WALLET_CONNECTED = await signer.getAddress();
    var element = document.getElementById("metamasknotification");
    element.innerHTML = "Metamask telah terhubung: " + WALLET_CONNECTED;
};

const addVote = async () => {
    if (WALLET_CONNECTED != 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);

        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

        const candidateIndexInput = document.getElementById("vote");
        const candidateIndex = parseInt(candidateIndexInput.value);
        const totalCandidates = await contractInstance.getAllVotesOfCandiates();

        var cand = document.getElementById("cand");
        if (isNaN(candidateIndex) || candidateIndex < 0 || candidateIndex >= totalCandidates.length) {
            cand.innerHTML = "Indeks kandidat tidak valid.";
            return;
        }

        cand.innerHTML = "Mohon tunggu, sedang menambahkan vote ke dalam kontrak pintar";

        try {
            const status = await contractInstance.getVotingStatus();
            if (!status) {
                cand.innerHTML = "Waktu voting telah selesai.";
                return;
            }

            const tx = await contractInstance.vote(candidateIndex);
            await tx.wait();
            cand.innerHTML = "Vote berhasil diberikan !!!";
        } catch (error) {
            console.error(error);
            console.error(error);
            const errorMessage = error.data.data && error.data.data.reason ? error.data.data.reason : error.message;

            if (errorMessage.includes("You have already voted")) {
                cand.innerHTML = "Anda sudah memberikan suara.";
            } else {
                console.log(error);
                cand.innerHTML = "Gagal memberikan suara.";
            }
        }
    } else {
        var cand = document.getElementById("cand");
        cand.innerHTML = "Hubungkan akun ke metamask terlebih dahulu";
    }
};

const voteStatus = async () => {
    if (WALLET_CONNECTED != 0) {
        var status = document.getElementById("status");
        var remainingTime = document.getElementById("time");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const currentStatus = await contractInstance.getVotingStatus();
        const time = await contractInstance.getRemainingTime();
        console.log(time);
        status.innerHTML = currentStatus == 1 ? "Waktu voting masih terbuka" : "Waktu voting telah selesai";

        const totalSeconds = parseInt(time, 16);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        remainingTime.innerHTML = currentStatus == 1 ? `Sisa waktu voting adalah ${hours} jam, ${minutes} menit dan ${seconds} detik` : "";
    } else {
        var status = document.getElementById("status");
        status.innerHTML = "Hubungkan akun ke metamask terlebih dahulu";
    }
};

const getAllCandidates = async () => {
    if (WALLET_CONNECTED != 0) {
        var p3 = document.getElementById("p3");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        p3.innerHTML = "Please wait, getting all the candidates from the voting smart contract";
        var candidates = await contractInstance.getAllVotesOfCandiates();
        console.log(candidates);
        var table = document.getElementById("myTable");

        for (let i = 0; i < candidates.length; i++) {
            var row = table.insertRow();
            var idCell = row.insertCell();
            var descCell = row.insertCell();
            var statusCell = row.insertCell();

            idCell.innerHTML = i;
            descCell.innerHTML = candidates[i].name;
            statusCell.innerHTML = candidates[i].voteCount;
        }

        // p3.innerHTML = "The tasks are updated";
        p3.innerHTML = "";
    } else {
        var p3 = document.getElementById("p3");
        p3.innerHTML = "Hubungkan akun ke metamask terlebih dahulu";
    }
};

async function addCandidate() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    const candidateName = document.getElementById("candidateName").value;

    try {
        if (candidateName == "") {
            alert("Isi nama kandidat terlebih dahulu");
            return;
        }

        const status = await contractInstance.getVotingStatus();
        if (!status) {
            alert("Waktu voting telah selesai");
            return;
        }

        const tx = await contract.addCandidate(candidateName);
        await tx.wait();
        alert("Kandidat telah berhasil ditambahkan");
    } catch (error) {
        console.error(error);
        if (error.message.includes("user rejected transaction")) {
            alert("Transaksi dibatalkan");
        } else {
            alert("Hanya pemilik kontrak yang bisa menambahkan kandidat");
        }
    }
}
