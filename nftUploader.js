// script to automatically upload and sell any number of NFTs completely for free on Opensea. Works with only metamask wallets

const chromeLauncher = require('chrome-launcher');
const axios = require('axios');
const puppeteer = require('puppeteer-core');
const path = require("path");
const fs = require("fs");
const dappeteer = require("@chainsafe/dappeteer")

// Get array containing URL paths to NFT images
const arr = require("./wordArray");
const extension_path = "my-extension/nkbihfbeogaeaoehlefnkodbefgpgknn/10.2.2_0"
const collection_name = "test-collecshun"

// Set to true to check if NFT has already been uploaded
const searchBeforeUpload = false;

(async () => {
    try {
        // Load metamask extension, replace path with your own  
        const pathToExtension = require('path').join(__dirname, extension_path);
        const newFlags = chromeLauncher.Launcher.defaultFlags().filter(flag => flag !== '--disable-extensions' && flag !== '--mute-audio');

        newFlags.push(`--start-maximized`,
            `--load-extension=${pathToExtension}`)

        // Launch chrome
        const chrome = await chromeLauncher.launch({
            ignoreDefaultFlags: true,
            chromeFlags: newFlags,
        });
        const response = await axios.get(`http://localhost:${chrome.port}/json/version`);
        const { webSocketDebuggerUrl } = response.data;

        // Copy this log somewhere after initial script run
        console.log(webSocketDebuggerUrl);

        // Connecting the instance using `browserWSEndpoint`
        // Replace "webSocketDebuggerUrl" with what you copied before second run to connect 
        // to same chrome instance where you've already logged into opensea with metamask
        const browser = await puppeteer.connect({ browserWSEndpoint: "ws://localhost:49295/devtools/browser/3a859520-e26c-40cc-a99e-5537d92186ab", defaultViewport: null });
        const page = await browser.newPage();
        page.setDefaultTimeout(0);
        // await page.goto("https://opensea.io/")
        // await page.goto(`https://opensea.io/collection/${collection_name}/assets/create`)

        // await page.waitForFunction((collection_name) => window.location.href == `https://opensea.io/collection/${collection_name}/assets/create`, {}, collection_name)

        page.setDefaultTimeout(10000)
        // create errors stream
        const stream = fs.createWriteStream(path.join(__dirname, "errors.log"), { flags: "a" })

        // Begin upload
        for (let i = 0; i < arr.length; i++) {
            console.log("beginning upload");
            let uploaded = false
            try {
                if (searchBeforeUpload) {
                    await page.goto(`https://opensea.io/collection/${collection_name}`);

                    await page.waitForSelector('input[placeholder=Search]')
                    await page.type('input[placeholder=Search]', arr[i]);
                    await page.keyboard.press('Enter');

                    try {
                        // select listing
                        await page.waitForSelector("#__next > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.FlexColumnreact__FlexColumn-sc-1wwz3hp-0.OpenSeaPagereact__DivContainer-sc-65pnmt-0.dBFmez.jYqxGr.ksFzlZ.fiudwD.App > main > div > div > div:nth-child(4) > div > div > div > div.AssetSearchView--results.collection--results > div.Blockreact__Block-sc-1xf18x6-0.dBFmez.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div > article > a > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.SpaceBetweenreact__SpaceBetween-sc-jjxyhg-0.AssetCardFooterreact__StyledContainer-sc-nedjig-0.bFcjdD.jYqxGr.gJwgfT.cBTfDg")
                        await page.click("#__next > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.FlexColumnreact__FlexColumn-sc-1wwz3hp-0.OpenSeaPagereact__DivContainer-sc-65pnmt-0.dBFmez.jYqxGr.ksFzlZ.fiudwD.App > main > div > div > div:nth-child(4) > div > div > div > div.AssetSearchView--results.collection--results > div.Blockreact__Block-sc-1xf18x6-0.dBFmez.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div > article > a > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.SpaceBetweenreact__SpaceBetween-sc-jjxyhg-0.AssetCardFooterreact__StyledContainer-sc-nedjig-0.bFcjdD.jYqxGr.gJwgfT.cBTfDg")
                        uploaded = true
                    } catch (error) {
                        if (error == "TimeoutError: waiting for selector `#__next > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.FlexColumnreact__FlexColumn-sc-1wwz3hp-0.OpenSeaPagereact__DivContainer-sc-65pnmt-0.dBFmez.jYqxGr.ksFzlZ.fiudwD.App > main > div > div > div:nth-child(4) > div > div > div > div.AssetSearchView--results.collection--results > div.Blockreact__Block-sc-1xf18x6-0.dBFmez.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div > article > a > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.SpaceBetweenreact__SpaceBetween-sc-jjxyhg-0.AssetCardFooterreact__StyledContainer-sc-nedjig-0.bFcjdD.jYqxGr.gJwgfT.cBTfDg` failed: timeout 10000ms exceeded") {
                            uploaded = false
                        }
                    }
                }

                if (uploaded) {
                    continue
                }

                await page.goto(`https://opensea.io/collection/${collection_name}/assets/create`);

                // select nft for upload
                await page.waitForSelector('input[type=file]');
                const inputUploadHandle = await page.$('input[type=file]');

                // Replace with your path
                let fileToUpload = `C:/nft/images/${arr[i]}.png`;

                inputUploadHandle.uploadFile(fileToUpload);

                // Enter data about the NFT
                await page.waitForSelector("#name")
                await page.type('#name', arr[i]);

                await page.waitForSelector("#external_link")
                await page.type('#external_link', "www.google.com", { delay: 100 });

                await page.waitForSelector("#description")
                await page.type('#description', 'This word has no meaning.');

                await page.waitForSelector('button[aria-label="Add properties"]')
                await page.click('button[aria-label="Add properties"]')

                for (let i = 0; i < 5; i++) {
                    await page.waitForSelector("body > div:nth-child(7) > div > div > div > section > button")
                    await page.click("body > div:nth-child(7) > div > div > div > section > button")
                }
                                
                const propertyFields = await page.$$('input[aria-label="Provide the property name"]')
                const valueFields = await page.$$('input[aria-label="Provide the property value"]')

                for (let i = 0; i < propertyFields.length; i++) {
                    const property = propertyFields[i];
                    const value = valueFields[i];
                 
                    await property.evaluate((property) => property.value = "A cool property name", property)
                    await value.evaluate((value) => value.value = "A cool value", value)                    
                }     
                
                // await page.waitForSelector('button[aria-label="Add levels"]')
                // await page.click('button[aria-label="Add levels"]')   
                
                const chain = await page.$('#chain')
                await chain.evaluate((chain) => chain.value = "Polygon", chain)          

                await page.waitForSelector("i[aria-label='Close']")
                await page.click("i[aria-label='Close']")
                await page.waitForTimeout(2000)

                // create button 
                await page.waitForSelector("div.AssetForm--submit button")
                await page.click("div.AssetForm--submit button")

                // cancel dialog
                await page.waitForSelector("div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.gWXeYL.jYqxGr > button")
                await page.click("div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.gWXeYL.jYqxGr > button")

                // sell button
                await page.waitForSelector("#__next > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.FlexColumnreact__FlexColumn-sc-1wwz3hp-0.OpenSeaPagereact__DivContainer-sc-65pnmt-0.dBFmez.jYqxGr.ksFzlZ.fiudwD.App > main > div > div > div.OrderManagerreact__DivContainer-sc-rw3i3h-0.gpKFGZ > div > span:nth-child(2) > a")
                await page.click("#__next > div.Blockreact__Block-sc-1xf18x6-0.Flexreact__Flex-sc-1twd32i-0.FlexColumnreact__FlexColumn-sc-1wwz3hp-0.OpenSeaPagereact__DivContainer-sc-65pnmt-0.dBFmez.jYqxGr.ksFzlZ.fiudwD.App > main > div > div > div.OrderManagerreact__DivContainer-sc-rw3i3h-0.gpKFGZ > div > span:nth-child(2) > a")

                // Change 0.001 to your desired listing price
                await page.waitForSelector('input[name=price]')
                await page.type('input[name=price]', '0.001');

                await page.waitForSelector('button[type=submit]')
                await page.click('button[type=submit]');

                // Sign sell transaction on opensea
                await page.waitForXPath("/html/body/div[4]/div/div/div/section/div/div/section/div/div/div/div/div/div/div/button")
                const [signbtn] = await page.$x("/html/body/div[4]/div/div/div/section/div/div/section/div/div/div/div/div/div/div/button")
                await signbtn.click()

                // Open metamask and sign sell transaction
                browser.on('targetcreated', async (target) => { //
                    const newpage = await target.page();
                    await newpage.waitForSelector("#app-content > div > div.main-container-wrapper > div > div.request-signature__footer > button.button.btn-secondary.btn--large.request-signature__footer__sign-button")
                    await newpage.click("#app-content > div > div.main-container-wrapper > div > div.request-signature__footer > button.button.btn-secondary.btn--large.request-signature__footer__sign-button")
                });

                // wait for confirmation
                await page.waitForFunction(() => !!document.querySelector("div.AssetSuccessModalContentreact__DivContainer-sc-1vt1rp8-1.gtISVn"))
            } catch (error) {
                // write any errors to error log
                stream.write(arr[i] + " " + '(' + error + ')' + "\n")
                console.log(error);
                continue
            }
        }
        // await browser.close();
        // await chrome.kill();
    } catch (error) {
        console.log(error);
    }
})();
