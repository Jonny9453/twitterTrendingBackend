require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const uuid = require('uuid');
const axios = require('axios');
const { TrendsModel } = require('./schema.js');
const connectDB = require('./connect.js');
// const chromedriver = require('chromedriver');

let options = new chrome.Options();
// options.addArguments("--headless", "--disable-gpu", "--no-sandbox"); // Optional for headless mode

// Create a new ChromeDriver service
// const serviceBuilder = new chrome.ServiceBuilder(chromedriver.path);
// const service = serviceBuilder.build();

// // Start the ChromeDriver service
// service.start();



// ProxyMesh Configuration
const proxyHost = process.env.PROXYHOST; 
const proxyPort = process.env.PROXYPORT; 
const proxyUsername = process.env.PROXYUSERNAME;
const proxyPassword = process.env.PROXYPASSWORD;

// Function to fetch and store Twitter trends
const fetchTrendsData = async (data) => {
    
    try {
        // Ensure the MongoDB connection is established before proceeding
        await connectDB();
        
        console.log("Fetching Twitter trends...");

        // Launch Selenium WebDriver with ProxyMesh
        const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
        const capabilities = {
            proxy: {
                proxyType: 'manual',
                httpProxy: proxyUrl,
                sslProxy: proxyUrl
            }
        };

        let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).withCapabilities(capabilities).build();
        
        await driver.get('https://x.com/i/flow/login');

        // Log in to Twitter
        await loginToTwitter(driver, data);

        // Fetch Trending Topics
        const trends = await getTrendingTopics(driver);

        // Capture end time and IP address
        const endTime = new Date().toISOString();
        const ipAddress = await getIpAddress();

        // Save trends to MongoDB
        await saveTrendsToDatabase(trends, endTime, ipAddress);

        // Close the browser
        await driver.quit();
    } catch (error) {
        console.error('Error fetching trends data:', error);
    }
};

// Function to log in to Twitter
async function loginToTwitter(driver, data) {
    try {
        await driver.wait(until.elementLocated(By.name('text')), 10000);
        const emailInput = await driver.findElement(By.name('text'));
        await emailInput.sendKeys(data.email);
        await emailInput.sendKeys(Key.RETURN);
        try {
            await driver.wait(until.elementLocated(By.name('text')), 10000);
            const usernameInput = await driver.findElement(By.name('text'));
            await usernameInput.sendKeys(data.userName);
            await usernameInput.sendKeys(Key.RETURN);
        } catch (err) {
            console.warn('Username input step skipped:', err);
        }
        await driver.wait(until.elementLocated(By.name('password')), 10000);
        const passwordInput = await driver.findElement(By.name('password'));
        await passwordInput.sendKeys(data.password);
        await passwordInput.sendKeys(Key.RETURN);

        await driver.wait(until.urlContains('home'), 20000);
    } catch (error) {
        console.error('Error logging into Twitter:', error);
    }
}

// Function to fetch trending topics
async function getTrendingTopics(driver) {
    try {
        await driver.wait(until.elementLocated(By.css('section[aria-labelledby^="accessible-list-1"]')), 10000);
        const trendElements = await driver.findElements(By.css('section[aria-labelledby^="accessible-list-1"] div[role="presentation"] div span'));
        const trends = [];

        for (let element of trendElements.slice(0, 5)) {
            trends.push(await element.getText());
        }

        return trends;
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        return [];
    }
}


// Function to get the public IP address via ProxyMesh
async function getIpAddress() {
    // const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
    // console.log("Using proxy:", proxyUrl);
    // const encodedUsername = encodeURIComponent(proxyUsername);
    // const encodedPassword = encodeURIComponent(proxyPassword);
    try {
        const response = await axios.get('https://api.ipify.org?format=json')
        // , {
            // proxy: {
            //     protocol: 'http',
            //     host: proxyHost,
            //     port: proxyPort,
            //     auth: {
            //         username: encodedUsername,
            //         password: encodedPassword,
            //     },
            // },
        // });
        return response.data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error.message);
        return '';
    }
}


// Function to save trends to the database
async function saveTrendsToDatabase(trends, endTime, ipAddress) {
    const uniqueId = uuid.v4();

    const newTrend = new TrendsModel({
        unique_id: uniqueId,
        trend1: trends[0] || '',
        trend2: trends[1] || '',
        trend3: trends[2] || '',
        trend4: trends[3] || '',
        trend5: trends[4] || '',
        end_time: endTime,
        ip_address: ipAddress
    });

    try {
        await newTrend.save();
    } catch (error) {
        console.error('Error saving to database:', error);
    }
}

// Export the function to be used in Express app
module.exports = { fetchTrendsData };
