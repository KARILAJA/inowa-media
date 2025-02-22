const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

function showBanner() {
    console.log('\n\x1b[37m' + `
                      🚀 AirdropInsiders 🚀                      
                                                                 
              Join us: https://t.me/AirdropInsiderID            
  ` + '\x1b[0m\n');
}

function readInviteCodes() {
    const data = fs.readFileSync('code.txt', 'utf8');
    return data.split('\n').filter(code => code.trim() !== '');
}

function generateRandomData(inviteCode) {
    const randomString = Math.random().toString(36).substring(7);
    return {
        name: `user_${randomString}`,
        email: `user_${randomString}@google.com`,
        password: `Password${randomString}`,
        ref: inviteCode,
        screenResolution: "2560x1440",
        timezone: "Asia/Jakarta",
        language: "en-US"
    };
}

async function registerAccount(data) {
    try {
        const response = await axios.post('https://inowa.media/api/reg', data, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `ref=${data.ref}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during registration:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function mintAccount(token, ref) {
    try {
        const response = await axios.post(
            'https://inowa.media/api/mint',
            { act: "go", ref: ref }, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
                    'Cookie': `ref=${ref}; token=${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error during mint:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function main() {
    showBanner(); 

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the number of accounts to create: ', async (count) => {
        const inviteCodes = readInviteCodes();
        if (inviteCodes.length === 0) {
            console.error('No invite codes found in code.txt');
            rl.close();
            return;
        }

        for (let i = 0; i < count; i++) {
            const inviteCode = inviteCodes[i % inviteCodes.length]; 
            const inviteLink = `https://inowa.media/${inviteCode}`; 
            console.log(`\nUsing invite link: ${inviteLink}`);

            const randomData = generateRandomData(inviteCode);
            console.log(`Creating account ${i + 1} with data:`, randomData);

            const registrationResult = await registerAccount(randomData);
            if (registrationResult && registrationResult.token) {
                console.log(`✅ Registration successful for account ${i + 1}:`, registrationResult.user);

                const mintResult = await mintAccount(registrationResult.token, randomData.ref);
                if (mintResult && mintResult.mintStep === 1) {
                    console.log(`✅ Mint successful for account ${i + 1}:`, mintResult);
                } else {
                    console.log(`❌ Mint failed for account ${i + 1}`);
                }
            } else {
                console.log(`❌ Registration failed for account ${i + 1}`);
            }
        }

        rl.close();
    });
}

main();
