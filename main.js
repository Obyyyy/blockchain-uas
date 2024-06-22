// require("dotenv").config();

let WALLET_CONNECTED = "";
// let contractAddress = "0x2F012Efe614512C67b6312E55F1B145d41194249";
let contractAddress = "0x4d4dDAB8B1AdAdf010e5DaC69AC012093B7b117a";
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
        var name = document.getElementById("vote");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        var cand = document.getElementById("cand");
        cand.innerHTML = "Please wait, adding a vote in the smart contract";
        const tx = await contractInstance.vote(name.value);
        await tx.wait();
        cand.innerHTML = "Vote added !!!";
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

        remainingTime.innerHTML = `Sisa waktu voting adalah ${hours} jam, ${minutes} menit dan ${seconds} detik, ${totalSeconds}`;
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
        const tx = await contract.addCandidate(candidateName);
        await tx.wait();
        alert("Kandidat telah berhasil ditambahkan");
    } catch (error) {
        console.error(error);
        alert("Hanya pemilik kontrak yang bisa menambahkan kandidat");
    }
}
